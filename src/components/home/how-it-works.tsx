import {
  MagnifyingGlass,
  MapTrifold,
  Wrench,
  ChartLineUp,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";

const pasos = [
  {
    n: "01",
    icon: MagnifyingGlass,
    titulo: "Diagnóstico gratuito",
    tiempo: "30 minutos",
    detalle:
      "Revisamos tus herramientas y procesos actuales y detectamos los tres con más retorno posible.",
  },
  {
    n: "02",
    icon: MapTrifold,
    titulo: "Mapa y presupuesto fijo",
    tiempo: "48 horas",
    detalle:
      "Recibís el diagrama de cada flujo propuesto, el nivel de complejidad y el precio cerrado.",
  },
  {
    n: "03",
    icon: Wrench,
    titulo: "Implementación y pruebas",
    tiempo: "2 a 21 días",
    detalle:
      "Construimos, probamos con tus datos reales y ajustamos antes de dejarlo corriendo solo.",
  },
  {
    n: "04",
    icon: ChartLineUp,
    titulo: "Monitoreo y mejora",
    tiempo: "Continuo",
    detalle:
      "Alertas automáticas si algo falla, informe mensual de horas ahorradas y ajustes incluidos según el plan.",
  },
];

export function HowItWorks() {
  return (
    <section data-tema="oscuro" className="border-b border-noche-texto/10 bg-noche">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <p className="eyebrow mb-5 text-noche-texto/55">Cómo funciona</p>
          <h2 className="max-w-[22ch] text-[2rem] leading-[1.05] font-semibold tracking-tight text-noche-texto sm:text-[2.5rem]">
            De la primera llamada al flujo corriendo solo
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pasos.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.n} delay={i * 90}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-noche-texto/15 bg-noche-texto/[0.04] p-7 transition-colors duration-200 hover:border-acento/40">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-3 right-3 font-mono text-[4.5rem] leading-none font-semibold text-noche-texto/[0.06]"
                  >
                    {p.n}
                  </span>
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-noche-texto/10 bg-noche-texto/[0.06] text-noche-texto">
                    <Icon size={20} />
                  </div>
                  <p className="eyebrow relative mt-6 text-noche-texto/55">
                    {p.tiempo}
                  </p>
                  <h3 className="relative mt-2 text-[1.1875rem] font-medium tracking-tight text-noche-texto">
                    {p.titulo}
                  </h3>
                  <p className="relative mt-3 text-[0.9375rem] leading-relaxed text-noche-texto/55">
                    {p.detalle}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
