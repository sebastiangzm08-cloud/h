import type { Metadata } from "next";
import { CalendarBlank, Clock, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { site, waLink } from "@/config/site";

export const metadata: Metadata = {
  title: `Diagnóstico gratuito — ${site.nombre}`,
  description:
    "Treinta minutos para revisar tus herramientas y procesos y detectar los tres con más retorno.",
};

const agenda = [
  { t: "0 a 10 min", d: "Herramientas que ya usás y cómo se conectan hoy entre sí" },
  { t: "10 a 22 min", d: "Los procesos con más fricción de tu operación diaria" },
  { t: "22 a 30 min", d: "Los tres candidatos con más retorno y los próximos pasos" },
];

export default function DiagnosticoPage() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow mb-5">Diagnóstico gratuito</p>
              <h1 className="text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.03em] text-ink sm:text-[3rem]">
                Treinta minutos para saber qué automatizar primero
              </h1>
              <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-mute">
                Sin costo, sin presión de contratar. Salís con los tres
                procesos de más retorno de tu negocio identificados y un
                orden de magnitud del ahorro posible.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-10 flex flex-col divide-y divide-line border-t border-line">
                {agenda.map((a) => (
                  <div key={a.t} className="flex items-start gap-5 py-5">
                    <Clock size={16} className="mt-1 shrink-0 text-ink-faint" />
                    <div>
                      <p className="eyebrow">{a.t}</p>
                      <p className="mt-1 text-[0.9375rem] text-ink-soft">
                        {a.d}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="mt-10 rounded-2xl border border-line bg-surface p-6">
                <p className="text-[0.875rem] leading-relaxed text-ink-mute">
                  Preferís coordinar directo, sin calendario de por medio.
                </p>
                <Button
                  href={waLink(
                    "Hola, quiero agendar un diagnóstico gratuito."
                  )}
                  variant="secondary"
                  size="md"
                  className="mt-4"
                >
                  <WhatsappLogo size={17} weight="fill" />
                  Escribir por WhatsApp
                </Button>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={60}>
              <div className="flex min-h-[520px] flex-col items-center justify-center rounded-2xl border border-line bg-surface p-10 text-center">
                <CalendarBlank size={32} className="text-ink-faint" />
                <p className="mt-5 text-[1.0625rem] font-medium tracking-tight text-ink">
                  Calendario de reservas
                </p>
                <p className="mt-2 max-w-[38ch] text-[0.875rem] leading-relaxed text-ink-mute">
                  Este espacio queda reservado para el widget de Cal.com,
                  embebido directamente al conectar la cuenta del estudio.
                </p>
                <p className="mt-6 font-mono text-[0.75rem] text-ink-faint">
                  cal.com/{site.nombre.toLowerCase().replace(/\s+/g, "-")}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
