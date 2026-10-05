"use client";

import { useState } from "react";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { precioDe, site } from "@/config/site";
import type { AutomatizacionPublica, PlanPublico } from "@/lib/content";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { PlanCatalogModal } from "@/components/plans/plan-catalog-modal";

type Periodo = "mensual" | "anual";

/**
 * Tarjeta del plan. El botón principal NUNCA cobra: no hay pasarela de pago.
 * Lleva a agendar el diagnóstico (con el plan elegido, en español) y el pago
 * se acuerda después, por escrito.
 */
export function PlanCard({
  plan,
  automatizacion,
  periodo = "mensual",
  idioma = "es",
}: {
  plan: PlanPublico;
  automatizacion?: AutomatizacionPublica;
  periodo?: Periodo;
  idioma?: Idioma;
}) {
  const t = getCopy(idioma).plan.tarjeta;
  const [modalAbierto, setModalAbierto] = useState(false);
  const esAnual = periodo === "anual" && idioma === "es";
  const precio = esAnual
    ? plan.mensual * site.pago.mesesPagoAnual
    : plan.mensual;
  const ctaHref =
    idioma === "en"
      ? "/en/diagnostic"
      : `/diagnostico?plan=${plan.id}&periodo=${periodo}`;
  const tieneCondiciones = !!plan.setup || plan.minimoMeses !== null;

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border p-8",
        plan.destacado
          ? "border-acento/50 bg-ink text-paper shadow-[0_0_70px_-18px_var(--color-acento)]"
          : "border-line bg-paper text-ink"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[1.25rem] font-semibold tracking-tight">
          {plan.nombre}
        </h3>
        {plan.destacado && (
          <span className="rounded-full bg-paper/15 px-2.5 py-1 text-[0.6875rem] tracking-wide uppercase">
            {t.recomendado}
          </span>
        )}
      </div>
      <p
        className={cn(
          "mt-1.5 text-[0.875rem] leading-snug",
          plan.destacado ? "text-paper/70" : "text-ink-mute"
        )}
      >
        {plan.para}
      </p>

      <div className="mt-7">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[2.25rem] leading-none font-semibold tracking-tight tnum">
            {precioDe(plan.moneda, precio)}
          </span>
          <span
            className={cn(
              "text-[0.875rem]",
              plan.destacado ? "text-paper/65" : "text-ink-faint"
            )}
          >
            {esAnual ? t.anio : t.mes}
          </span>
        </div>
        {esAnual && (
          <p
            className={cn(
              "mt-2 text-[0.75rem]",
              plan.destacado ? "text-paper/60" : "text-ink-faint"
            )}
          >
            {t.equivale(site.pago.mesesPagoAnual)}
          </p>
        )}

        {/* Condiciones (inglés): instalación y permanencia mínima, a la vista
            pero discretas. Debajo del precio, antes del botón. */}
        {tieneCondiciones && (
          <dl
            className={cn(
              "mt-5 flex flex-col gap-2 border-t pt-4 text-[0.8125rem] leading-snug",
              plan.destacado ? "border-paper/15" : "border-line"
            )}
          >
            {plan.setup && (
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className={plan.destacado ? "text-paper/70" : "text-ink-mute"}>
                    {t.setupEtiqueta}
                  </dt>
                  <dd className="font-medium tnum">
                    {precioDe(plan.moneda, plan.setup.monto)}
                  </dd>
                </div>
                <p
                  className={cn(
                    "mt-0.5 text-[0.75rem]",
                    plan.destacado ? "text-paper/60" : "text-ink-faint"
                  )}
                >
                  {plan.setup.nota}
                </p>
              </div>
            )}
            {plan.minimoMeses !== null && (
              <div className="flex items-baseline justify-between gap-3">
                <dt className={plan.destacado ? "text-paper/70" : "text-ink-mute"}>
                  {t.minimoEtiqueta}
                </dt>
                <dd className="font-medium">{t.minimoValor(plan.minimoMeses)}</dd>
              </div>
            )}
          </dl>
        )}
      </div>

      <Button
        href={ctaHref}
        variant={plan.destacado ? "inverse" : "primary"}
        size="md"
        className="mt-7 w-full"
      >
        {t.cta}
      </Button>

      {automatizacion && (
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className={cn(
            "mt-3 rounded text-center text-[0.8125rem] underline underline-offset-4 transition-colors",
            plan.destacado
              ? "text-paper/75 hover:text-paper"
              : "text-ink-mute hover:text-ink"
          )}
        >
          {t.verAgente}
        </button>
      )}

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
              aria-hidden="true"
              className={cn(
                "mt-0.5 shrink-0",
                plan.destacado ? "text-paper/70" : "text-ink-faint"
              )}
            />
            <span className="text-[0.875rem] leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>

      {modalAbierto && automatizacion && (
        <PlanCatalogModal
          planNombre={plan.nombre}
          automatizacion={automatizacion}
          idioma={idioma}
          onClose={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
}
