import { Reveal } from "@/components/reveal";

const pasos = [
  {
    n: "01",
    titulo: "Diagnóstico gratuito",
    tiempo: "30 minutos",
    detalle:
      "Revisamos tus herramientas y procesos actuales y detectamos los tres con más retorno posible.",
  },
  {
    n: "02",
    titulo: "Mapa y presupuesto fijo",
    tiempo: "48 horas",
    detalle:
      "Recibís el diagrama de cada flujo propuesto, el nivel de complejidad y el precio cerrado.",
  },
  {
    n: "03",
    titulo: "Implementación y pruebas",
    tiempo: "2 a 21 días",
    detalle:
      "Construimos, probamos con tus datos reales y ajustamos antes de dejarlo corriendo solo.",
  },
  {
    n: "04",
    titulo: "Monitoreo y mejora",
    tiempo: "Continuo",
    detalle:
      "Alertas automáticas si algo falla, informe mensual de horas ahorradas y ajustes incluidos según el plan.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <p className="eyebrow mb-5">Cómo funciona</p>
          <h2 className="max-w-[22ch] text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
            De la primera llamada al flujo corriendo solo
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {pasos.map((p, i) => (
            <Reveal key={p.n} delay={i * 90}>
              <div className="border-t border-ink pt-6">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[0.8125rem] text-ink-faint">
                    {p.n}
                  </span>
                  <span className="eyebrow text-ink-faint">{p.tiempo}</span>
                </div>
                <h3 className="mt-5 text-[1.1875rem] font-medium tracking-tight text-ink">
                  {p.titulo}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-mute">
                  {p.detalle}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
