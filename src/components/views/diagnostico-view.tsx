import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { DiagnosticoForm } from "@/components/diagnostico-form";
import { DiagnosticoPlanContext } from "@/components/diagnostico-plan-context";
import { waLink } from "@/config/site";
import type { PlanPublico } from "@/lib/content";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";

/** Página del diagnóstico. `plan` solo llega en español (`?plan=` en la URL):
    en inglés la página es estática y no lee parámetros. */
export function DiagnosticoView({
  idioma,
  plan,
  periodoInicial = "mensual",
}: {
  idioma: Idioma;
  plan?: PlanPublico;
  periodoInicial?: "mensual" | "anual";
}) {
  const t = getCopy(idioma).diagnostico;

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            {plan && (
              <Reveal>
                <DiagnosticoPlanContext plan={plan} periodoInicial={periodoInicial} />
              </Reveal>
            )}
            <Reveal>
              <p className="eyebrow mb-5">{t.eyebrow}</p>
              <h1 className="text-[2.25rem] leading-[1.04] font-semibold tracking-[-0.03em] text-ink sm:text-[3rem]">
                {t.titulo}
              </h1>
              <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-mute">
                {t.lead}
              </p>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-10 flex flex-col divide-y divide-line border-t border-line">
                {t.teLlevas.map((a) => (
                  <div key={a.t} className="py-5">
                    <p className="text-[0.9375rem] font-medium tracking-tight text-ink">
                      {a.t}
                    </p>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-mute">
                      {a.d}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-8 text-[0.875rem] leading-relaxed text-ink-mute">
                {t.wa.directo}{" "}
                <a
                  href={waLink(plan ? t.wa.mensajePlan(plan.nombre) : t.wa.mensaje)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-ink underline underline-offset-4 transition-colors hover:text-acento"
                >
                  <WhatsappLogo size={15} weight="fill" aria-hidden="true" />
                  {t.wa.abrir}
                </a>
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal delay={60}>
              <DiagnosticoForm plan={plan?.nombre} idioma={idioma} />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
