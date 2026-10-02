/* ==========================================================================
   Franja de los próximos 7 días de la Agenda. Cada día con citas es un
   enlace que baja a su sección (`#dia-AAAA-MM-DD`); los días vacíos se
   muestran apagados. En celular se desliza de lado dentro de su propia caja,
   así la página nunca se ensancha.
   ========================================================================== */
import type { DiaSemana } from "@/components/panel/agenda/armar";
import { cn } from "@/lib/utils";

export function SemanaProxima({ dias }: { dias: DiaSemana[] }) {
  return (
    <nav
      aria-label="Próximos 7 días"
      className="scroll-fino -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-7 sm:gap-2.5 sm:overflow-visible sm:px-0 sm:pb-0"
    >
      {dias.map((d) => {
        const tiene = d.cantidad > 0;
        const clases = cn(
          "flex min-h-[78px] w-[58px] flex-none flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-2.5 transition-colors sm:w-auto",
          d.esHoy
            ? "border-[var(--panel-acento-borde)] bg-[var(--panel-acento-fondo)]"
            : "border-line bg-surface-2",
          tiene ? "hover:border-line-strong hover:bg-surface-3/60" : "opacity-60"
        );
        const interior = (
          <>
            <span
              className={cn(
                "font-mono text-[10.5px] tracking-[0.08em] uppercase",
                d.esHoy ? "text-[color:var(--panel-acento-texto)]" : "text-ink-faint"
              )}
            >
              {d.corto}
            </span>
            <span className="text-[19px] leading-none font-semibold tracking-[-0.02em] text-ink tabular-nums">
              {d.numero}
            </span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 font-mono text-[10.5px] leading-none tabular-nums",
                tiene ? "bg-ink text-paper" : "text-ink-faint"
              )}
            >
              {tiene ? d.cantidad : "—"}
            </span>
          </>
        );

        return tiene ? (
          <a
            key={d.clave}
            href={`#dia-${d.clave}`}
            aria-label={`${d.largo}: ${d.cantidad} ${d.cantidad === 1 ? "cita" : "citas"}`}
            className={clases}
          >
            {interior}
          </a>
        ) : (
          <div key={d.clave} role="img" aria-label={`${d.largo}: sin citas`} className={clases}>
            {interior}
          </div>
        );
      })}
    </nav>
  );
}
