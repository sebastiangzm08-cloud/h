/* ==========================================================================
   Piezas propias del entorno del agente. Mismos tokens que el resto del
   panel; acá solo vive lo que este entorno usa y el panel no.
   ========================================================================== */
import type { ReactNode } from "react";
import { Eyebrow } from "@/components/panel/ui";
import { cn } from "@/lib/utils";

/** Cabecera de pantalla del entorno. Una sola línea de jerarquía. */
export function Cabecera({
  eyebrow,
  titulo,
  descripcion,
  children,
}: {
  eyebrow: string;
  titulo: string;
  descripcion?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-6 py-6 md:px-8">
      <div className="min-w-0">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-2 text-[26px] font-medium tracking-[-0.02em] text-balance text-ink">
          {titulo}
        </h1>
        {descripcion ? (
          <p className="mt-1.5 max-w-[62ch] text-[13.5px] text-ink-mute">{descripcion}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** Cuerpo estándar de una pantalla del entorno. */
export function Cuerpo({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-6 py-6 md:px-8", className)}>{children}</div>;
}

/** Panel con encabezado. El equivalente a `Caja` pero con cabecera partida. */
export function Bloque({
  titulo,
  sub,
  accion,
  children,
  className,
}: {
  titulo: string;
  sub?: string;
  accion?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-xl border border-line bg-surface", className)}>
      <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3.5">
        <div className="min-w-0">
          <h2 className="text-[13px] font-medium text-ink">{titulo}</h2>
          {sub ? <p className="mt-0.5 text-xs text-ink-faint">{sub}</p> : null}
        </div>
        {accion}
      </div>
      {children}
    </section>
  );
}

/** Fila clave → valor. La usan "Qué sabe", "Cómo responde" y "Conexión". */
export function Fila({ k, v }: { k: ReactNode; v: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-line px-4 py-2.5 [&+&]:border-t">
      <span className="text-[13px] text-ink-soft">{k}</span>
      <span className="text-right font-mono text-[13px] text-ink tabular-nums">{v}</span>
    </div>
  );
}

/**
 * Aviso de datos de ejemplo. Aparece mientras el SQL del agente no esté
 * corrido. Es deliberadamente visible: mostrar números inventados sin decirlo
 * es la forma más rápida de que alguien tome una decisión con datos falsos.
 */
export function AvisoEjemplo({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="mx-6 mt-6 rounded-xl border border-dashed border-line-strong bg-surface px-4 py-3 text-[12.5px] text-ink-faint md:mx-8">
      Datos de ejemplo. Se vuelven reales en cuanto se corra{" "}
      <code className="font-mono text-ink-mute">supabase/agente-whatsapp.sql</code> y el
      agente empiece a recibir mensajes.
    </div>
  );
}

/** Estado vacío honesto: dice qué falta, no "no hay nada". */
export function Vacio({ children }: { children: ReactNode }) {
  return (
    <p className="px-4 py-10 text-center text-[13px] text-ink-faint">{children}</p>
  );
}

const TONOS_ESTADO = {
  agendado: "border-line-strong text-ink-soft",
  cliente: "border-ok/40 bg-ok/10 text-ok",
  perdido: "border-bad/35 bg-bad/10 text-bad",
  neutro: "border-line-strong bg-surface-3 text-ink-mute",
} as const;

/** Pastilla de estado del embudo. Más ancha que `Pill`, sin punto. */
export function EstadoPill({
  children,
  tono = "neutro",
}: {
  children: ReactNode;
  tono?: keyof typeof TONOS_ESTADO;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2.5 py-0.5 text-[11px] whitespace-nowrap",
        TONOS_ESTADO[tono]
      )}
    >
      {children}
    </span>
  );
}

/** Etiqueta libre del contacto. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded border border-line-strong bg-surface-3 px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.04em] text-ink-faint uppercase">
      {children}
    </span>
  );
}
