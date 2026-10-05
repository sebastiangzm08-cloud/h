import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { PlanCard } from "@/components/plans/plan-card";
import { getContenido } from "@/lib/contenido";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";

export function PlansSummary({ idioma = "es" }: { idioma?: Idioma }) {
  const t = getCopy(idioma).plan.resumen;
  const { planes, automatizaciones } = getContenido(idioma);
  const hrefPlan = idioma === "en" ? "/en/plans" : "/planes";

  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <p className="eyebrow mb-5">{t.eyebrow}</p>
            <h2 className="max-w-[18ch] text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
              {t.titulo}
            </h2>
            <p className="mt-4 max-w-[44ch] text-[0.9375rem] leading-relaxed text-ink-mute">
              {t.lead}
            </p>
            <Link
              href={hrefPlan}
              className="mt-8 inline-flex items-center gap-1.5 text-[0.9375rem] text-ink-soft underline underline-offset-4 transition-colors hover:text-ink"
            >
              {t.verTodo}
              <ArrowUpRight size={16} />
            </Link>
          </Reveal>

          <div className="lg:col-span-6">
            {planes.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <div className="mx-auto max-w-md lg:mr-0 lg:ml-auto">
                  <PlanCard
                    plan={p}
                    idioma={idioma}
                    automatizacion={automatizaciones.find((a) => a.plan === p.nombre)}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
