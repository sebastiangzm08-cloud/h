import Link from "next/link";
import {
  ChatCircleDots,
  MegaphoneSimple,
  MagnifyingGlass,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { automatizaciones } from "@/lib/content";

const iconos: Record<string, typeof ChatCircleDots> = {
  "publicador-de-contenido": MegaphoneSimple,
  "bot-de-whatsapp": ChatCircleDots,
  prospeccion: MagnifyingGlass,
};

function precioTexto(precio: number | null) {
  if (precio == null) return "A cotizar";
  return `₡${precio.toLocaleString("es-CR")} / mes`;
}

export function BentoSolutions() {
  return (
    <section data-tema="oscuro" className="border-b border-noche-texto/10 bg-noche">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <p className="eyebrow mb-5 text-noche-texto/55">Las automatizaciones</p>
            <h2 className="max-w-[26ch] text-[2rem] leading-[1.05] font-semibold tracking-tight text-noche-texto sm:text-[2.5rem]">
              Tres automatizaciones. Una por plan.
            </h2>
            <p className="mt-4 max-w-[46ch] text-[0.9375rem] leading-relaxed text-noche-texto/55">
              Por ahora son estas tres. Vamos agregando más — cada plan trae la
              suya, completa y andando.
            </p>
          </Reveal>
          <Link
            href="/planes"
            className="hidden shrink-0 items-center gap-1.5 text-[0.9375rem] text-noche-texto/70 underline underline-offset-4 hover:text-noche-texto sm:flex"
          >
            Ver los planes
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {automatizaciones.map((a, i) => {
            const Icon = iconos[a.slug] ?? ChatCircleDots;
            return (
              <Reveal key={a.slug} delay={i * 80}>
                <Link
                  href="/planes"
                  className="group flex h-full flex-col justify-between rounded-2xl border border-noche-texto/10 bg-noche-texto/[0.04] p-7 transition-all duration-200 ease-out hover:scale-[1.02] hover:border-acento/40 hover:shadow-[0_0_40px_-12px_var(--color-acento)]"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-noche-texto/10 bg-noche-texto/[0.06] text-noche-texto">
                        <Icon size={18} />
                      </div>
                      <ArrowUpRight
                        size={18}
                        className="text-noche-texto/50 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                      />
                    </div>
                    <p className="mt-6 text-[1.0625rem] leading-snug font-medium tracking-tight text-noche-texto">
                      {a.nombre}
                    </p>
                    <p className="mt-2.5 text-[0.875rem] leading-relaxed text-noche-texto/60">
                      {a.gancho}
                    </p>
                  </div>
                  <p className="mt-6 text-[0.8125rem] font-medium text-noche-texto/70">
                    Plan {a.plan} · {precioTexto(a.precio)}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Link
          href="/planes"
          className="mt-8 flex items-center gap-1.5 text-[0.9375rem] text-noche-texto/70 underline underline-offset-4 sm:hidden"
        >
          Ver los planes
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
}
