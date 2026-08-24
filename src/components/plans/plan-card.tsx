import { Check } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { colones } from "@/config/site";
import type { planes } from "@/lib/content";
import { cn } from "@/lib/utils";

type Plan = (typeof planes)[number];

export function PlanCard({ plan, full = false }: { plan: Plan; full?: boolean }) {
  const ctaHref =
    plan.cta === "directo" ? `/orden/${plan.id}` : "/diagnostico";
  const ctaLabel =
    plan.cta === "directo" ? "Contratar ahora" : "Agendar llamada";

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border p-8",
        plan.destacado
          ? "border-ink bg-ink text-paper"
          : "border-line bg-paper text-ink"
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[1.25rem] font-semibold tracking-tight">
          {plan.nombre}
        </h3>
        {plan.destacado && (
          <span className="rounded-full bg-paper/15 px-2.5 py-1 text-[0.6875rem] tracking-wide uppercase">
            Recomendado
          </span>
        )}
      </div>
      <p
        className={cn(
          "mt-1.5 text-[0.875rem]",
          plan.destacado ? "text-paper/65" : "text-ink-mute"
        )}
      >
        {plan.para}
      </p>

      <div className="mt-7">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[2rem] font-semibold tracking-tight tnum">
            {colones(plan.mensual)}
          </span>
          <span
            className={cn(
              "text-[0.875rem]",
              plan.destacado ? "text-paper/60" : "text-ink-faint"
            )}
          >
            / mes
          </span>
        </div>
        <p
          className={cn(
            "mt-1 text-[0.8125rem] tnum",
            plan.destacado ? "text-paper/60" : "text-ink-faint"
          )}
        >
          + {colones(plan.setup)} de puesta en marcha, pago único
        </p>
      </div>

      <Button
        href={ctaHref}
        variant={plan.destacado ? "secondary" : "primary"}
        size="md"
        className={cn(
          "mt-7 w-full",
          plan.destacado &&
            "border-paper/25 bg-paper text-ink hover:bg-paper/90"
        )}
      >
        {ctaLabel}
      </Button>

      <div
        className={cn(
          "mt-8 h-px",
          plan.destacado ? "bg-paper/15" : "bg-line"
        )}
      />

      <ul className="mt-8 flex flex-col gap-3.5">
        {plan.incluye.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <Check
              size={16}
              weight="bold"
              className={cn(
                "mt-0.5 shrink-0",
                plan.destacado ? "text-paper/70" : "text-ink-faint"
              )}
            />
            <span className="text-[0.875rem] leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>

      {full && (
        <div
          className={cn(
            "mt-8 border-t pt-6",
            plan.destacado ? "border-paper/15" : "border-line"
          )}
        >
          <dl className="flex flex-col gap-3">
            {plan.limites.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4">
                <dt
                  className={cn(
                    "text-[0.8125rem]",
                    plan.destacado ? "text-paper/60" : "text-ink-faint"
                  )}
                >
                  {k}
                </dt>
                <dd className="text-[0.8125rem] font-medium tnum">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
