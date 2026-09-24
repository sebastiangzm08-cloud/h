import type { Metadata } from "next";
import { paginaMeta } from "@/lib/seo/pagina-meta";
import Link from "next/link";
import { Info } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { PlansGrid } from "@/components/plans/plans-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { planes } from "@/lib/content";
import { site } from "@/config/site";

const tituloPlanes = `Planes y precios — ${site.nombre}`;
const descripcionPlanes =
  "Planes mensuales de automatización, con precio cerrado y las automatizaciones incluidas en cada uno.";

export const metadata: Metadata = paginaMeta({
  titulo: tituloPlanes,
  descripcion: descripcionPlanes,
  ruta: "/planes",
});

const planesJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Automatización de procesos de negocio",
  provider: {
    "@type": "Organization",
    name: site.nombre,
    url: site.url,
  },
  areaServed: "CR",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Planes de Hoshizora",
    itemListElement: planes.map((plan) => ({
      "@type": "Offer",
      name: plan.nombre,
      description: plan.para,
      ...("aCotizar" in plan && plan.aCotizar
        ? {}
        : {
            price: plan.mensual,
            priceCurrency: site.pago.moneda,
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: plan.mensual,
              priceCurrency: site.pago.moneda,
              billingDuration: "P1M",
            },
          }),
    })),
  },
};

export default function PlanesPage() {
  return (
    <>
      <JsonLd data={planesJsonLd} />
      <PageHeader
        eyebrow="Shop"
        title="Precios claros, sin llamada obligatoria para verlos"
        lead="Tres planes de acompañamiento continuo, cada uno con las automatizaciones que trae. Elegí lo que tenga sentido para el tamaño de tu operación."
      />

      {/* Planes */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-32">
          <PlansGrid planes={planes} />

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-line bg-surface p-5">
            <Info size={18} className="mt-0.5 shrink-0 text-ink-faint" />
            <p className="text-[0.875rem] leading-relaxed text-ink-mute">
              Los precios no incluyen las licencias ni los costos de API de
              tus propias herramientas (CRM, API de WhatsApp Business,
              créditos de IA cuando el flujo los usa) — esos van aparte y
              corren por cuenta del cliente. No se cobra impuesto al valor
              agregado por ahora. Todo se detalla por escrito en el
              presupuesto antes de contratar. El pago anual equivale a diez
              meses en lugar de doce.
            </p>
          </div>

          <p className="mt-6 text-[0.875rem] text-ink-mute">
            ¿No encontrás lo que necesitás?{" "}
            <Link
              href="/diagnostico"
              className="text-ink-soft underline underline-offset-4"
            >
              Agenda un diagnóstico
            </Link>{" "}
            y lo diseñamos a medida.
          </p>
        </div>
      </section>
    </>
  );
}
