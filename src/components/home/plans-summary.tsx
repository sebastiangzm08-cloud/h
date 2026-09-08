import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { PlanCard } from "@/components/plans/plan-card";
import { planes } from "@/lib/content";

export function PlansSummary() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <p className="eyebrow mb-5">Planes</p>
            <h2 className="max-w-[24ch] text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
              Sin costo de instalación. Pagás mes a mes.
            </h2>
          </Reveal>
          <Link
            href="/planes"
            className="hidden shrink-0 items-center gap-1.5 text-[0.9375rem] text-ink-soft underline underline-offset-4 sm:flex"
          >
            Ver todos los planes
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {planes.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <PlanCard plan={p} />
            </Reveal>
          ))}
        </div>

        <Link
          href="/planes"
          className="mt-8 flex items-center gap-1.5 text-[0.9375rem] text-ink-soft underline underline-offset-4 sm:hidden"
        >
          Ver todos los planes
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
}
