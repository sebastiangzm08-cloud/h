"use client";

/* ==========================================================================
   El "ding" estilo WhatsApp Web: mientras el panel está abierto, avisa con
   sonido apenas una conversación pasa a "espera" (el bot necesita un
   humano) — nunca en cada mensaje normal, eso sería spam de sonido.

   Escucha en vivo con Supabase Realtime — no hay nada que recargar. El
   correo (ver n8n) sigue siendo el aviso para cuando el panel NO está
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
          event: "UPDATE",
          schema: "public",
          table: "wa_conversaciones",
          filter: `cliente_id=eq.${clienteId}`,
        },
        (payload) => {
          const antes = (payload.old as FilaConversacion)?.estado;
          const ahora = (payload.new as FilaConversacion)?.estado;
          // Solo en la TRANSICIÓN hacia "espera" — si ya estaba en espera y
          // se actualiza otra cosa de la fila, no vuelve a sonar.
          if (ahora === "espera" && antes !== "espera") {
            reproducirDing();
            routerRef.current.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [clienteId]);

  return null;
}
