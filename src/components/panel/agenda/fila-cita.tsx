"use client";

/* ==========================================================================
   Una cita de la Agenda. Una sola pieza de HTML que cambia de forma:

   - Celular y tablet: tarjeta. Hora y estado arriba, quién y qué abajo, los
     botones al final (44 px de alto, fáciles de tocar).
   - Escritorio ancho (`xl`): fila de tabla con columnas fijas — hora, detalle,
     estado y acciones. Mismo contenido, sin duplicar nada en el DOM.

   El color de la barra izquierda y de la pastilla es el del ESTADO:
   violeta confirmada, ámbar sin confirmar, verde cumplida, rojo cancelada.
   ========================================================================== */
import { useState } from "react";
import type { CitaFila } from "@/components/panel/agenda/armar";
import { BotonesCita, FormaReagendar } from "@/components/panel/agente-cita-acciones";
import { HojaModal } from "@/components/panel/clientes/hoja-modal";
import { Pildora, type TonoPildora } from "@/components/panel/clientes/piezas";
import { cn } from "@/lib/utils";

const ESTADOS: Record<CitaFila["estado"], { texto: string; tono: TonoPildora; barra: string }> = {
  confirmada: {
    texto: "Confirmada",
    tono: "acento",
    barra: "shadow-[inset_3px_0_0_var(--panel-acento)]",
  },
  sin_confirmar: {
    texto: "Sin confirmar",
    tono: "warn",
    barra: "shadow-[inset_3px_0_0_var(--color-warn)]",
  },
  cumplida: {
    texto: "Cumplida",
    tono: "ok",
    barra: "shadow-[inset_3px_0_0_var(--color-ok)]",
  },
  cancelada: {
    texto: "Cancelada",
    tono: "bad",
    barra: "shadow-[inset_3px_0_0_var(--color-bad)]",
  },
};

export function FilaCita({ cita, indice }: { cita: CitaFila; indice: number }) {
  const [reagendando, setReagendando] = useState(false);
  const e = ESTADOS[cita.estado] ?? ESTADOS.sin_confirmar;
  const activa = cita.estado === "confirmada" || cita.estado === "sin_confirmar";
  const cancelada = cita.estado === "cancelada";
  const detalle = [cita.servicio || "Cita", cita.monto].filter(Boolean).join(" · ");

  return (
    <li
      className={cn(
        "fila-entra grid grid-cols-[minmax(0,1fr)_auto] content-start items-start gap-x-3 gap-y-3 rounded-2xl border border-line bg-surface-2 p-4",
        e.barra,
        "xl:grid-cols-[92px_minmax(0,1fr)_132px_292px] xl:items-center xl:gap-x-4 xl:gap-y-0 xl:rounded-none xl:border-0 xl:border-t xl:bg-transparent xl:px-4 xl:py-3",
        "xl:first:border-t-0 xl:hover:bg-surface-3/40"
      )}
      style={{ animationDelay: `${Math.min(indice, 10) * 25}ms` }}
    >
      <p
        className={cn(
          "font-mono text-[18px] leading-none font-semibold whitespace-nowrap tabular-nums xl:text-[14px]",
          cancelada ? "text-ink-faint" : "text-ink"
        )}
      >
        {cita.hora}
      </p>

      <div className="justify-self-end xl:order-3 xl:justify-self-start">
        <Pildora tono={e.tono}>{e.texto}</Pildora>
      </div>

      <div className="col-span-2 min-w-0 xl:order-2 xl:col-span-1">
        <p
          className={cn(
            "truncate text-[14.5px] font-medium",
            cancelada ? "text-ink-faint line-through decoration-ink-faint/60" : "text-ink"
          )}
        >
          {cita.nombre}
        </p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-ink-mute">{detalle}</p>
        {cita.recordatorio ? (
          <p className="mt-0.5 text-[11.5px] leading-snug text-ink-faint">
            Recordatorio · {cita.recordatorio}
          </p>
        ) : null}
      </div>

      {activa ? (
        <div className="col-span-2 xl:order-4 xl:col-span-1">
          <BotonesCita
            citaId={cita.id}
            pasada={cita.pasada}
            nombre={cita.nombre}
            onReagendar={() => setReagendando(true)}
          />
        </div>
      ) : null}

      {reagendando ? (
        <HojaModal
          titulo="Reagendar cita"
          descripcion={`${cita.nombre} · ${cita.servicio || "Cita"}. Se le avisa por WhatsApp.`}
          onCerrar={() => setReagendando(false)}
        >
          <FormaReagendar citaId={cita.id} onCerrar={() => setReagendando(false)} />
        </HojaModal>
      ) : null}
    </li>
  );
}
