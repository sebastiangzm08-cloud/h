import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  ChatCircleDots,
  MegaphoneSimple,
  MagnifyingGlass,
} from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { automatizaciones } from "@/lib/content";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Qué automatizamos — ${site.nombre}`,
  description:
    "Las automatizaciones que Hoshizora tiene listas hoy: publicador de contenido, bot de WhatsApp y prospección de mercado. Una por plan.",
};

const iconos: Record<string, typeof ChatCircleDots> = {
  "publicador-de-contenido": MegaphoneSimple,
  "bot-de-whatsapp": ChatCircleDots,
  prospeccion: MagnifyingGlass,
};

function precioTexto(precio: number | null) {
  return precio == null ? "A cotizar" : `₡${precio.toLocaleString("es-CR")} / mes`;
}

export default function QueAutomatizamosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Qué automatizamos"
        title="Tres automatizaciones listas. Una por plan."
        lead="Por ahora arrancamos con estas tres, completas y andando desde el primer día. Vamos agregando más — cuando sumemos, aparecen acá."
      />

      <section className="bg-paper">
        <div className="mx-auto max-w-5xl px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="flex flex-col gap-5">
            {automatizaciones.map((a, i) => {
              const Icon = iconos[a.slug] ?? ChatCircleDots;
              return (
                <Reveal key={a.slug} delay={i * 60}>
                  <article className="rounded-2xl border border-line bg-paper p-7 sm:p-9">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line-strong bg-surface text-ink">
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-[1.25rem] leading-tight font-semibold tracking-tight text-ink">
                          {a.nombre}
                        </h2>
                        <p className="text-[0.8125rem] text-ink-faint">
                          Plan {a.plan} · {precioTexto(a.precio)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 max-w-[60ch] text-[0.9375rem] leading-relaxed text-ink-mute">
                      {a.descripcion}
                    </p>

                    <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                      {a.puntos.map((p) => (
                        <li
                          key={p}
                          className="flex items-start gap-2 text-[0.875rem] leading-snug text-ink-soft"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                          {p}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/planes"
                      className="mt-6 inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
                    >
                      Ver el plan {a.plan}
                      <ArrowUpRight size={15} />
                    </Link>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <p className="mt-10 text-[0.875rem] text-ink-mute">
            ¿Necesitás algo que no está acá?{" "}
            <Link
              href="/diagnostico"
              className="text-ink-soft underline underline-offset-4"
            >
              Agendá un diagnóstico
            </Link>{" "}
            y lo vemos.
          </p>
        </div>
      </section>
    </>
  );
}
