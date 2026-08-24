import { Reveal } from "@/components/reveal";

const filas = [
  { metrica: "Tiempo en cargar un lead al CRM", antes: "4 a 6 minutos", despues: "Inmediato" },
  { metrica: "Primer contacto con el cliente", antes: "Al día siguiente", despues: "Menos de 2 minutos" },
  { metrica: "Errores de transcripción por mes", antes: "12 a 20", despues: "0 a 1" },
  { metrica: "Horas administrativas por semana", antes: "9", despues: "2" },
];

export function BeforeAfter() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="eyebrow mb-5">Demostración</p>
              <h2 className="text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
                El mismo proceso, dos formas de operarlo
              </h2>
              <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-mute">
                Caso de referencia sobre un flujo de captación de leads,
                usado para mostrar el orden de magnitud del cambio.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-line bg-paper">
              <div className="grid grid-cols-3 border-b border-line bg-surface-2 text-[0.8125rem]">
                <div className="px-5 py-3.5">
                  <span className="eyebrow">Métrica</span>
                </div>
                <div className="px-5 py-3.5">
                  <span className="eyebrow">Antes</span>
                </div>
                <div className="px-5 py-3.5">
                  <span className="eyebrow">Después</span>
                </div>
              </div>
              <div className="divide-y divide-line">
                {filas.map((f, i) => (
                  <Reveal key={f.metrica} delay={i * 60} as="div">
                    <div className="grid grid-cols-3 items-center">
                      <div className="px-5 py-5 text-[0.9375rem] text-ink-soft">
                        {f.metrica}
                      </div>
                      <div className="px-5 py-5 text-[0.9375rem] tnum text-ink-faint">
                        {f.antes}
                      </div>
                      <div className="px-5 py-5 text-[0.9375rem] font-medium tnum text-ink">
                        {f.despues}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
