import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, TrendUp, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import {
  automatizaciones,
  ejecucionesRecientes,
  organizacion,
  calcularAhorro,
} from "@/lib/mock-portal";
import { StatusDot } from "@/components/portal/status-dot";
import { colones, site } from "@/config/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Resumen — Portal · ${site.nombre}`,
};

export default function DashboardPage() {
  const ahorro = calcularAhorro();
  const consumoPct = Math.round(
    (organizacion.ejecucionesUsadas / organizacion.limiteEjecuciones) * 100
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow mb-2">{organizacion.nombre}</p>
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-ink">
            Este mes ahorraste{" "}
            <span className="tnum">{ahorro.horas}</span> horas
          </h1>
          <p className="mt-1.5 text-[0.9375rem] text-ink-mute">
            Equivalente a {colones(ahorro.dinero)}, calculado con tu costo
            por hora configurado.
          </p>
        </div>
      </div>

      {/* Fila de métricas */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-center gap-2 text-ink-faint">
            <TrendUp size={16} />
            <span className="eyebrow">Horas ahorradas</span>
          </div>
          <p className="mt-3 text-[1.75rem] font-semibold tracking-tight tnum text-ink">
            {ahorro.horas}
          </p>
          <p className="mt-1 text-[0.8125rem] text-ink-faint">
            +18% respecto al mes anterior
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <span className="eyebrow text-ink-faint">Consumo del plan</span>
          <p className="mt-3 text-[1.75rem] font-semibold tracking-tight tnum text-ink">
            {consumoPct}%
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-ink"
              style={{ width: `${consumoPct}%` }}
            />
          </div>
          <p className="mt-2 text-[0.8125rem] tnum text-ink-faint">
            {organizacion.ejecucionesUsadas.toLocaleString("es-CR")} de{" "}
            {organizacion.limiteEjecuciones.toLocaleString("es-CR")} ejecuciones
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <span className="eyebrow text-ink-faint">Próximo cobro</span>
          <p className="mt-3 text-[1.75rem] font-semibold tracking-tight tnum text-ink">
            {colones(organizacion.montoProximoCobro)}
          </p>
          <p className="mt-1 text-[0.8125rem] text-ink-faint">
            {new Date(organizacion.proximoCobro).toLocaleDateString("es-CR", {
              day: "numeric",
              month: "long",
            })}{" "}
            · Plan {organizacion.plan}
          </p>
        </div>
      </div>

      {/* Automatizaciones */}
      <div className="mt-12 flex items-center justify-between">
        <p className="eyebrow">Tus automatizaciones</p>
        <Link
          href="/app/automatizaciones"
          className="flex items-center gap-1 text-[0.8125rem] text-ink-soft underline underline-offset-4"
        >
          Ver todas
          <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {automatizaciones.map((a) => (
          <Link
            key={a.id}
            href={`/app/automatizaciones/${a.id}`}
            className="flex flex-col rounded-2xl border border-line bg-paper p-6 transition-colors hover:border-ink-mute"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.9375rem] font-medium tracking-tight text-ink">
                  {a.nombre}
                </p>
                <p className="mt-0.5 text-[0.8125rem] text-ink-faint">
                  {a.proceso}
                </p>
              </div>
              <StatusDot estado={a.estado} />
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-[0.8125rem]">
              <span className="tnum text-ink-mute">
                {a.ejecucionesMes} ejecuciones este mes
              </span>
              <span className="text-ink-faint">{a.ultimaEjecucion}</span>
            </div>
          </Link>
        ))}

        <Link
          href="/planes"
          className="flex flex-col items-start justify-center rounded-2xl border border-dashed border-line-strong p-6 text-left transition-colors hover:border-ink-mute"
        >
          <p className="text-[0.9375rem] font-medium tracking-tight text-ink">
            Hay 3 procesos más que podríamos automatizar
          </p>
          <p className="mt-1.5 text-[0.8125rem] text-ink-mute">
            Según lo que vemos en tu operación. Pedí el detalle.
          </p>
        </Link>
      </div>

      {/* Actividad reciente */}
      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="eyebrow mb-5">Actividad reciente</p>
          <div className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-paper">
            {ejecucionesRecientes.map((e) => (
              <div key={e.id} className="flex items-start gap-3 p-4">
                <span
                  className={cn(
                    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                    e.estado === "ok" ? "bg-ok" : "bg-bad"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.875rem] text-ink-soft">
                    {e.detalle}
                  </p>
                  <p className="mt-0.5 text-[0.75rem] text-ink-faint">
                    {e.fecha}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <p className="eyebrow mb-5">Estado de la cuenta</p>
          <div className="rounded-2xl border border-line bg-surface p-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-ok" />
              <span className="text-[0.9375rem] font-medium text-ink">
                Al día
              </span>
            </div>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-mute">
              Tu próximo cobro es el{" "}
              {new Date(organizacion.proximoCobro).toLocaleDateString(
                "es-CR",
                { day: "numeric", month: "long" }
              )}
              . Te vamos a avisar por WhatsApp tres días antes.
            </p>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-line bg-paper p-5">
            <WarningCircle size={17} className="mt-0.5 shrink-0 text-warn" />
            <p className="text-[0.8125rem] leading-relaxed text-ink-mute">
              <span className="font-medium text-ink">
                Facturas a hoja de cálculo
              </span>{" "}
              tuvo un error hace 40 minutos. Ya lo estamos revisando.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
