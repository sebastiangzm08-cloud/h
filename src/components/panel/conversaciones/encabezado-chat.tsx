"use client";

/* ==========================================================================
   Encabezado del chat abierto.

   Celular (<768 px): botón "Chats" para volver a la lista (44 px, con texto,
   no solo una flecha) · el nombre es un botón que abre la FICHA del contacto
   en una hoja inferior · la píldora de quién atiende.
   Escritorio: la ficha ya está en la columna de la derecha (≥1536 px), así
   que el nombre ahí no hace nada; entre 768 y 1535 px sí abre la hoja.
   ========================================================================== */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Icono } from "@/components/panel/iconos";
import { ControlConversacion } from "@/components/panel/agente-control-chat";
import { Hoja } from "./hoja";
import { IconoChat } from "./iconos-chat";
import { iniciales } from "./textos";
import type { ConversacionAgente } from "@/lib/panel/agente";

export function EncabezadoChat({
  conversacion,
  agentePausado,
  volverHref,
  ficha,
}: {
  conversacion: ConversacionAgente;
  agentePausado: boolean;
  volverHref: string;
  /** La ficha ya armada en el servidor; acá solo se muestra dentro de la hoja. */
  ficha: ReactNode;
}) {
  const [fichaAbierta, setFichaAbierta] = useState(false);

  return (
    <div className="flex flex-none items-center gap-1 border-b border-line bg-surface px-1.5 py-1.5 sm:px-3 md:px-4">
      <Link
        href={volverHref}
        prefetch={false}
        aria-label="Volver a la lista de conversaciones"
        className="inline-flex h-11 flex-none items-center gap-0.5 rounded-xl pr-3 pl-1.5 text-ink-soft transition-colors hover:bg-surface-2 active:bg-surface-3 md:hidden"
      >
        <Icono nombre="flecha" className="h-[18px] w-[18px] rotate-180" />
        <span className="text-[13.5px] font-medium">Chats</span>
      </Link>

      <button
        type="button"
        onClick={() => setFichaAbierta(true)}
        aria-haspopup="dialog"
        aria-label={`Ver la ficha de ${conversacion.nombre}`}
        className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1 text-left transition-colors hover:bg-surface-2 active:bg-surface-3 2xl:pointer-events-none 2xl:hover:bg-transparent"
      >
        <span className="grid h-10 w-10 flex-none place-items-center rounded-full border border-line-strong bg-surface-3 font-mono text-[12px] text-ink-mute max-sm:hidden">
          {iniciales(conversacion.nombre)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14.5px] leading-tight font-medium text-ink">
            {conversacion.nombre}
          </span>
          <span className="mt-0.5 block truncate font-mono text-[11px] text-ink-mute">
            {conversacion.telefono ? `${conversacion.telefono} · ` : ""}WhatsApp
          </span>
        </span>
        <IconoChat nombre="chevronAbajo" className="h-4 w-4 flex-none -rotate-90 text-ink-mute 2xl:hidden" />
      </button>

      <ControlConversacion conversacion={conversacion} agentePausado={agentePausado} />

      <Hoja
        abierta={fichaAbierta}
        onCerrar={() => setFichaAbierta(false)}
        titulo="Ficha del contacto"
        descripcion="Sus datos y su historial de citas"
      >
        {ficha}
      </Hoja>
    </div>
  );
}
