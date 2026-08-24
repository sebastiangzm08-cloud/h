import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { procesos } from "@/lib/content";

export function ProcessesGrid() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <p className="eyebrow mb-5">Qué automatizamos</p>
          <h2 className="max-w-[26ch] text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
            Seis procesos que existen en cualquier negocio con tecnología
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 border-t border-l border-line sm:grid-cols-2 lg:grid-cols-3">
          {procesos.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 70}>
              <Link
                href={`/procesos/${p.slug}`}
                className="group flex h-full flex-col border-r border-b border-line p-8 transition-colors hover:bg-paper"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[0.8125rem] text-ink-faint">
                    {p.n}
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="text-ink-faint opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                  />
                </div>
                <h3 className="mt-8 text-[1.1875rem] font-medium tracking-tight text-ink">
                  {p.nombre}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-mute">
                  {p.titular}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
