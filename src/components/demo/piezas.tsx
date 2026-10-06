/* ==========================================================================
   Piezas sueltas del panel de la demo. Mismos tokens que el panel real
   (`.panel-scope`), sin sesión ni base de datos.
   ========================================================================== */
import type { ReactNode } from "react";
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import { cn } from "@/lib/utils";

/** Estado vacío: dice qué falta y ofrece el siguiente paso. Nunca un "no hay nada" a secas. */
export function VacioPanel({
  icono,
  titulo,
  children,
  accion,
  className,
}: {
  icono: NombreIcono;
  titulo: string;
  children: ReactNode;
  accion?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-10 text-center", className)}>
      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--panel-acento-borde)] bg-[var(--panel-acento-fondo)] text-[color:var(--panel-acento-texto)]">
        <Icono nombre={icono} className="h-[22px] w-[22px]" />
      </span>
      <p className="mt-4 text-[15px] font-medium tracking-tight text-ink">{titulo}</p>
      <p className="mt-1.5 max-w-[38ch] text-[13px] leading-relaxed text-ink-mute">{children}</p>
      {accion ? <div className="mt-5">{accion}</div> : null}
    </div>
  );
}

/** Botón secundario de 44 px, el de los pasos siguientes. */
export function BotonPanel({
  children,
  onClick,
  tono = "acento",
}: {
  children: ReactNode;
  onClick: () => void;
  tono?: "acento" | "neutro";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full border px-5 text-[13px] font-medium whitespace-nowrap transition-[background-color,border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97]",
        tono === "acento"
          ? "border-[var(--panel-acento-borde)] bg-[var(--panel-acento-fondo)] text-[color:var(--panel-acento-texto)] hover:border-[var(--panel-acento)]"
          : "border-line-strong bg-surface-2 text-ink-soft hover:bg-surface-3"
      )}
    >
      {children}
    </button>
  );
}

/** El punto de "hay novedades", con un anillo que late. */
export function PuntoNovedad({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative inline-flex h-2 w-2 flex-none", className)}>
      <span className="demo-anillo absolute inset-0 rounded-full bg-[var(--panel-acento)]" />
      <span className="relative h-2 w-2 rounded-full bg-[var(--panel-acento)]" />
    </span>
  );
}

/** Rótulo mono de una sección dentro de una pantalla. */
export function Rotulo({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "block font-mono text-[10.5px] font-medium tracking-[0.14em] text-ink-faint uppercase",
        className
      )}
    >
      {children}
    </span>
  );
}
