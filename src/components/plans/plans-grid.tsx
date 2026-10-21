"use client";

import { useState } from "react";
import { Reveal } from "@/components/reveal";
import { PlanCard } from "@/components/plans/plan-card";
import { site } from "@/config/site";
import type { AutomatizacionPublica, PlanPublico } from "@/lib/content";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";

type Periodo = "mensual" | "anual";

/** Plan(es) con el selector mensual/anual. El anual solo existe en español
    (Costa Rica); en inglés el plan es solo mensual. */
export function PlansGrid({
  planes: lista,
  automatizaciones,
  idioma = "es",
}: {
  planes: PlanPublico[];
  automatizaciones: AutomatizacionPublica[];
  idioma?: Idioma;
}) {
  const t = getCopy(idioma).plan.periodo;
  const [periodo, setPeriodo] = useState<Periodo>("mensual");
  const hayAnual = idioma === "es" && site.pago.pagoAnual;

  return (
    <div>
      {hayAnual && (
        <div
          role="group"
          aria-label={t.etiqueta}
          className="mb-8 inline-flex rounded-full border border-line-strong bg-surface p-1"
        >
          {(["mensual", "anual"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriodo(p)}
              aria-pressed={periodo === p}
              className={`rounded-full px-4 py-2 text-[0.8125rem] font-medium tracking-tight transition-all duration-150 ${
                periodo === p
                  ? "bg-ink text-paper"
                  : "text-ink-mute hover:text-ink"
              }`}
            >
              {p === "mensual" ? t.mensual : t.anual}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {lista.map((p, i) => (
          <Reveal key={p.id} delay={i * 90}>
            <PlanCard
              plan={p}
              periodo={periodo}
              idioma={idioma}
              automatizacion={automatizaciones.find((a) => a.plan === p.nombre)}
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
