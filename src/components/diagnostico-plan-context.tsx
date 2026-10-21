"use client";

import { useState } from "react";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { cuposFundador, mensualVigente, precioDe, site, waLink } from "@/config/site";
import type { PlanPublico } from "@/lib/content";
import { getCopy } from "@/lib/copy";

type Periodo = "mensual" | "anual";

/** Tarjeta "Estás agendando sobre…" de /diagnostico?plan=… (solo español: en
    inglés hay un único plan y no hace falta elegirlo). */
export function DiagnosticoPlanContext({
  plan,
  periodoInicial,
}: {
  plan: PlanPublico;
  periodoInicial: Periodo;
}) {
  const t = getCopy("es").diagnostico.contextoPlan;
  const tp = getCopy("es").plan.periodo;
  const tt = getCopy("es").plan.tarjeta;
  const [periodo, setPeriodo] = useState<Periodo>(periodoInicial);
  const esAnual = periodo === "anual";
  const precio = esAnual ? plan.mensual * site.pago.mesesPagoAnual : mensualVigente(plan.mensual);
  const nombrePlan = !esAnual && cuposFundador() > 0 ? `${plan.nombre} · precio de fundador` : plan.nombre;
  const precioTexto = precioDe(plan.moneda, precio);

  const mensaje = t.mensaje(nombrePlan, esAnual, precioTexto, esAnual ? "/año" : "/mes");

  return (
    <div className="mb-8 rounded-2xl border border-acento p-6">
      <p className="eyebrow mb-3 text-acento">{t.eyebrow}</p>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 className="text-[1.375rem] font-semibold tracking-tight text-ink">
          {t.plan(plan.nombre)}
        </h2>
        <p className="tnum text-[1.0625rem] font-medium text-ink">
          {precioTexto}
          <span className="text-[0.8125rem] font-normal text-ink-faint">
            {esAnual ? ` ${tt.anio}` : ` ${tt.mes}`}
          </span>
        </p>
      </div>
      <p className="mt-1.5 text-[0.875rem] text-ink-mute">{plan.para}</p>

      {site.pago.pagoAnual && (
        <div
          role="group"
          aria-label={tp.etiqueta}
          className="mt-5 inline-flex rounded-full border border-line-strong bg-paper p-1"
        >
          {(["mensual", "anual"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriodo(p)}
              aria-pressed={periodo === p}
              className={`rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium tracking-tight transition-all duration-150 ${
                periodo === p
                  ? "bg-ink text-paper"
                  : "text-ink-mute hover:text-ink"
              }`}
            >
              {p === "mensual" ? tp.mensual : tp.anual}
            </button>
          ))}
        </div>
      )}

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
        {t.confirmar}
      </Button>
    </div>
  );
}
