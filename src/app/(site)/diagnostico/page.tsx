import type { Metadata } from "next";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { DiagnosticoForm } from "@/components/diagnostico-form";
import { DiagnosticoPlanContext } from "@/components/diagnostico-plan-context";
import { planes } from "@/lib/content";
import { site, waLink } from "@/config/site";

export const metadata: Metadata = {
  title: `Diagnóstico gratuito — ${site.nombre}`,
  description:
    "Media hora para encontrar los tres procesos que más plata te están costando y saber por dónde empezar.",
};

/* Lo que la persona SE LLEVA, no un cronómetro de la llamada. La versión
   anterior listaba "0 a 10 min / 10 a 22 min / 22 a 30 min" y se leía como
   guion de televenta: prometía minutos en vez de resultados. */
const teLlevas = [
  {
    t: "Qué te está costando más",
    d: "Dónde se te va el tiempo y la plata, con números y no con corazonadas.",
  },
  {
    t: "Qué conviene automatizar y qué no",
    d: "Hay cosas que no valen la pena todavía, y te lo vamos a decir.",
  },
  {
    t: "Por dónde empezar",
    d: "El orden que más rinde — aunque después no lo hagas con nosotros.",
  },
];

export default async function DiagnosticoPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; periodo?: string }>;
}) {
  const params = await searchParams;
  const plan = planes.find((p) => p.id === params.plan);
  const periodoInicial = params.periodo === "anual" ? "anual" : "mensual";

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
              <p className="eyebrow mb-5">Diagnóstico gratuito</p>
              <h1 className="text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.03em] text-ink sm:text-[3rem]">
                Contanos cómo trabajás y te decimos qué automatizar primero
              </h1>
              <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-mute">
                Sin costo y sin compromiso. En media hora salimos con los tres
                procesos que más plata te están costando y cuánto podrías
                recuperar con cada uno.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-10 flex flex-col divide-y divide-line border-t border-line">
                {teLlevas.map((a) => (
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
                ¿Preferís escribir directo, sin llenar nada?{" "}
                <a
                  href={waLink(
                    plan
                      ? `Hola, quiero el diagnóstico gratuito para el plan ${plan.nombre}.`
                      : "Hola, quiero el diagnóstico gratuito."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-ink underline underline-offset-4 transition-colors hover:text-acento"
                >
                  <WhatsappLogo size={15} weight="fill" />
                  Abrir WhatsApp
                </a>
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal delay={60}>
              <DiagnosticoForm plan={plan?.nombre} />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
