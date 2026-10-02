/* ==========================================================================
   Piezas compartidas de la pantalla "Resultados". Sin estado y sin imports
   de servidor: las puede usar tanto un componente de servidor como el cliente
   de "Recuperación".
   ========================================================================== */
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CargaEnlace } from "./carga-enlace";

/* -------------------------------------------------------------------------
   Íconos sueltos (trazo de 1.7, como `iconos.tsx`; acá viven porque son de
   esta pantalla y no del menú).
   ------------------------------------------------------------------------- */

function Svg({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function IconoFlechaAbajo({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </Svg>
  );
}

export function IconoCopiar({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </Svg>
  );
}

export function IconoExterno({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M14 4h6v6M20 4 10 14M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </Svg>
  );
}

export function IconoChevron({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function IconoAlerta({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 10v4M12 17.2h.01" />
    </Svg>
  );
}

export function IconoInfo({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </Svg>
  );
}

/* -------------------------------------------------------------------------
   Selector de período (solo afecta al embudo). Son enlaces: la pantalla se
   arma en el servidor. Objetivo táctil de 44 px en celular.
   ------------------------------------------------------------------------- */

export function SelectorRango({ rango }: { rango: 7 | 30 }) {
  return (
    <nav
      aria-label="Período del embudo"
      className="inline-flex items-center gap-0.5 rounded-[11px] border border-line bg-surface p-0.5"
    >
      {([7, 30] as const).map((r) => (
        <Link
          key={r}
          href={`/panel/agente/resultados?rango=${r}`}
          prefetch={false}
          scroll={false}
          aria-current={r === rango ? "true" : undefined}
          className={cn(
            "flex min-h-11 flex-none items-center rounded-[9px] px-4 font-mono text-[12px] whitespace-nowrap transition-colors sm:min-h-8 sm:px-3 sm:text-[11px]",
            r === rango ? "bg-surface-3 text-ink" : "text-ink-mute hover:text-ink"
          )}
        >
          {r} días
          <CargaEnlace />
        </Link>
      ))}
    </nav>
  );
}

/* -------------------------------------------------------------------------
   Estados
   ------------------------------------------------------------------------- */

/** Cuando una lectura falló: se dice, no se muestra un 0 que parezca verdad. */
export function NoDisponible({ que }: { que: string }) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-warn/30 bg-warn/[0.07] px-4 py-3.5 text-[13px] leading-snug text-ink-soft"
    >
      <IconoAlerta className="mt-0.5 h-4 w-4 flex-none text-warn" />
      <span>
        <b className="font-medium text-ink">No pudimos leer {que} en este momento.</b> No es que no haya datos: la
        consulta falló. Recargá la página en un momento; si sigue igual, avisanos por Soporte.
      </span>
    </div>
  );
}

export function EstadoVacio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-4 py-7 text-center">
      <p className="text-[13px] text-ink-soft">{titulo}</p>
      {children ? <p className="mx-auto mt-1 max-w-[52ch] text-[12px] leading-relaxed text-ink-mute">{children}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------
   "Cómo se calcula": las definiciones a la vista, en un desplegable. Es parte
   del producto: nadie debería tomar una cifra por lo que no es.
   ------------------------------------------------------------------------- */

export function Calculo({ titulo = "Cómo se calcula", children }: { titulo?: string; children: ReactNode }) {
  return (
    <details className="group mt-4 border-t border-line pt-1">
      <summary className="-mx-1 flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 text-[12.5px] font-medium text-ink-mute transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
        {titulo}
        <IconoChevron className="h-4 w-4 flex-none transition-transform duration-150 group-open:rotate-180" />
      </summary>
      <div className="flex flex-col gap-2 pb-1 text-[12px] leading-relaxed text-ink-mute [&_b]:text-ink">{children}</div>
    </details>
  );
}

/* -------------------------------------------------------------------------
   Cifra con etiqueta (mismo lenguaje que "Impacto" del Inicio)
   ------------------------------------------------------------------------- */

export function Dato({
  etiqueta,
  valor,
  nota,
  acento = false,
  notaSoloEscritorio = false,
  className,
}: {
  etiqueta: string;
  valor: string;
  nota?: ReactNode;
  /** Resalta la cifra con el color del panel. */
  acento?: boolean;
  /** En celular la nota se esconde para que la cifra ocupe poco. */
  notaSoloEscritorio?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 rounded-xl border border-line bg-surface px-3.5 py-3", className)}>
      <p className="text-[11.5px] leading-tight text-ink-mute">{etiqueta}</p>
      <p
        className={cn(
          "mt-1.5 text-[22px] leading-none font-semibold tracking-[-0.02em] tabular-nums",
          acento ? "text-[color:var(--panel-acento-texto)]" : "text-ink"
        )}
      >
        {valor}
      </p>
      {nota ? (
        <p className={cn("mt-1.5 text-[11px] leading-snug text-ink-mute", notaSoloEscritorio && "hidden sm:block")}>{nota}</p>
      ) : null}
    </div>
  );
}

export function iniciales(nombre: string) {
  /* Un teléfono o un emoji no dan iniciales: solo palabras que empiezan con letra. */
  const partes = nombre
    .trim()
    .split(/\s+/)
    .filter((p) => /^\p{L}/u.test(p));
  const texto = (partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "");
  return texto ? texto.toUpperCase() : "·";
}

export function entero(n: number) {
  return n.toLocaleString("es-CR");
}
