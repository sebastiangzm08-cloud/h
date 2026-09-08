import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { CatalogLink } from "@/components/catalog-link";
import { negocios, catalogo, planPorNivel } from "@/lib/content";
import { site } from "@/config/site";

export function generateStaticParams() {
  return negocios.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const negocio = negocios.find((n) => n.slug === slug);
  if (!negocio) return {};
  return {
    title: `Automatización para ${negocio.nombre} — ${site.nombre}`,
    description: negocio.dolor,
  };
}

export default async function NegocioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const negocio = negocios.find((n) => n.slug === slug);
  if (!negocio) notFound();

  const items = negocio.catalogoIds
    .map((id) => catalogo.find((c) => c.id === id))
    .filter((c) => c !== undefined);

  return (
    <>
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <Link
            href="/que-automatizamos"
            className="inline-flex items-center gap-1.5 text-[0.875rem] text-ink-mute hover:text-ink"
          >
            <ArrowLeft size={15} />
            Qué automatizamos
          </Link>

          <Reveal>
            <p className="eyebrow mt-8 mb-5">Automatización para</p>
            <h1 className="max-w-[24ch] text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.03em] text-ink sm:text-[3.25rem]">
              {negocio.nombre}
            </h1>
            <p className="mt-6 max-w-[56ch] text-[1.0625rem] leading-relaxed text-ink-mute">
              {negocio.nota}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Hoy / automático, lado a lado. El contraste es el argumento — no
          hace falta explicarlo aparte. */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 border-t border-line lg:grid-cols-2">
            {/* Hoy: apagado, sin acento. */}
            <div className="border-b border-line py-14 pr-0 lg:border-r lg:border-b-0 lg:pr-12">
              <p className="eyebrow mb-6">Así trabaja hoy</p>
              <ol className="flex flex-col gap-3.5">
                {negocio.comoTrabajaHoy.map((paso, i) => (
                  <Reveal key={paso} delay={i * 40} as="li">
                    <div className="flex items-baseline gap-3.5">
                      <span className="shrink-0 font-mono text-[0.6875rem] text-ink-faint tnum">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="text-[0.9375rem] leading-snug text-ink-mute">
                        {paso}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </ol>
              <p className="mt-7 border-t border-line pt-5 text-[0.8125rem] leading-relaxed text-ink-faint">
                {negocio.dolor}
              </p>
            </div>

            {/* Automático: mismo esqueleto, acento violeta. */}
            <div className="py-14 pl-0 lg:pl-12">
              <p className="eyebrow mb-6 text-acento">La automatización completa</p>
              <ol className="flex flex-col gap-3.5">
                {negocio.automatizacionCompleta.map((paso, i) => (
                  <Reveal key={paso} delay={i * 40 + 120} as="li">
                    <div className="flex items-baseline gap-3.5">
                      <span className="shrink-0 font-mono text-[0.6875rem] text-acento tnum">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="text-[0.9375rem] leading-snug text-ink-soft">
                        {paso}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </ol>
              <div className="mt-7 rounded-2xl border border-acento/25 bg-acento/[0.06] p-5">
                <p className="eyebrow mb-2 text-acento">Qué gana</p>
                <p className="text-[0.875rem] leading-relaxed text-ink-soft">
                  {negocio.queGana}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Del catálogo */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
            <p className="eyebrow">Del catálogo</p>
            {/* Cada tarjeta de abajo dice "Incluido en {plan}" pensando en
                esa automatización elegida SOLA. Acá van {items.length} juntas,
                así que el plan real es este, no la suma de las etiquetas. */}
            <p className="text-[0.875rem] text-ink-mute">
              Las {items.length} juntas ={" "}
              <span className="font-medium text-ink">
                {negocio.planSugerido}
              </span>
            </p>
          </div>
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

          {negocio.ojoCon && negocio.ojoCon.length > 0 && (
            <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-line bg-paper p-6">
              <p className="eyebrow">Ojo con</p>
              <ul className="flex flex-col gap-2.5">
                {negocio.ojoCon.map((texto) => (
                  <li
                    key={texto}
                    className="text-[0.875rem] leading-relaxed text-ink-mute"
                  >
                    {texto}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-16 sm:flex-row sm:items-center sm:px-8">
          <div>
            <p className="eyebrow mb-2">¿Tu negocio se parece a este?</p>
            <p className="text-[1.0625rem] leading-relaxed text-ink-mute">
              Contanos qué te está costando tiempo y salimos con un plan.
            </p>
          </div>
          <Button href="/diagnostico" variant="primary" size="md">
            Agenda tu diagnóstico
          </Button>
        </div>
      </section>
    </>
  );
}
