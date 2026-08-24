import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { procesos } from "@/lib/content";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Qué automatizamos — ${site.nombre}`,
  description:
    "Los seis procesos que existen en cualquier negocio con tecnología, y lo que se puede automatizar en cada uno.",
};

export default function QueAutomatizamosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Qué automatizamos"
        title="Seis procesos. Cualquier negocio con tecnología los tiene."
        lead="No trabajamos por industria, trabajamos por proceso. Facturar, dar seguimiento o responder consultas se resuelve igual en una clínica que en un taller mecánico: lo que cambia son las herramientas, y con esas trabajamos."
      />

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="flex flex-col divide-y divide-line border-t border-line">
            {procesos.map((p, i) => (
              <Reveal key={p.slug} delay={i * 60}>
                <Link
                  href={`/procesos/${p.slug}`}
                  className="group grid grid-cols-1 gap-6 py-10 sm:grid-cols-12 sm:items-start"
                >
                  <div className="sm:col-span-1">
                    <span className="font-mono text-[0.8125rem] text-ink-faint">
                      {p.n}
                    </span>
                  </div>
                  <div className="sm:col-span-4">
                    <h2 className="text-[1.375rem] font-medium tracking-tight text-ink">
                      {p.nombre}
                    </h2>
                  </div>
                  <div className="sm:col-span-6">
                    <p className="text-[0.9375rem] leading-relaxed text-ink-mute">
                      {p.resumen}
                    </p>
                  </div>
                  <div className="flex items-center justify-start sm:col-span-1 sm:justify-end">
                    <ArrowUpRight
                      size={20}
                      className="text-ink-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
                    />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
