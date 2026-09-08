import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { CatalogLink } from "@/components/catalog-link";
import { procesos, catalogo, planPorNivel } from "@/lib/content";
import { site } from "@/config/site";

export function generateStaticParams() {
  return procesos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const proceso = procesos.find((p) => p.slug === slug);
  if (!proceso) return {};
  return {
    title: `${proceso.nombre} — ${site.nombre}`,
    description: proceso.resumen,
  };
}

export default async function ProcesoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const proceso = procesos.find((p) => p.slug === slug);
  if (!proceso) notFound();

  const items = catalogo.filter((c) => c.proceso === proceso.slug);
  const idx = procesos.findIndex((p) => p.slug === proceso.slug);
  const siguiente = procesos[(idx + 1) % procesos.length];

  return (
    <>
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <Link
            href="/que-automatizamos"
            className="inline-flex items-center gap-1.5 text-[0.875rem] text-ink-mute hover:text-ink"
          >
            <ArrowLeft size={15} />
            Los seis procesos
          </Link>

          <Reveal>
            <p className="eyebrow mt-8 mb-5">Proceso {proceso.n}</p>
            <h1 className="max-w-[24ch] text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.03em] text-ink sm:text-[3.25rem]">
              {proceso.titular}
            </h1>
            <p className="mt-6 max-w-[56ch] text-[1.0625rem] leading-relaxed text-ink-mute">
              {proceso.resumen}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <p className="eyebrow mb-6">Se ve así hoy</p>
          <ul className="grid grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-3">
            {proceso.sintomas.map((s, i) => (
              <Reveal key={s} delay={i * 80} as="li">
                <p className="text-[0.9375rem] leading-relaxed text-ink-soft">
                  {s}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <p className="eyebrow mb-8">Automatizaciones para este proceso</p>
          {items.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((a) => (
                <CatalogLink
                  key={a.id}
                  automatizacion={a}
                  className="group flex flex-col justify-between rounded-2xl border border-line bg-paper p-6 transition-colors hover:border-ink-mute"
                >
                  <div>
                    <div className="flex items-center justify-end">
                      <ArrowUpRight
                        size={16}
                        className="text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </div>
                    <p className="mt-4 text-[1.0625rem] font-medium leading-snug tracking-tight text-ink">
                      {a.nombre}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-[0.8125rem]">
                    <span className="text-ink-faint">
                      {a.disponible ? a.plazo : "Contratar"}
                    </span>
                    <span className="font-medium text-ink">
                      Incluido en {planPorNivel[a.nivel]}
                    </span>
                  </div>
                </CatalogLink>
              ))}
            </div>
          ) : (
            <p className="text-[0.9375rem] text-ink-mute">
              Este proceso se resuelve caso por caso. Contanos el tuyo en el
              diagnóstico.
            </p>
          )}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-16 sm:flex-row sm:items-center sm:px-8">
          <div>
            <p className="eyebrow mb-2">Siguiente proceso</p>
            <Link
              href={`/procesos/${siguiente.slug}`}
              className="text-[1.25rem] font-medium tracking-tight text-ink hover:underline"
            >
              {siguiente.nombre}
            </Link>
          </div>
          <Button href="/diagnostico" variant="primary" size="md">
            Agenda tu diagnóstico
          </Button>
        </div>
      </section>
    </>
  );
}
