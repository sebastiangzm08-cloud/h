import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";

export function FinalCta() {
  return (
    <section data-tema="oscuro" className="bg-noche">
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-[2.25rem] leading-[1.05] font-semibold tracking-tight text-noche-texto sm:text-[3rem]">
            Empecemos por los tres procesos que más te cuestan
          </h2>
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-noche-texto/60">
            Treinta minutos, sin costo, sin compromiso de contratar nada
            después.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/diagnostico" variant="inverse" size="lg">
              Agenda tu diagnóstico
            </Button>
            <Button href="/planes" variant="secondaryDark" size="lg">
              Ver planes y precios
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
