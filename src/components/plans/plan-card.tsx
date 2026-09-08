"use client";

import { useState } from "react";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { colones, site } from "@/config/site";
import type { planes } from "@/lib/content";
import { cn } from "@/lib/utils";
import { PlanCatalogModal } from "@/components/plans/plan-catalog-modal";

type Plan = (typeof planes)[number];
type Periodo = "mensual" | "anual";

export function PlanCard({
  plan,
  periodo = "mensual",
}: {
  plan: Plan;
  periodo?: Periodo;
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const esAnual = periodo === "anual";
  const aCotizar = "aCotizar" in plan && plan.aCotizar === true;
  const precio = esAnual
    ? plan.mensual * site.pago.mesesPagoAnual
    : plan.mensual;
  const ctaHref =
    plan.cta === "directo"
      ? `/orden/${plan.id}${esAnual ? "-anual" : ""}`
      : `/diagnostico?plan=${plan.id}&periodo=${periodo}`;
  const ctaLabel = aCotizar
    ? "Agendar diagnóstico"
    : plan.cta === "directo"
      ? "Contratar ahora"
      : "Contratar";

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border p-8",
        plan.destacado
          ? "border-acento/50 bg-ink text-paper shadow-[0_0_70px_-18px_var(--color-acento)]"
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
        {plan.pruebaGratuitaDias && (
          <span className="rounded-full bg-acento/15 px-2.5 py-1 text-[0.6875rem] tracking-wide text-acento uppercase">
            {plan.pruebaGratuitaDias} días de prueba
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
            {aCotizar ? "A cotizar" : colones(precio)}
          </span>
          {!aCotizar && (
            <span
              className={cn(
                "text-[0.875rem]",
                plan.destacado ? "text-paper/60" : "text-ink-faint"
              )}
            >
              {esAnual ? "/ año" : "/ mes"}
            </span>
          )}
        </div>
        {!aCotizar && esAnual && (
          <p
            className={cn(
              "mt-1.5 text-[0.75rem]",
              plan.destacado ? "text-paper/50" : "text-ink-faint"
            )}
          >
            Equivale a {site.pago.mesesPagoAnual} meses · 2 gratis
          </p>
        )}
      </div>

      <Button
        href={ctaHref}
        variant={plan.destacado ? "inverse" : "primary"}
        size="md"
        className="mt-7 w-full"
      >
        {ctaLabel}
      </Button>

      <button
        onClick={() => setModalAbierto(true)}
        className={cn(
          "mt-3 text-center text-[0.8125rem] underline underline-offset-4",
          plan.destacado
            ? "text-paper/70 hover:text-paper"
            : "text-ink-mute hover:text-ink"
        )}
      >
        Ver qué automatizaciones podés elegir
      </button>

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

      {modalAbierto && (
        <PlanCatalogModal
          planNombre={plan.nombre}
          onClose={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
}
