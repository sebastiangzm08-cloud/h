"use client";

/* ==========================================================================
   Selector de hora propio, con a. m. y p. m. — pedido de Sebastian
   (2026-10-18): el `<input type="time">` toma el formato del sistema, y en
   su computadora salía en hora militar sin forma de poner a. m./p. m.; en el
   celular abre la ruedita del sistema, que es incómoda.

   Un botón con la hora escrita ("9:30 a. m.") abre un panel con las horas
   del 1 al 12, los minutos y a. m./p. m. El panel es un `popover` nativo:
   se dibuja por encima de todo (también dentro de una hoja modal con
   scroll, donde un menú normal quedaría recortado) y se cierra solo con
   Escape o tocando afuera.

   Al servidor le llega exactamente lo mismo que antes: "HH:MM" en 24 h, con
   el mismo `name`. Por eso las acciones no se tocan.
   ========================================================================== */
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icono } from "./iconos";
import { cn } from "@/lib/utils";
import "./selector-hora.css";

type Periodo = "am" | "pm";
type Hora = { h12: number; min: number; periodo: Periodo };
type Borrador = { h12: number | null; min: number; periodo: Periodo | null };

const HORAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MARGEN = 8;

function leer(v?: string): Borrador {
  const m = /^(\d{1,2}):(\d{2})/.exec(v ?? "");
  const h = m ? Number(m[1]) : NaN;
  const min = m ? Number(m[2]) : NaN;
  if (!m || h > 23 || min > 59) return { h12: null, min: 0, periodo: null };
  return { h12: h % 12 === 0 ? 12 : h % 12, min, periodo: h < 12 ? "am" : "pm" };
}

/* Si todavía no eligió a. m./p. m., se adivina por la hora: de 7 a 11 es
   de mañana y de 12 a 6 de tarde, que es como trabaja casi cualquier
   consultorio. Siempre se puede cambiar con un toque. */
function periodoSugerido(h12: number): Periodo {
  return h12 >= 7 && h12 <= 11 ? "am" : "pm";
}

function completa(b: Borrador): Hora | null {
  return b.h12 === null ? null : { h12: b.h12, min: b.min, periodo: b.periodo ?? periodoSugerido(b.h12) };
}

function a24(h: Hora) {
  const horas = (h.h12 % 12) + (h.periodo === "pm" ? 12 : 0);
  return `${String(horas).padStart(2, "0")}:${String(h.min).padStart(2, "0")}`;
}

function texto(h: Hora) {
  return `${h.h12}:${String(h.min).padStart(2, "0")} ${h.periodo === "am" ? "a. m." : "p. m."}`;
}

const CHIP =
  "h-10 rounded-lg border text-[14px] tabular-nums transition-colors duration-150 " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--panel-acento)]";
const CHIP_ACTIVO =
  "border-[color:var(--panel-acento-borde)] bg-[color:var(--panel-acento-fondo)] font-semibold text-[color:var(--panel-acento-texto)]";
const CHIP_NORMAL = "border-transparent text-ink-soft hover:bg-surface-2 hover:text-ink";

export function SelectorHora({
  name,
  defaultValue,
  required,
  disabled,
  paso = 15,
  claseCampo,
  className,
  placeholder = "Elegir hora",
  etiqueta = "Hora",
}: {
  name: string;
  /** "HH:MM" en 24 h, como lo guarda la base. */
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  /** Cada cuántos minutos se puede elegir. */
  paso?: number;
  /** Clase del campo del formulario donde vive, para que se vea igual que sus vecinos. */
  claseCampo: string;
  /** Ancho y acomodo del bloque completo. */
  className?: string;
  placeholder?: string;
  /** Para lectores de pantalla: "Lunes: abre", "Hora", etc. */
  etiqueta?: string;
}) {
  const [borrador, setBorrador] = useState<Borrador>(() => leer(defaultValue));
  const [falta, setFalta] = useState(false);
  const idPanel = `hora-${useId().replace(/:/g, "")}`;
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const hora = completa(borrador);
  const minutos = Array.from({ length: Math.ceil(60 / paso) }, (_, i) => i * paso);
  if (!minutos.includes(borrador.min)) minutos.push(borrador.min);
  minutos.sort((a, b) => a - b);

  /* Debajo del campo; si no cabe, encima; y nunca fuera de la pantalla. */
  useEffect(() => {
    const p = panel.current;
    if (!p) return;
    const ubicar = () => {
      const b = boton.current;
      if (!b || !p.matches(":popover-open")) return;
      const r = b.getBoundingClientRect();
      const ancho = document.documentElement.clientWidth;
      const alto = window.innerHeight;
      const w = p.offsetWidth;
      const h = p.offsetHeight;
      let top = r.bottom + 6;
      if (top + h > alto - MARGEN) top = r.top - h - 6 >= MARGEN ? r.top - h - 6 : Math.max(MARGEN, alto - h - MARGEN);
      p.style.left = `${Math.min(Math.max(MARGEN, r.left), ancho - w - MARGEN)}px`;
      p.style.top = `${top}px`;
    };
    const alCambiar = (e: Event) => {
      if ((e as ToggleEvent).newState !== "open") {
        window.removeEventListener("scroll", ubicar, true);
        window.removeEventListener("resize", ubicar);
        return;
      }
      ubicar();
      window.addEventListener("scroll", ubicar, true);
      window.addEventListener("resize", ubicar);
      const elegido = p.querySelector<HTMLButtonElement>('[aria-pressed="true"]') ?? p.querySelector("button");
      elegido?.focus({ preventScroll: true });
    };
    p.addEventListener("toggle", alCambiar);
    return () => {
      p.removeEventListener("toggle", alCambiar);
      window.removeEventListener("scroll", ubicar, true);
      window.removeEventListener("resize", ubicar);
    };
  }, []);

  const cambiar = (b: Borrador) => {
    setBorrador(b);
    if (b.h12 !== null) setFalta(false);
  };

  /* Flechas sobre el campo cerrado: sube o baja de a `paso` minutos, sin abrir nada. */
  const conTeclado = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const actual = hora ? a24(hora) : "09:00";
    const [hh, mm] = actual.split(":").map(Number);
    const total = (((hh * 60 + mm + (hora ? (e.key === "ArrowUp" ? paso : -paso) : 0)) % 1440) + 1440) % 1440;
    cambiar(leer(`${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`));
  };

  return (
    <div className={cn("relative min-w-0", className)}>
      <button
        ref={boton}
        type="button"
        popoverTarget={idPanel}
        disabled={disabled}
        onKeyDown={conTeclado}
        aria-haspopup="dialog"
        aria-label={`${etiqueta}: ${hora ? texto(hora) : "sin elegir"}`}
        aria-describedby={falta ? `${idPanel}-falta` : undefined}
        className={cn(claseCampo, "text-left", falta && "border-bad")}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Icono nombre="reloj" className="h-4 w-4 flex-none text-ink-faint" />
          <span className={cn("min-w-0 flex-1 truncate tabular-nums", !hora && "text-ink-faint")}>
            {hora ? texto(hora) : placeholder}
          </span>
          <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 flex-none text-ink-faint">
            <path d="m6 8 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {/* Lo que viaja en el formulario. No es `type="hidden"` para que el
          navegador respete el `required`; si falta, se avisa en el campo
          visible en vez del globito del navegador sobre un campo invisible. */}
      <input
        tabIndex={-1}
        aria-hidden="true"
        name={name}
        value={hora ? a24(hora) : ""}
        onChange={() => {}}
        required={required}
        disabled={disabled}
        onInvalid={(e) => {
          e.preventDefault();
          setFalta(true);
          boton.current?.focus();
        }}
        className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0"
      />
      {falta ? <p id={`${idPanel}-falta`} className="mt-1 text-[12px] text-bad">Elegí una hora.</p> : null}

      <div
        ref={panel}
        id={idPanel}
        popover="auto"
        role="dialog"
        aria-label={`Elegir ${etiqueta.toLowerCase()}`}
        className="selector-hora fixed inset-auto m-0 w-[17rem] max-w-[calc(100vw-16px)] rounded-2xl border border-line-strong bg-surface p-3 text-ink shadow-[0_18px_44px_-14px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-baseline justify-between px-1 pb-2">
          <span className="text-[11px] font-medium tracking-[0.08em] text-ink-mute uppercase">Hora</span>
          <span className="text-[15px] font-semibold tabular-nums">{hora ? texto(hora) : "—"}</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {HORAS.map((h) => (
            <button
              key={h}
              type="button"
              aria-pressed={borrador.h12 === h}
              onClick={() => cambiar({ ...borrador, h12: h })}
              className={cn(CHIP, borrador.h12 === h ? CHIP_ACTIVO : CHIP_NORMAL)}
            >
              {h}
            </button>
          ))}
        </div>

        <span className="mt-3 block px-1 pb-1.5 text-[11px] font-medium tracking-[0.08em] text-ink-mute uppercase">
          Minutos
        </span>
        <div className="grid grid-cols-4 gap-1">
          {minutos.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={borrador.min === m}
              aria-label={`${m} minutos`}
              onClick={() => cambiar({ ...borrador, min: m })}
              className={cn(CHIP, borrador.min === m ? CHIP_ACTIVO : CHIP_NORMAL)}
            >
              :{String(m).padStart(2, "0")}
            </button>
          ))}
        </div>

        <div
          role="group"
          aria-label="Mañana o tarde"
          className="mt-3 grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface-2 p-1"
        >
          {(["am", "pm"] as const).map((p) => {
            const activo = hora?.periodo === p;
            return (
              <button
                key={p}
                type="button"
                aria-pressed={activo}
                onClick={() => cambiar({ ...borrador, periodo: p })}
                className={cn(
                  "min-h-10 rounded-lg px-2 text-[13.5px] font-medium transition-colors duration-150",
                  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--panel-acento)]",
                  activo ? "bg-ink text-paper" : "text-ink-mute hover:text-ink"
                )}
              >
                {p === "am" ? "a. m." : "p. m."}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          popoverTarget={idPanel}
          popoverTargetAction="hide"
          className="mt-3 min-h-10 w-full rounded-xl bg-[color:var(--panel-acento)] text-[13.5px] font-medium text-white transition-[filter] duration-150 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--panel-acento)]"
        >
          Listo
        </button>
      </div>
    </div>
  );
}
