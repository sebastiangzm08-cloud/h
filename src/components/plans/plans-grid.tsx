"use client";

import { useState } from "react";
import { Reveal } from "@/components/reveal";
import { PlanCard } from "@/components/plans/plan-card";
import type { planes } from "@/lib/content";

type Periodo = "mensual" | "anual";

export function PlansGrid({ planes: lista }: { planes: typeof planes }) {
  const [periodo, setPeriodo] = useState<Periodo>("mensual");

  return (
    <div>
      <div className="mb-8 inline-flex rounded-full border border-line-strong bg-surface p-1">
        {(["mensual", "anual"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            aria-pressed={periodo === p}
            className={`rounded-full px-4 py-2 text-[0.8125rem] font-medium tracking-tight transition-all duration-150 ${
              periodo === p
                ? "bg-ink text-paper"
                : "text-ink-mute hover:text-ink"
            }`}
          >
            {p === "mensual" ? "Mensual" : "Anual · 2 meses gratis"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {lista.map((p, i) => (
          <Reveal key={p.id} delay={i * 90}>
            <PlanCard plan={p} periodo={periodo} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
