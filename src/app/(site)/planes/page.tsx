import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { PlanCard } from "@/components/plans/plan-card";
import { CatalogBrowser } from "@/components/plans/catalog-browser";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { planes, niveles } from "@/lib/content";
import { colones, site } from "@/config/site";

export const metadata: Metadata = {
  title: `Planes y precios — ${site.nombre}`,
  description:
    "Planes mensuales de automatización y catálogo de automatizaciones con precio y plazo cerrados.",
};

export default function PlanesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Shop"
        title="Precios claros, sin llamada obligatoria para verlos"
        lead="Tres planes de acompañamiento continuo y un catálogo de automatizaciones puntuales con precio y plazo cerrados. Elegí lo que tenga sentido para el tamaño de tu operación."
      />

      {/* Planes */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {planes.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <PlanCard plan={p} full />
              </Reveal>
            ))}
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-line bg-surface p-5">
            <Info size={18} className="mt-0.5 shrink-0 text-ink-faint" />
            <p className="text-[0.875rem] leading-relaxed text-ink-mute">
              Los precios no incluyen las licencias de tus propias
              herramientas (CRM, API de WhatsApp Business, créditos de IA
              cuando el flujo los usa) ni el impuesto al valor agregado.
              Todo se detalla por escrito en el presupuesto antes de
              contratar. El pago anual equivale a diez meses en lugar de
              doce.
            </p>
          </div>
        </div>
      </section>

      {/* Niveles de complejidad */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
          <Reveal>
            <p className="eyebrow mb-5">Cómo se cotiza un proyecto</p>
            <h2 className="max-w-[30ch] text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
              El precio lo fija la complejidad del flujo, no el sector
            </h2>
            <p className="mt-5 max-w-[60ch] text-[0.9375rem] leading-relaxed text-ink-mute">
              No cobramos distinto por industria. Cobramos según cuántas
              aplicaciones conecta un flujo, si necesita lógica condicional
              o inteligencia artificial, y si tus herramientas exponen una
              API o no.
            </p>
          </Reveal>

          <div className="mt-14 overflow-x-auto rounded-2xl border border-line bg-paper">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-surface-2">
                  <th className="px-6 py-4 text-[0.75rem] tracking-wide text-ink-faint uppercase">
                    Nivel
                  </th>
                  <th className="px-6 py-4 text-[0.75rem] tracking-wide text-ink-faint uppercase">
                    Qué es
                  </th>
                  <th className="px-6 py-4 text-[0.75rem] tracking-wide text-ink-faint uppercase">
                    Ejemplo
                  </th>
                  <th className="px-6 py-4 text-[0.75rem] tracking-wide text-ink-faint uppercase">
                    Plazo
                  </th>
                  <th className="px-6 py-4 text-[0.75rem] tracking-wide text-ink-faint uppercase">
                    Desde
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {niveles.map((n) => (
                  <tr key={n.id}>
                    <td className="px-6 py-5 align-top">
                      <span className="font-mono text-[0.8125rem] font-medium text-ink">
                        {n.id}
                      </span>
                      <p className="mt-0.5 text-[0.9375rem] font-medium text-ink">
                        {n.nombre}
                      </p>
                    </td>
                    <td className="px-6 py-5 align-top text-[0.875rem] leading-relaxed text-ink-mute">
                      {n.definicion}
                    </td>
                    <td className="px-6 py-5 align-top text-[0.875rem] text-ink-mute italic">
                      {n.ejemplo}
                    </td>
                    <td className="px-6 py-5 align-top text-[0.875rem] tnum text-ink-soft">
                      {n.plazo}
                    </td>
                    <td className="px-6 py-5 align-top text-[0.875rem] font-medium tnum text-ink">
                      {n.desde ? colones(n.desde) : "A cotizar"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-[0.8125rem] text-ink-faint">
            Recargo si la herramienta no tiene API (requiere automatización
            frágil por interfaz) o si el sistema es local y sin
            integraciones. Descuento por contratar tres o más
            automatizaciones a la vez.
          </p>
        </div>
      </section>

      {/* Auditoría */}
      <section className="border-b border-line bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="eyebrow mb-4 text-paper/50">
                Producto de entrada
              </p>
              <h2 className="text-[1.75rem] font-semibold tracking-tight sm:text-[2.125rem]">
                Auditoría de Automatización
              </h2>
              <p className="mt-4 max-w-[62ch] text-[0.9375rem] leading-relaxed text-paper/65">
                Dos sesiones de trabajo, mapa completo de tus procesos, los
                cinco más automatizables ordenados por retorno, y un plan
                con plazos y precios. Te lo llevás documentado aunque
                decidas no contratar nada después. El costo se descuenta
                por completo si avanzás con un proyecto.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 lg:col-span-4 lg:items-end">
              <span className="text-[1.75rem] font-semibold tracking-tight tnum">
                {colones(95000)}
              </span>
              <Button href="/diagnostico" variant="secondary" size="lg" className="border-paper/25 bg-paper text-ink hover:bg-paper/90">
                Reservar auditoría
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <p className="eyebrow mb-5">Catálogo</p>
            <h2 className="max-w-[26ch] text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
              Automatizaciones puntuales, precio y plazo cerrados
            </h2>
            <p className="mt-5 max-w-[60ch] text-[0.9375rem] leading-relaxed text-ink-mute">
              Organizado por los seis procesos que existen en cualquier
              negocio. Elegí una y contratala directo, o usala como punto
              de partida para conversar sobre tu caso.
            </p>
          </Reveal>

          <div className="mt-14">
            <CatalogBrowser />
          </div>

          <p className="mt-10 text-[0.875rem] text-ink-mute">
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
