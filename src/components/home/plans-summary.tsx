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
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        {/* La tarjeta va compacta (5 puntos) y la columna de texto lleva tres
            datos: antes la tarjeta completa era tan alta que el texto
            centrado dejaba un bloque enorme de blanco vacío (2026-10-20). */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <p className="eyebrow mb-5">{t.eyebrow}</p>
            <h2 className="max-w-[18ch] text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
              {t.titulo}
            </h2>
            <p className="mt-4 max-w-[44ch] text-[0.9375rem] leading-relaxed text-ink-mute">
              {t.lead}
            </p>

            <dl className="mt-10 grid max-w-lg grid-cols-1 border-t border-line sm:grid-cols-3">
              {t.datos.map((d) => (
                <div
                  key={d.valor}
                  className="border-b border-line py-5 sm:border-b-0 sm:border-l sm:px-5 sm:first:border-l-0 sm:first:pl-0"
                >
                  <dt className="sr-only">{d.texto}</dt>
                  <dd>
                    <span className="block text-[1.75rem] leading-none font-semibold tracking-tight tnum">
                      {d.valor}
                    </span>
                    <span className="mt-2 block text-[0.8125rem] leading-snug">{d.texto}</span>
                  </dd>
                </div>
              ))}
            </dl>

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
                    compacto
                    hrefCompleto={hrefPlan}
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
