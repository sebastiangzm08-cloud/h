import { Button } from "@/components/ui/button";
import { AnalyzerLive } from "@/components/home/analyzer-live";
import { ArrowUpRight, Check, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";

export function Hero({ idioma = "es" }: { idioma?: Idioma }) {
  const t = getCopy(idioma).hero;

  return (
    <section data-tema="oscuro" className="relative overflow-hidden bg-noche">
      {/* Resplandor ambiental: lo que hace que el negro se sienta profundo
          en vez de plano. Decorativo, sin capturar clics. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-56 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-acento/20 blur-[150px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -bottom-40 h-[420px] w-[520px] rounded-full bg-acento/10 blur-[130px]"
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 pt-12 pb-16 sm:px-8 sm:pt-16 sm:pb-20 lg:grid-cols-12 lg:gap-8 lg:pt-20 lg:pb-24">
        <div className="lg:col-span-7">
          {/* La insignia dice qué es, sin adjetivos de relleno. */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-acento/30 bg-acento/[0.07] px-3 py-1.5 text-[0.75rem] font-medium tracking-tight text-noche-texto/80">
            <Sparkle size={13} weight="fill" className="text-acento-claro" />
            {t.insignia}
          </span>

          {/* Titular tipo manifiesto: la segunda frase va en color de acento
              para que el contraste "ella atiende / vos seguís" pegue de un
              vistazo. La bajada dice qué hace y para quién, sin promesas
              de resultados. */}
          <h1 className="mt-6 text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.03em] text-noche-texto uppercase sm:text-[3.25rem] lg:text-[3.75rem]">
            {t.titulo1}{" "}
            <span className="text-acento-claro">{t.titulo2}</span>
          </h1>

          <p className="mt-7 max-w-[52ch] text-[1.0625rem] leading-relaxed text-noche-texto/65">
            {t.bajada}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href={t.ctaPrincipal.href} variant="inverse" size="lg">
              <Sparkle size={16} weight="fill" />
              {t.ctaPrincipal.label}
            </Button>
            <Button href={t.ctaSecundario.href} variant="secondaryDark" size="lg">
              {t.ctaSecundario.label}
              <ArrowUpRight size={16} weight="bold" />
            </Button>
          </div>

          <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[0.8125rem] text-noche-texto/65">
            {t.garantias.map((g) => (
              <li key={g} className="flex items-center gap-2">
                <Check
                  size={13}
                  weight="bold"
                  aria-hidden="true"
                  className="text-acento-claro"
                />
                {g}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative lg:col-span-5">
          <AnalyzerLive idioma={idioma} />
        </div>
      </div>
    </section>
  );
}
