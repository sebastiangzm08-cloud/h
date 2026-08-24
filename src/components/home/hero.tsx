import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConstellationField } from "@/components/constellation";
import { ArrowUpRight, Sparkle } from "@phosphor-icons/react/dist/ssr";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-paper">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28 lg:grid-cols-12 lg:gap-8 lg:pt-28">
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-[0.75rem] font-medium tracking-tight text-ink-soft">
            <Sparkle size={13} weight="fill" className="text-ink-faint" />
            Automatización con IA de nueva generación
          </span>

          <h1 className="mt-6 text-[2.75rem] leading-[0.98] font-semibold tracking-[-0.035em] text-ink sm:text-[3.75rem] lg:text-[4.25rem]">
            Tu negocio en piloto automático.
          </h1>

          <p className="mt-7 max-w-[46ch] text-[1.0625rem] leading-relaxed text-ink-mute">
            Sistemas, agentes y software que trabajan 24/7. Escalá tus
            ventas y eliminá el trabajo manual sin aumentar tu planilla.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/mis-herramientas#analizador" variant="primary" size="lg">
              <Sparkle size={16} weight="fill" />
              Analizar mi negocio
            </Button>
            <Button href="/planes" variant="secondary" size="lg">
              Ver catálogo de soluciones
              <ArrowUpRight size={16} weight="bold" />
            </Button>
          </div>

          <div className="mt-14 flex items-center gap-6 text-[0.8125rem] text-ink-faint">
            <span>Diagnóstico sin costo</span>
            <span className="h-1 w-1 rounded-full bg-line-strong" />
            <span>Presupuesto fijo en 48 horas</span>
            <span className="hidden h-1 w-1 rounded-full bg-line-strong sm:block" />
            <span className="hidden sm:block">Primeras piezas en 2 a 5 días</span>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden rounded-2xl bg-ink p-6 lg:aspect-auto lg:h-full lg:p-8">
            <ConstellationField className="absolute inset-0 h-full w-full text-paper/70" />

            <span className="eyebrow absolute top-7 left-7 flex items-center gap-1.5 text-paper/50">
              <Sparkle size={12} weight="fill" />
              Analizador con IA
            </span>

            <div className="relative rounded-xl border border-paper/15 bg-paper/[0.06] p-5 backdrop-blur-sm">
              <p className="text-[0.8125rem] leading-relaxed text-paper/60 italic">
                &ldquo;Tengo una panadería, agendamos pedidos grandes por
                WhatsApp a mano y no llevamos ningún control.&rdquo;
              </p>

              <div className="my-4 h-px bg-paper/10" />

              <p className="eyebrow mb-2 text-paper/40">Recomendación</p>
              <p className="text-[0.9375rem] leading-snug font-medium text-paper">
                Asistente de WhatsApp que responde y agenda
              </p>
              <p className="mt-1.5 text-[0.8125rem] tnum text-paper/55">
                desde ₡690 000 · 7 días
              </p>

              <Link
                href="/mis-herramientas#analizador"
                className="mt-5 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-paper text-[0.8125rem] font-medium text-ink transition-opacity hover:opacity-90"
              >
                Analizar mi negocio
                <ArrowUpRight size={13} weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
