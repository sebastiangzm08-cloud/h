/* ==========================================================================
   Piezas compartidas del panel. Todas usan los tokens del sitio, que dentro
   de `.panel-scope` valen los del panel (ver globals.css). Ningún color
   literal acá adentro.

   Son componentes de servidor: no llevan estado. Lo que necesite manejar
   clics vive en su propio archivo con "use client".
   ========================================================================== */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Etiqueta monoespaciada en mayúscula. El único adorno tipográfico. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
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

/** Caja base. No todo lleva caja: usala cuando algo es de verdad un objeto. */
export function Caja({
  children,
  className,
  plano = false,
}: {
  children: ReactNode;
  className?: string;
  plano?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-surface-2",
        plano ? "overflow-x-auto px-2.5 py-1.5" : "p-[18px]",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Encabezado de una caja: etiqueta + título a la izquierda, acción a la derecha. */
export function CajaHead({
  eyebrow,
  titulo,
  children,
  className,
}: {
  eyebrow?: string;
  titulo: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3.5 flex items-center justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className="mt-0.5 text-[14.5px] font-semibold tracking-tight text-ink">
          {titulo}
        </h2>
      </div>
      {children}
    </div>
  );
}

type TonoPill = "ok" | "warn" | "bad" | "idle";

/**
 * Estado en forma de pastilla. El color acá es INFORMACIÓN, no marca:
 * verde/ámbar/rojo dicen algo, y por eso no se usan en ningún otro lado.
 */
export function Pill({
  children,
  tono = "idle",
}: {
  children: ReactNode;
  tono?: TonoPill;
}) {
  const tonos: Record<TonoPill, string> = {
    ok: "text-ok bg-ok/15",
    warn: "text-warn bg-warn/15",
    bad: "text-bad bg-bad/15",
    idle: "text-ink-faint bg-surface-3",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] tracking-[0.05em] whitespace-nowrap uppercase",
        tonos[tono]
      )}
    >
      <span className="h-[5px] w-[5px] rounded-full bg-current" />
      {children}
    </span>
  );
}

/** Dato suelto en pastilla neutra: "Redes 6", "8 a.m. – 6 p.m." */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-surface-3 px-2.5 py-1 font-mono text-[11px] whitespace-nowrap text-ink-mute">
      {children}
    </span>
  );
}

/**
 * Medidor de consumo. Se pone ámbar solo del 80 % para arriba: si todo
 * grita, nada grita.
 */
export function Medidor({
  etiqueta,
  usado,
  tope,
  formato = "entero",
}: {
  etiqueta: string;
  usado: number;
  tope: number;
  formato?: "entero" | "miles";
}) {
  const pct = tope > 0 ? Math.min(100, Math.round((usado / tope) * 100)) : 0;
  const alto = pct >= 80;
  const fmt = (n: number) =>
    formato === "miles" ? n.toLocaleString("es-CR") : String(n);

  return (
    <div className="min-w-0">
      <div className="mb-[7px] flex items-baseline justify-between gap-2">
        <span className="text-xs text-ink-mute">{etiqueta}</span>
        <span className="font-mono text-xs whitespace-nowrap text-ink-soft tabular-nums">
          {fmt(usado)} / {fmt(tope)}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-surface-3"
        role="meter"
        aria-valuenow={usado}
        aria-valuemin={0}
        aria-valuemax={tope}
        aria-label={etiqueta}
      >
        {/* Ancho completo y se escala: animar `transform` no reflow. */}
        <div
          className={cn(
            "medidor-barra h-full w-full rounded-full",
            alto ? "bg-warn" : "bg-ink-soft"
          )}
          style={{ "--pct": pct / 100 } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

/** Aviso en bloque. `tono` cambia el color, no el peso visual. */
export function Nota({
  children,
  tono = "neutro",
  className,
}: {
  children: ReactNode;
  tono?: "neutro" | "ok" | "warn";
  className?: string;
}) {
  const tonos = {
    neutro: "bg-surface-3 text-ink-faint",
    ok: "text-ok bg-ok/10",
    warn: "text-warn bg-warn/10",
  } as const;
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl px-4 py-3.5 text-[13px] leading-snug",
        tonos[tono],
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
        className="mt-0.5 h-4 w-4 flex-none"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16h.01" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

/** Título de pantalla. Una sola línea de jerarquía, sin héroes gigantes. */
export function PageHead({
  titulo,
  sub,
  children,
  descripcion,
}: {
  titulo: string;
  sub?: string;
  children?: ReactNode;
  descripcion?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-3">
      <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">
        {titulo}
      </h1>
      {sub ? (
        <span className="font-mono text-[11px] tracking-wide text-ink-faint">
          {sub}
        </span>
      ) : null}
      {children}
      {descripcion ? (
        <p className="mt-0 max-w-[66ch] basis-full text-[13px] text-ink-faint">
          {descripcion}
        </p>
      ) : null}
    </div>
  );
}

/** Formatea colones como en el resto del sitio. */
export function colones(n: number) {
  return "₡" + n.toLocaleString("es-CR");
}

/** Precio mensual de una automatización: "₡50.000/mes" o "A cotizar". */
export function precioMensualTexto(precio: number | null) {
  return precio == null ? "A cotizar" : `${colones(precio)}/mes`;
}
