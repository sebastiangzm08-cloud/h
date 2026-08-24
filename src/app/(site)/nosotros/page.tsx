import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { ConstellationMark } from "@/components/constellation";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Nosotros — ${site.nombre}`,
  description: "Quién está detrás del estudio y cómo trabajamos.",
};

const principios = [
  {
    t: "El proceso importa más que el sector",
    d: "Cotizar, dar seguimiento, facturar o reportar es prácticamente igual en cualquier negocio. Lo que cambia es la herramienta, y con esa trabajamos.",
  },
  {
    t: "Sin cambiar lo que ya funciona",
    d: "Conectamos lo que tenés en lugar de proponerte migrar a un sistema nuevo. Menos fricción, menos riesgo, menos curva de aprendizaje para tu equipo.",
  },
  {
    t: "El riesgo lo asumimos nosotros",
    d: "Presupuesto fijo antes de empezar, garantía sobre las primeras horas ahorradas, y los flujos quedan documentados y exportados a tu nombre.",
  },
];

export default function NosotrosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Nosotros"
        title="Un estudio, no una fábrica de plantillas"
        lead="Hoshizora Studio nace para resolver un problema puntual: la mayoría de los negocios pierde horas todas las semanas en tareas que ya podrían hacerse solas, y no tienen a quién pedirle que se las resuelva sin comprar un sistema entero nuevo."
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
                      Sebastián
                    </p>
                    <p className="mt-1 text-[0.875rem] text-ink-mute">
                      Fundador, Hoshizora Studio
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              <div className="flex flex-col divide-y divide-line border-t border-line">
                {principios.map((p, i) => (
                  <Reveal key={p.t} delay={i * 90} as="div">
                    <div className="py-8">
                      <h2 className="text-[1.1875rem] font-medium tracking-tight text-ink">
                        {p.t}
                      </h2>
                      <p className="mt-2.5 max-w-[60ch] text-[0.9375rem] leading-relaxed text-ink-mute">
                        {p.d}
                      </p>
                    </div>
                  </Reveal>
                ))}
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
