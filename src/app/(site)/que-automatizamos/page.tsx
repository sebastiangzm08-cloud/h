import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Megaphone,
  ChatCircleDots,
  Receipt,
  Package,
  ChartBar,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { procesos, type ProcesoSlug } from "@/lib/content";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Qué automatizamos — ${site.nombre}`,
  description:
    "Los seis procesos que existen en cualquier negocio, y lo que se puede automatizar en cada uno.",
};

const iconos: Record<ProcesoSlug, typeof Megaphone> = {
  ventas: Megaphone,
  atencion: ChatCircleDots,
  administracion: Receipt,
  operaciones: Package,
  datos: ChartBar,
  personas: UsersThree,
};

export default function QueAutomatizamosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Qué automatizamos"
        title="Seis procesos. Cualquier negocio los tiene."
        lead="No trabajamos por industria, trabajamos por proceso. Facturar, dar seguimiento o responder consultas se resuelve igual en una clínica que en un taller mecánico: lo que cambia son las herramientas, y con esas trabajamos."
      />

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {procesos.map((p, i) => {
              const Icon = iconos[p.slug];
              return (
                <Reveal key={p.slug} delay={i * 60}>
                  <Link
                    href={`/procesos/${p.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-line bg-paper p-7 transition-all duration-200 hover:border-acento/40 hover:shadow-[0_0_40px_-16px_var(--color-acento)]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line-strong bg-surface text-ink">
                        <Icon size={20} />
                      </div>
                      <ArrowUpRight
                        size={18}
                        className="text-ink-faint opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink group-hover:opacity-100"
                      />
                    </div>
                    <span className="mt-6 font-mono text-[0.75rem] text-ink-faint">
                      {p.n}
                    </span>
                    <h2 className="mt-2 text-[1.25rem] font-medium tracking-tight text-ink">
                      {p.nombre}
                    </h2>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-mute">
                      {p.resumen}
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
