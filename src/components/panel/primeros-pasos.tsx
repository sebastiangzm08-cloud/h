/* ==========================================================================
   Primeros pasos — checklist de arranque para un cliente nuevo.

   Se muestra en Inicio SOLO mientras falte algo. Cuando están todos, la
   página no lo renderiza (ver panel/page.tsx).
   ========================================================================== */
import Link from "next/link";
import { Caja } from "@/components/panel/ui";
import type { PasoOnboarding } from "@/lib/panel/datos";
import { cn } from "@/lib/utils";

export function PrimerosPasos({
  pasos,
  nombre,
}: {
  pasos: PasoOnboarding[];
  nombre?: string;
}) {
  const hechos = pasos.filter((p) => p.hecho).length;
  const siguiente = pasos.find((p) => !p.hecho)?.clave;
  const recienEmpieza = hechos === 0;

  return (
    <Caja className="border-ink-faint/40 bg-white/[0.02]">
      <div className="mb-3.5 flex items-baseline justify-between gap-3">
        <div>
          <p className="text-[10.5px] font-medium tracking-[0.14em] text-ink-faint uppercase">
            Primeros pasos
          </p>
          <h2 className="mt-0.5 text-[14.5px] font-semibold tracking-tight text-ink">
            {recienEmpieza
              ? `Bienvenido${nombre ? `, ${nombre}` : ""}`
              : "Dejá tu automatización lista"}
          </h2>
          {recienEmpieza ? (
            <p className="mt-1 text-[12px] leading-relaxed text-ink-mute">
              {pasos.length === 1
                ? "Un paso y tu automatización arranca a trabajar con lo que le contés."
                : "Tres pasos y tu automatización queda publicando sola. Toma unos minutos."}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 font-mono text-[11.5px] text-ink-mute">
          {hechos}/{pasos.length}
        </span>
      </div>

      <ol className="flex flex-col">
        {pasos.map((p, i) => {
          const esSiguiente = p.clave === siguiente;
          return (
            <li
              key={p.clave}
              className={cn(
                "flex items-start gap-3 py-3",
                i < pasos.length - 1 && "border-b border-line"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-medium",
                  p.hecho
                    ? "bg-ok/15 text-ok"
                    : esSiguiente
                      ? "bg-ink text-paper"
                      : "bg-surface-3 text-ink-faint"
                )}
              >
                {p.hecho ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-[13px]",
                    p.hecho ? "text-ink-faint line-through" : "text-ink-soft"
                  )}
                >
                  {p.titulo}
                </p>
                {!p.hecho ? (
                  <p className="mt-0.5 text-[11.5px] text-ink-faint">{p.detalle}</p>
                ) : null}
              </div>

              {!p.hecho ? (
                <Link
                  href={p.href}
                  className={cn(
                    "mt-px shrink-0 rounded-full px-3 py-1 text-[11.5px] font-medium transition-colors",
                    esSiguiente
                      ? "bg-ink text-paper hover:bg-ink-soft"
                      : "text-ink-mute hover:text-ink"
                  )}
                >
                  {esSiguiente ? "Empezar" : "Ir"}
                </Link>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Caja>
  );
}
