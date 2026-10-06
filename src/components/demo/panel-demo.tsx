"use client";

/* ==========================================================================
   El panel de la demo: la misma estética que el panel real del cliente
   (`.panel-scope`: casi negro, violeta solo en lo activo, verde/ámbar como
   información), con sus tres pantallas — Conversaciones, Agenda y
   Resultados — pero presentacional: no usa sesión ni base de datos.

   Todo lo que muestra sale de la conversación de prueba. Cada pantalla que
   recibe algo nuevo mientras no se está viendo lleva un punto violeta.
   ========================================================================== */
import { useRef, type KeyboardEvent } from "react";
import "@/components/panel/panel-tokens.css";
import "./demo.css";
import { ConstellationMark } from "@/components/constellation";
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import { cn } from "@/lib/utils";
import type { CitaFila, MensajeDemo, Metricas, Novedades, SubVista } from "./estado";
import { PuntoNovedad } from "./piezas";
import { VistaAgenda } from "./vista-agenda";
import { VistaConversaciones } from "./vista-conversaciones";
import { VistaResultados } from "./vista-resultados";

const PESTANAS: { clave: SubVista; largo: string; corto: string; icono: NombreIcono }[] = [
  { clave: "conversaciones", largo: "Conversaciones", corto: "Chats", icono: "mensajes" },
  { clave: "agenda", largo: "Agenda", corto: "Agenda", icono: "calendario" },
  { clave: "resultados", largo: "Resultados", corto: "Resultados", icono: "reporte" },
];

export function PanelDemo({
  subvista,
  onSubvista,
  novedades,
  pendientes,
  mensajes,
  citas,
  metricas,
  restantes,
  tope,
  onIrAlChat,
}: {
  subvista: SubVista;
  onSubvista: (v: SubVista) => void;
  novedades: Novedades;
  /** Conversaciones que esperan a una persona (el número ámbar del menú real). */
  pendientes: number;
  mensajes: MensajeDemo[];
  citas: CitaFila[];
  metricas: Metricas;
  restantes: number;
  tope: number;
  onIrAlChat: (texto?: string) => void;
}) {
  const refs = useRef<Record<SubVista, HTMLButtonElement | null>>({
    conversaciones: null,
    agenda: null,
    resultados: null,
  });

  function teclado(e: KeyboardEvent, i: number) {
    let destino = -1;
    if (e.key === "ArrowRight") destino = (i + 1) % PESTANAS.length;
    else if (e.key === "ArrowLeft") destino = (i - 1 + PESTANAS.length) % PESTANAS.length;
    else if (e.key === "Home") destino = 0;
    else if (e.key === "End") destino = PESTANAS.length - 1;
    if (destino < 0) return;
    e.preventDefault();
    const clave = PESTANAS[destino].clave;
    onSubvista(clave);
    refs.current[clave]?.focus();
  }

  return (
    <div
      className="panel-scope @container flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-line-strong bg-paper text-ink shadow-[0_40px_100px_-40px_rgba(124,92,255,0.3)]"
      data-tema="oscuro"
    >
      {/* barra de marca */}
      <div className="flex flex-none items-center gap-2.5 border-b border-line bg-surface px-4 py-3">
        <ConstellationMark className="h-[22px] w-[22px] text-ink" />
        <b className="text-[15px] font-semibold tracking-tight text-ink">Hoshizora</b>
        <span className="rounded-full border border-line-strong px-[7px] py-0.5 font-mono text-[9.5px] tracking-[0.11em] text-ink-faint uppercase">
          Panel
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--panel-acento-borde)] bg-[var(--panel-acento-fondo)] px-2.5 py-1 font-mono text-[10px] tracking-[0.08em] text-[color:var(--panel-acento-texto)] uppercase">
          <span className="h-[5px] w-[5px] rounded-full bg-current" aria-hidden="true" />
          Demostración
        </span>
      </div>

      {/* pantallas */}
      <div
        role="tablist"
        aria-label="Pantallas del panel"
        className="flex flex-none gap-1.5 border-b border-line bg-surface p-2"
      >
        {PESTANAS.map((p, i) => {
          const activa = p.clave === subvista;
          const hayNovedad = !activa && novedades[p.clave] > 0;
          return (
            <button
              key={p.clave}
              ref={(el) => {
                refs.current[p.clave] = el;
              }}
              type="button"
              role="tab"
              id={`demo-tab-${p.clave}`}
              aria-selected={activa}
              aria-controls="demo-panel-pantalla"
              tabIndex={activa ? 0 : -1}
              onClick={() => onSubvista(p.clave)}
              onKeyDown={(e) => teclado(e, i)}
              aria-label={
                hayNovedad ? `${p.largo}, con novedades` : p.clave === "conversaciones" && pendientes > 0 ? `${p.largo}, ${pendientes} pendiente` : p.largo
              }
              className={cn(
                "relative flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border px-1.5 text-[12.5px] whitespace-nowrap @[470px]:gap-2 @[470px]:px-2 @[470px]:text-[13px] transition-[background-color,border-color,color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97]",
                activa
                  ? "border-[var(--panel-acento-borde)] bg-[var(--panel-acento-fondo)] font-medium text-[color:var(--panel-acento-texto)]"
                  : "border-transparent text-ink-mute hover:bg-surface-2 hover:text-ink-soft"
              )}
            >
              <Icono nombre={p.icono} className="h-4 w-4 flex-none @max-[419px]:hidden" />
              <span className="truncate @[470px]:hidden">{p.corto}</span>
              <span className="hidden truncate @[470px]:inline">{p.largo}</span>
              {p.clave === "conversaciones" && pendientes > 0 ? (
                <span
                  key={pendientes}
                  className="demo-pop grid h-[18px] min-w-[18px] flex-none place-items-center rounded-full bg-warn/15 px-1 font-mono text-[10.5px] text-warn"
                >
                  {pendientes}
                </span>
              ) : null}
              {hayNovedad ? (
                <span className="absolute top-2 right-2 flex">
                  <PuntoNovedad />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        id="demo-panel-pantalla"
        role="tabpanel"
        aria-labelledby={`demo-tab-${subvista}`}
        className="min-h-0 flex-1"
      >
        {subvista === "conversaciones" ? (
          <VistaConversaciones mensajes={mensajes} citas={citas} onIrAlChat={onIrAlChat} />
        ) : subvista === "agenda" ? (
          <VistaAgenda citas={citas} onIrAlChat={onIrAlChat} />
        ) : (
          <VistaResultados metricas={metricas} restantes={restantes} tope={tope} onIrAlChat={onIrAlChat} />
        )}
      </div>

      <p className="flex-none border-t border-line bg-surface px-4 py-2 text-center font-mono text-[10.5px] tracking-[0.04em] text-ink-faint">
        Demostración · no se guarda nada real
      </p>
    </div>
  );
}
