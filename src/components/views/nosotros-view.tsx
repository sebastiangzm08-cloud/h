import { Handshake, PlugsConnected, Target } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { ConstellationMark } from "@/components/constellation";
import { Button } from "@/components/ui/button";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";

const iconos = {
  objetivo: Target,
  plug: PlugsConnected,
  mano: Handshake,
} as const;

export function NosotrosView({ idioma }: { idioma: Idioma }) {
  const t = getCopy(idioma).nosotros;

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.titulo} lead={t.lead} />

      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Reveal>
                <div className="flex aspect-[4/5] flex-col justify-between rounded-2xl bg-surface-2 p-7">
                  <ConstellationMark className="h-8 w-8 text-ink-mute" />
                  <div>
                    <p className="text-[1.125rem] font-medium tracking-tight text-ink">
                      {t.fundador}
                    </p>
                    <p className="mt-1 text-[0.875rem] text-ink-mute">
                      {t.fundadorRol}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-mute">
                  {t.bio}
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              <div className="flex flex-col gap-4">
                {t.principios.map((p, i) => {
                  const Icon = iconos[p.icono as keyof typeof iconos];
                  return (
                    <Reveal key={p.t} delay={i * 90} as="div">
                      <div className="rounded-2xl border border-line bg-paper p-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line-strong bg-surface text-ink">
                          <Icon size={19} aria-hidden="true" />
                        </div>
                        <h2 className="mt-5 text-[1.1875rem] font-medium tracking-tight text-ink">
                          {p.t}
                        </h2>
                        <p className="mt-2.5 max-w-[60ch] text-[0.9375rem] leading-relaxed text-ink-mute">
                          {p.d}
                        </p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-8">
          <h2 className="text-[1.75rem] font-semibold tracking-tight text-ink">
            {t.cierre}
          </h2>
          <div className="mt-7">
            <Button href={t.cta.href} variant="primary" size="lg">
              {t.cta.label}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
