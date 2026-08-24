import Link from "next/link";
import type { Metadata } from "next";
import { PortalSectionHeader } from "@/components/portal/section-header";
import { StatusDot } from "@/components/portal/status-dot";
import { automatizaciones } from "@/lib/mock-portal";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Automatizaciones — Portal · ${site.nombre}`,
};

export default function AutomatizacionesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
      <PortalSectionHeader
        eyebrow="Portal"
        title={`${automatizaciones.length} automatizaciones contratadas`}
      />

      <div className="mt-8 flex flex-col divide-y divide-line border-t border-line">
        {automatizaciones.map((a) => (
          <Link
            key={a.id}
            href={`/app/automatizaciones/${a.id}`}
            className="grid grid-cols-1 gap-3 py-6 transition-colors hover:bg-surface sm:grid-cols-12 sm:items-center sm:gap-4 sm:px-3"
          >
            <div className="sm:col-span-5">
              <p className="text-[0.9375rem] font-medium tracking-tight text-ink">
                {a.nombre}
              </p>
              <p className="mt-0.5 text-[0.8125rem] text-ink-faint">
                {a.proceso}
              </p>
            </div>
            <div className="sm:col-span-2">
              <StatusDot estado={a.estado} />
            </div>
            <div className="text-[0.8125rem] tnum text-ink-mute sm:col-span-3">
              {a.ejecucionesMes} ejecuciones este mes
            </div>
            <div className="text-[0.8125rem] text-ink-faint sm:col-span-2 sm:text-right">
              {a.ultimaEjecucion}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
