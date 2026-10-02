/* ==========================================================================
   Controles de formulario de Conocimiento y Configuración.

   Ninguno lleva estado propio: son entradas nativas (radio, checkbox,
   select) con otra cara, así que funcionan igual con teclado, lector de
   pantalla y sin JavaScript. Tamaño táctil de 44 px en todos.
   ========================================================================== */
import type { ReactNode } from "react";
import { CAMPO_LISTA, ETIQUETA } from "./estilos";
import { IconoCheck, IconoChevron, Spinner } from "./iconos-extra";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
   Interruptor
   ------------------------------------------------------------------------- */

function Pista({ activo, ocupado }: { activo: boolean; ocupado?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block h-[22px] w-[38px] flex-none rounded-full border transition-colors duration-200",
        activo ? "border-transparent bg-[var(--panel-acento)]" : "border-line-strong bg-surface-3"
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] left-[2px] grid h-4 w-4 place-items-center rounded-full shadow-sm transition-transform duration-200",
          activo ? "translate-x-4 bg-white" : "translate-x-0 bg-ink-mute",
          ocupado && "opacity-70"
        )}
      >
        {ocupado ? <Spinner className="h-2.5 w-2.5 text-[color:var(--panel-acento)]" /> : null}
      </span>
    </span>
  );
}

/**
 * Interruptor que ENVÍA el formulario al tocarlo (botón `submit` con
 * `role="switch"`). Es el que usa la lista de Conocimiento: apagar o prender
 * un servicio guarda al instante.
 */
export function InterruptorEnvio({
  activo,
  etiqueta,
  ocupado = false,
  formAction,
}: {
  activo: boolean;
  /** Qué hace el interruptor, para el lector de pantalla: "Servicio Limpieza dental". */
  etiqueta: string;
  ocupado?: boolean;
  formAction?: (datos: FormData) => void;
}) {
  return (
    <button
      type="submit"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      disabled={ocupado}
      formAction={formAction}
      className="grid h-11 w-11 flex-none place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--panel-acento-borde)] disabled:cursor-wait"
    >
      <Pista activo={activo} ocupado={ocupado} />
    </button>
  );
}

/**
 * Interruptor que es una casilla de verdad (`<input type="checkbox">`): su
 * valor viaja con el formulario. Lleva su texto al lado y toda la fila es
 * objetivo táctil.
 */
export function InterruptorCasilla({
  nombre,
  activo,
  alCambiar,
  titulo,
  ayuda,
  className,
}: {
  nombre?: string;
  /** Con `alCambiar` es controlado; sin él, arranca con este valor. */
  activo: boolean;
  alCambiar?: (activo: boolean) => void;
  titulo: ReactNode;
  ayuda?: ReactNode;
  className?: string;
}) {
  const controlado = alCambiar !== undefined;
  return (
    <label
      className={cn(
        "group flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-surface px-3.5 py-2.5",
        "transition-colors hover:border-line-strong has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[color:var(--panel-acento-borde)]",
        className
      )}
    >
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-ink-soft">{titulo}</span>
        {ayuda ? <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-mute">{ayuda}</span> : null}
      </span>
      <input
        type="checkbox"
        name={nombre}
        {...(controlado
          ? {
              checked: activo,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => alCambiar(e.target.checked),
            }
          : { defaultChecked: activo })}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "relative block h-[22px] w-[38px] flex-none rounded-full border border-line-strong bg-surface-3 transition-colors duration-200",
          "peer-checked:border-transparent peer-checked:bg-[var(--panel-acento)]"
        )}
      >
        <span className="absolute top-[2px] left-[2px] h-4 w-4 rounded-full bg-ink-mute shadow-sm transition-[transform,background-color] duration-200 group-has-[:checked]:translate-x-4 group-has-[:checked]:bg-white" />
      </span>
    </label>
  );
}

/* -------------------------------------------------------------------------
   Segmentado: pocas opciones, una a la vez
   ------------------------------------------------------------------------- */

/**
 * Elección entre 2 o 3 opciones cortas (De usted / De vos). Radios nativos
 * con la cara de un control segmentado: más rápido de tocar que abrir una
 * lista, y se ven todas las opciones a la vez.
 */
export function Segmentado({
  nombre,
  etiqueta,
  opciones,
  valor,
  ayuda,
}: {
  nombre: string;
  etiqueta: string;
  opciones: { valor: string; texto: string }[];
  valor: string;
  ayuda?: string;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className={cn(ETIQUETA, "mb-1.5")}>{etiqueta}</legend>
      <div
        className="grid gap-1 rounded-xl border border-line bg-surface p-1"
        style={{ gridTemplateColumns: `repeat(${opciones.length}, minmax(0, 1fr))` }}
      >
        {opciones.map((o) => (
          <label key={o.valor} className="relative min-w-0 cursor-pointer">
            <input
              type="radio"
              name={nombre}
              value={o.valor}
              defaultChecked={o.valor === valor}
              className="peer sr-only"
            />
            <span
              className={cn(
                "grid min-h-11 place-items-center rounded-lg px-2 text-center text-[13px] text-ink-mute transition-colors hover:text-ink",
                "peer-checked:bg-[var(--panel-acento-fondo)] peer-checked:font-medium peer-checked:text-[color:var(--panel-acento-texto)]",
                "peer-checked:shadow-[inset_0_0_0_1px_var(--panel-acento-borde)]",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--panel-acento-borde)]"
              )}
            >
              {o.texto}
            </span>
          </label>
        ))}
      </div>
      {ayuda ? <p className="mt-1.5 text-[11.5px] leading-snug text-ink-mute">{ayuda}</p> : null}
    </fieldset>
  );
}

/* -------------------------------------------------------------------------
   Lista desplegable con flechita (la nativa, pero visible)
   ------------------------------------------------------------------------- */

export function Selector({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={cn(CAMPO_LISTA, className)}>
        {children}
      </select>
      <IconoChevron className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-ink-mute" />
    </div>
  );
}

/* -------------------------------------------------------------------------
   Campo con etiqueta y ayuda
   ------------------------------------------------------------------------- */

export function Campo({
  etiqueta,
  ayuda,
  children,
  className,
}: {
  etiqueta: ReactNode;
  ayuda?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className={ETIQUETA}>{etiqueta}</span>
      {children}
      {ayuda ? <span className="block text-[11.5px] leading-snug text-ink-mute">{ayuda}</span> : null}
    </label>
  );
}

/* -------------------------------------------------------------------------
   Mensajes de estado
   ------------------------------------------------------------------------- */

/**
 * Resultado de una acción: verde si salió bien, rojo si no. `role="alert"`
 * para el error (se anuncia solo) y `role="status"` para el éxito.
 */
export function MensajeEstado({
  ok,
  children,
  className,
}: {
  ok: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      role={ok ? "status" : "alert"}
      className={cn(
        "flex items-start gap-2 rounded-xl px-3.5 py-3 text-[12.5px] leading-snug",
        ok ? "bg-ok/10 text-ok" : "bg-bad/10 text-bad",
        className
      )}
    >
      {ok ? (
        <IconoCheck className="mt-px h-4 w-4 flex-none" />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
          className="mt-px h-4 w-4 flex-none"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
      )}
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/**
 * Barra de guardado: queda pegada abajo mientras el formulario está abierto,
 * para no tener que bajar hasta el final en el celular. Respeta el área
 * segura de iOS.
 */
export function BarraGuardar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-10 flex flex-col gap-3 rounded-2xl border border-line-strong bg-surface-2/95 p-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] backdrop-blur sm:flex-row sm:items-center sm:justify-end">
      {children}
    </div>
  );
}
