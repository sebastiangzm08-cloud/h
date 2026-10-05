import Link from "next/link";
import { Info } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { PlansGrid } from "@/components/plans/plans-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { Reveal } from "@/components/reveal";
import { site } from "@/config/site";
import { getContenido } from "@/lib/contenido";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";

/** Página del plan. Un solo plan: tarjeta a la izquierda, a la derecha cómo
    se empieza y las condiciones por escrito. */
export function PlanesView({ idioma }: { idioma: Idioma }) {
  const t = getCopy(idioma);
  const p = t.plan.pagina;
  const { planes, automatizaciones } = getContenido(idioma);
  const hrefDiagnostico = idioma === "en" ? "/en/diagnostic" : "/diagnostico";

  const planesJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: t.meta.schemaServicio,
    provider: {
      "@type": "Organization",
      name: site.nombre,
      url: site.url,
    },
    areaServed: idioma === "en" ? "US" : "CR",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: idioma === "en" ? "Hoshizora plan" : "Plan de Hoshizora",
      itemListElement: planes.map((plan) => ({
        "@type": "Offer",
        name: plan.nombre,
        description: plan.para,
        price: plan.mensual,
        priceCurrency: plan.moneda,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: plan.mensual,
          priceCurrency: plan.moneda,
          billingDuration: "P1M",
        },
      })),
    },
  };

  return (
    <>
      <JsonLd data={planesJsonLd} />
      <PageHeader eyebrow={p.eyebrow} title={p.titulo} lead={p.lead} />

      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <PlansGrid
                planes={planes}
                automatizaciones={automatizaciones}
                idioma={idioma}
              />
            </div>

            <div className="lg:col-span-6">
              <Reveal>
                <p className="eyebrow mb-5">{p.comoEmpezamos}</p>
                <ol className="flex flex-col divide-y divide-line border-t border-b border-line">
                  {p.pasos.map((paso, i) => (
                    <li key={paso} className="flex items-start gap-4 py-5">
                      <span className="font-mono text-[0.75rem] tracking-[0.14em] text-acento">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[0.9375rem] leading-relaxed text-ink-soft">
                        {paso}
                      </span>
                    </li>
                  ))}
                </ol>

                <div className="mt-8 flex items-start gap-3 rounded-xl border border-line bg-surface p-5">
                  <Info size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-faint" />
                  <p className="text-[0.875rem] leading-relaxed text-ink-mute">
                    {p.nota}
                  </p>
                </div>

                <p className="mt-6 text-[0.875rem] text-ink-mute">
                  {p.otro}{" "}
                  <Link
                    href={hrefDiagnostico}
                    className="text-ink-soft underline underline-offset-4 transition-colors hover:text-ink"
                  >
                    {p.otroLink}
                  </Link>{" "}
                  {p.otroResto}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
