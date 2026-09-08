"use client";

import { useState } from "react";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { colones, site, waLink } from "@/config/site";
import type { planes } from "@/lib/content";

type Plan = (typeof planes)[number];
type Periodo = "mensual" | "anual";

export function DiagnosticoPlanContext({
  plan,
  periodoInicial,
}: {
  plan: Plan;
  periodoInicial: Periodo;
}) {
  const [periodo, setPeriodo] = useState<Periodo>(periodoInicial);
  const esAnual = periodo === "anual";
  const precio = esAnual ? plan.mensual * site.pago.mesesPagoAnual : plan.mensual;

  const mensaje = `Hola, quiero agendar un diagnóstico para el plan ${plan.nombre} (${
    esAnual ? "pago anual" : "pago mensual"
  }, ${colones(precio)}${esAnual ? "/año" : "/mes"}).`;

  return (
    <div className="mb-8 rounded-2xl border border-acento/30 bg-acento/[0.06] p-6">
      <p className="eyebrow mb-3 text-acento">Estás agendando sobre</p>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 className="text-[1.375rem] font-semibold tracking-tight text-ink">
          Plan {plan.nombre}
        </h2>
        <p className="tnum text-[1.0625rem] font-medium text-ink">
          {colones(precio)}
          <span className="text-[0.8125rem] font-normal text-ink-faint">
            {esAnual ? " / año" : " / mes"}
          </span>
        </p>
      </div>
      <p className="mt-1.5 text-[0.875rem] text-ink-mute">{plan.para}</p>

      <div className="mt-5 inline-flex rounded-full border border-line-strong bg-paper p-1">
        {(["mensual", "anual"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            aria-pressed={periodo === p}
            className={`rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium tracking-tight transition-all duration-150 ${
              periodo === p
                ? "bg-ink text-paper"
                : "text-ink-mute hover:text-ink"
            }`}
          >
            {p === "mensual" ? "Mensual" : "Anual · 2 meses gratis"}
          </button>
        ))}
      </div>

      <ul className="mt-5 flex flex-col gap-2">
        {plan.incluye.slice(0, 4).map((item) => (
          <li key={item} className="text-[0.8125rem] leading-relaxed text-ink-soft">
            · {item}
          </li>
        ))}
      </ul>

      <Button
        href={waLink(mensaje)}
        variant="primary"
        size="md"
        className="mt-6 w-full"
      >
        <WhatsappLogo size={17} weight="fill" />
        Confirmar por WhatsApp
      </Button>
    </div>
  );
}
