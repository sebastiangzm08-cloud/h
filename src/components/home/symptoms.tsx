import { Reveal } from "@/components/reveal";
import { sintomas } from "@/lib/content";

export function Symptoms() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="eyebrow mb-5">El síntoma es siempre el mismo</p>
              <h2 className="text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
                No importa el sector. El desgaste se ve idéntico.
              </h2>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <ul className="divide-y divide-line border-t border-line">
              {sintomas.map((s, i) => (
                <Reveal key={s} delay={i * 60} as="li">
                  <div className="flex items-start gap-5 py-6">
                    <span className="font-mono text-[0.8125rem] text-ink-faint pt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
                      {s}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
