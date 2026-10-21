import { Reveal } from "@/components/reveal";
import { FaqAccordion } from "@/components/faq-accordion";
import { JsonLd } from "@/components/seo/json-ld";
import { getContenido } from "@/lib/contenido";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";

export function FaqSection({ idioma = "es" }: { idioma?: Idioma }) {
  const t = getCopy(idioma).faq;
  const { faq } = getContenido(idioma);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: idioma === "en" ? "en" : "es",
    mainEntity: faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
  };

  return (
    <section data-tema="oscuro" className="tema-noche border-b border-line bg-paper">
      <JsonLd data={faqJsonLd} />
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="eyebrow mb-5">{t.eyebrow}</p>
              <h2 className="text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
                {t.titulo}
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
