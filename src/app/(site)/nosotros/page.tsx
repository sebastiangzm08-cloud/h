import type { Metadata } from "next";
import { Target, PlugsConnected, Handshake } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { ConstellationMark } from "@/components/constellation";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Nosotros — ${site.nombre}`,
  description: "Quién está detrás de la agencia y cómo trabajamos.",
};

const principios = [
  {
    icon: Target,
    t: "El proceso importa más que el sector",
    d: "Cotizar, dar seguimiento, facturar o reportar es prácticamente igual en cualquier negocio. Lo que cambia es la herramienta, y con esa trabajamos.",
  },
  {
    icon: PlugsConnected,
    t: "Sin cambiar lo que ya funciona",
    d: "Conectamos lo que tenés en lugar de proponerte migrar a un sistema nuevo. Menos fricción, menos riesgo, menos curva de aprendizaje para tu equipo.",
  },
  {
    icon: Handshake,
    t: "Trato directo, sin intermediarios",
    d: "Hablás con quien arma tu automatización, no con un vendedor. Los ajustes salen rápido porque no hay capas de por medio, y todo queda por escrito antes de empezar: precio cerrado, sin costo de instalación y sin permanencia forzada.",
  },
];

export default function NosotrosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Nosotros"
        title="Una agencia, no una fábrica de plantillas"
        lead="Hoshizora nace para resolver un problema puntual: la mayoría de los negocios pierde horas todas las semanas en tareas que ya podrían hacerse solas, y no tienen a quién pedirle que se las resuelva sin comprar un sistema entero nuevo."
      />

      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Reveal>
                <div className="flex aspect-[4/5] flex-col justify-between rounded-2xl bg-surface-2 p-7">
                  <ConstellationMark className="h-8 w-8 text-ink-mute" />
                  <div>
                    <p className="text-[1.125rem] font-medium tracking-tight text-ink">
                      Sebastián Zúñiga
                    </p>
                    <p className="mt-1 text-[0.875rem] text-ink-mute">
                      Fundador, Hoshizora
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-mute">
                  Armo automatizaciones para negocios de Costa Rica que ya usan
                  sus herramientas y no quieren cambiarlas — solo dejar de perder
                  horas en lo repetitivo. Hoshizora es eso: pocas
                  automatizaciones, bien hechas, y alguien que responde cuando
                  algo falla.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              <div className="flex flex-col gap-4">
                {principios.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <Reveal key={p.t} delay={i * 90} as="div">
                      <div className="rounded-2xl border border-line bg-paper p-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line-strong bg-surface text-ink">
                          <Icon size={19} />
                        </div>
                        <h2 className="mt-5 text-[1.1875rem] font-medium tracking-tight text-ink">
                          {p.t}
                        </h2>
                        <p className="mt-2.5 max-w-[60ch] text-[0.9375rem] leading-relaxed text-ink-mute">
                          {p.d}
                        </p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-8">
          <h2 className="text-[1.75rem] font-semibold tracking-tight text-ink">
            ¿Charlamos sobre tu operación?
          </h2>
          <div className="mt-7">
            <Button href="/diagnostico" variant="primary" size="lg">
              Agenda tu diagnóstico
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
