"use client";

/* ==========================================================================
   Dos cosas en un solo canal de Realtime, porque las dos escuchan el mismo
   evento (cualquier UPDATE en `wa_conversaciones` de este cliente):

   1. El "ding" estilo WhatsApp Web: suena SOLO en la transición hacia
      "espera" (el bot necesita un humano) — nunca en cada mensaje normal,
      eso sería spam de sonido.
   2. Refrescar la pantalla — CUALQUIER actividad (mensaje nuevo, cambio de
      estado, lo que sea) actualiza la vista sola. Antes esto solo pasaba en
      la escalada; "Conversaciones" se quedaba pegada con lo último cargado
      hasta que alguien recargaba la página a mano o le daba clic de nuevo
      al hilo — encontrado probando en vivo con un cliente real.

   Escucha en vivo con Supabase Realtime — no hay nada que recargar a mano.
   El correo (ver n8n) sigue siendo el aviso para cuando el panel NO está
   abierto; las dos cosas se complementan, igual que WhatsApp Web.

   Necesita que `wa_conversaciones` tenga REPLICA IDENTITY FULL y esté
   agregada a la publicación `supabase_realtime` — sin eso, Realtime no
   manda los cambios (no truena, simplemente nunca suena). Ver el SQL que
   quedó pendiente de correr.
   ========================================================================== */
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabaseNavegador } from "@/lib/supabase/navegador";
import { reproducirDing } from "@/lib/panel/sonido";

type FilaConversacion = { estado?: string };

export function SonidoEscalamiento({ clienteId }: { clienteId: string }) {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    if (!clienteId) return;

    const supabase = supabaseNavegador();
    const canal = supabase
      .channel(`escalamientos-${clienteId}`)
      .on(
        "postgres_changes",
        {
          // "*" (no solo UPDATE): el PRIMER mensaje de un contacto nuevo
          // crea la fila de una vez (INSERT), no la actualiza — con solo
          // UPDATE, esa conversación nunca aparecía sola la primera vez.
          event: "*",
          schema: "public",
          table: "wa_conversaciones",
          filter: `cliente_id=eq.${clienteId}`,
        },
        (payload) => {
          const antes = (payload.old as FilaConversacion)?.estado;
          const ahora = (payload.new as FilaConversacion)?.estado;
          // El sonido solo en la TRANSICIÓN hacia "espera" — si ya estaba en
          // espera y se actualiza otra cosa de la fila, no vuelve a sonar.
          if (ahora === "espera" && antes !== "espera") {
            reproducirDing();
          }
          // El refresco, en cambio, en CUALQUIER cambio — es lo que hace que
          // un mensaje nuevo aparezca solo sin recargar la página.
          routerRef.current.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [clienteId]);

  return null;
}
