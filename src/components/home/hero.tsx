import { Button } from "@/components/ui/button";
import { AnalyzerLive } from "@/components/home/analyzer-live";
import { HeroFondo } from "@/components/home/hero-fondo";
import { ArrowUpRight, Check, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";

export function Hero({ idioma = "es" }: { idioma?: Idioma }) {
  const t = getCopy(idioma).hero;

  return (
    <section data-tema="oscuro" className="relative overflow-hidden bg-noche">
      {/* Fondo animado: mensajes que viajan por un circuito hasta el agente.
          Reemplaza al resplandor difuminado (2026-10-20), que sobre negro
          puro se leía como un filtro gris. */}
      <HeroFondo />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 pt-12 pb-16 sm:px-8 sm:pt-16 sm:pb-20 lg:grid-cols-12 lg:gap-8 lg:pt-20 lg:pb-24">
        <div className="lg:col-span-7">
          {/* La insignia dice qué es, sin adjetivos de relleno. */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-acento px-3 py-1.5 text-[0.75rem] font-medium tracking-tight text-noche-texto">
            <Sparkle size={13} weight="fill" className="text-acento-claro" />
            {t.insignia}
          </span>

          {/* Titular tipo manifiesto: la segunda frase lleva un subrayado
              que se dibuja (ver `.subrayado-vivo` en globals.css) para que el
              contraste "ella atiende / vos seguís" pegue de un vistazo. La
              bajada dice qué hace y para quién, sin promesas de resultados. */}
          <h1 className="mt-6 text-[2.5rem] leading-[1.1] font-semibold tracking-[-0.03em] text-noche-texto uppercase sm:text-[3.25rem] lg:text-[3.75rem]">
            {t.titulo1}{" "}
            <span className="subrayado-vivo">{t.titulo2}</span>
          </h1>

          <p className="mt-7 max-w-[52ch] text-[1.0625rem] leading-relaxed text-noche-texto">
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

          <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[0.8125rem] text-noche-texto">
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

        {/* El analizador es el "chip" del circuito de fondo: las pistas se
            enchufan a este borde (data-hero-chip, ver hero-fondo.tsx) y el
            fondo negro sólido tapa lo que quedaría detrás del texto. */}
        <div
          data-hero-chip
          className="relative mx-auto w-full max-w-[380px] rounded-2xl border border-noche-texto bg-noche p-5 lg:col-span-5"
        >
          <AnalyzerLive idioma={idioma} />
        </div>
      </div>
    </section>
  );
}
