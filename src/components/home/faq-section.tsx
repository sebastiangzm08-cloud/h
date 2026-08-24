import { Reveal } from "@/components/reveal";
import { FaqAccordion } from "@/components/faq-accordion";
import { faq } from "@/lib/content";

export function FaqSection() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="eyebrow mb-5">Preguntas frecuentes</p>
              <h2 className="text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
                Antes de que preguntes
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-8">
            <FaqAccordion items={faq} />
          </div>
        </div>
      </div>
    </section>
  );
}
