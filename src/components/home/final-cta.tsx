import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";

export function FinalCta({ idioma = "es" }: { idioma?: Idioma }) {
  const t = getCopy(idioma).cta;
  return (
    <section data-tema="oscuro" className="border-t border-noche-texto bg-noche">
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-[2.25rem] leading-[1.05] font-semibold tracking-tight text-noche-texto sm:text-[3rem]">
            {t.titulo}
          </h2>
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-noche-texto">
            {t.texto}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={t.principal.href} variant="inverse" size="lg">
              {t.principal.label}
            </Button>
            <Button href={t.secundario.href} variant="secondaryDark" size="lg">
              {t.secundario.label}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
