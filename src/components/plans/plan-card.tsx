"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { cuposFundador, precioDe, site } from "@/config/site";
import type { AutomatizacionPublica, PlanPublico } from "@/lib/content";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { PlanCatalogModal } from "@/components/plans/plan-catalog-modal";
import { BordeVivo, PrecioQueCae } from "@/components/plans/fundador-vivo";

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
  compacto = false,
  hrefCompleto,
}: {
  plan: PlanPublico;
  automatizacion?: AutomatizacionPublica;
  periodo?: Periodo;
  idioma?: Idioma;
  /** Solo los 5 primeros puntos de la lista, con enlace a `hrefCompleto`. */
  compacto?: boolean;
  hrefCompleto?: string;
}) {
  const t = getCopy(idioma).plan.tarjeta;
  const [modalAbierto, setModalAbierto] = useState(false);
  const esAnual = periodo === "anual" && idioma === "es";
  /* El precio de fundador solo existe en colones (sitio en español). */
  const aplicaFundador = idioma === "es" && plan.moneda === "CRC" && !esAnual;
  const quedan = cuposFundador();
  const conFundador = aplicaFundador && quedan > 0;
  const fundadorAgotado = aplicaFundador && quedan === 0;
  const precio = esAnual
    ? plan.mensual * site.pago.mesesPagoAnual
    : conFundador
      ? site.fundador.precio
      : plan.mensual;
  const ctaHref =
    idioma === "en"
      ? "/en/diagnostic"
      : `/diagnostico?plan=${plan.id}&periodo=${periodo}`;
  const tieneCondiciones = !!plan.setup || plan.minimoMeses !== null;
  /* Relleno invertido respecto de la tarjeta: sello y cupos tomados. */
  const relleno = plan.destacado ? "bg-paper text-ink" : "bg-ink text-paper";

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-2xl border p-8",
        plan.destacado
          ? "border-acento bg-ink text-paper"
          : "border-line bg-paper text-ink"
      )}
    >
      {conFundador && <BordeVivo />}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[1.25rem] font-semibold tracking-tight">
          {plan.nombre}
        </h3>
        {plan.destacado && (
          <span className="rounded-full border border-paper px-2.5 py-1 text-[0.6875rem] tracking-wide uppercase">
            {t.recomendado}
          </span>
        )}
      </div>
      <p
        className={cn(
          "mt-1.5 text-[0.875rem] leading-snug",
          plan.destacado ? "text-paper" : "text-ink-mute"
        )}
      >
        {plan.para}
      </p>

      <div className="mt-7">
        {conFundador && (
          <span
            className={cn(
              "mb-3 inline-flex rounded-full px-2.5 py-1 text-[0.6875rem] font-medium tracking-wide uppercase",
              plan.destacado ? "bg-paper text-ink" : "bg-ink text-paper"
            )}
          >
            {t.fundador.etiqueta}
          </span>
        )}
        {/* Precio de fundador con movimiento (fundador-vivo.tsx): el
            regular se tacha, el número baja contando, cae el sello y el
            precio queda latiendo. Los cupos van en una línea quieta.
            Sin fundador, el precio va quieto como siempre. */}
        {conFundador ? (
          <>
            <PrecioQueCae
              regular={plan.mensual}
              fundador={site.fundador.precio}
              formato={(n) => precioDe(plan.moneda, n)}
              sufijo={t.mes}
              etiquetaRegular={t.fundador.regular}
              etiquetaPrecio={t.fundador.etiqueta}
              sello={t.fundador.descuento(
                Math.round((1 - site.fundador.precio / plan.mensual) * 100)
              )}
              relleno={relleno}
            />
            <div className="mt-5">
              {/* Un cuadro por cupo: lleno = libre. */}
              <div className="flex items-center gap-2.5">
                <span className="flex gap-1" aria-hidden="true">
                  {Array.from({ length: site.fundador.cupos }, (_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-2.5 w-2.5 rounded-[3px] border",
                        plan.destacado ? "border-paper" : "border-ink",
                        i < quedan && (plan.destacado ? "bg-paper" : "bg-ink")
                      )}
                    />
                  ))}
                </span>
                <span className="text-[0.8125rem] font-medium">
                  {t.fundador.cupos(quedan, site.fundador.cupos)}
                </span>
              </div>
              <p className="mt-2 text-[0.75rem] leading-relaxed">
                {t.fundador.condicion}
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
            <span className="text-[2.25rem] leading-none font-semibold tracking-tight tnum">
              {precioDe(plan.moneda, precio)}
            </span>
            <span
              className={cn(
                "text-[0.875rem]",
                plan.destacado ? "text-paper" : "text-ink-faint"
              )}
            >
              {esAnual ? t.anio : t.mes}
            </span>
          </div>
        )}
        {fundadorAgotado && (
          <p className="mt-3 text-[0.8125rem] font-medium">
            {t.fundador.agotados}
          </p>
        )}
        {esAnual && (
          <p
            className={cn(
              "mt-2 text-[0.75rem]",
              plan.destacado ? "text-paper" : "text-ink-faint"
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
              plan.destacado ? "border-paper" : "border-line"
            )}
          >
            {plan.setup && (
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className={plan.destacado ? "text-paper" : "text-ink-mute"}>
                    {t.setupEtiqueta}
                  </dt>
                  <dd className="font-medium tnum">
                    {precioDe(plan.moneda, plan.setup.monto)}
                  </dd>
                </div>
                <p
                  className={cn(
                    "mt-0.5 text-[0.75rem]",
                    plan.destacado ? "text-paper" : "text-ink-faint"
                  )}
                >
                  {plan.setup.nota}
                </p>
              </div>
            )}
            {plan.minimoMeses !== null && (
              <div className="flex items-baseline justify-between gap-3">
                <dt className={plan.destacado ? "text-paper" : "text-ink-mute"}>
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
        variant={plan.destacado ? "onInk" : "primary"}
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
              ? "text-paper hover:text-paper"
              : "text-ink-mute hover:text-ink"
          )}
        >
          {t.verAgente}
        </button>
      )}

      <div
        className={cn(
          "mt-8 h-px",
          plan.destacado ? "bg-paper" : "bg-line"
        )}
      />

      <ul className="mt-8 flex flex-col gap-3.5">
        {(compacto ? plan.incluye.slice(0, 5) : plan.incluye).map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <Check
              size={16}
              weight="bold"
              aria-hidden="true"
              className={cn(
                "mt-0.5 shrink-0",
                plan.destacado ? "text-paper" : "text-ink-faint"
              )}
            />
            <span className="text-[0.875rem] leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>

      {/* Versión compacta (inicio): el resto de la lista vive en /planes. */}
      {compacto && plan.incluye.length > 5 && hrefCompleto && (
        <Link
          href={hrefCompleto}
          className="mt-5 inline-flex items-center gap-1.5 self-start text-[0.8125rem] font-medium underline underline-offset-4"
        >
          {t.verTodoIncluye} ({plan.incluye.length})
          <ArrowUpRight size={14} weight="bold" />
        </Link>
      )}

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
