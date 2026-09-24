import type { Metadata } from "next";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DraftBanner } from "@/components/draft-banner";
import { Button } from "@/components/ui/button";
import { ConstellationField, ConstellationMark } from "@/components/constellation";
import { site } from "@/config/site";

/* Nunca se indexa: un 404 no es contenido que quede en resultados de
   búsqueda, aunque la respuesta streameada llegue como 200 antes de que
   resuelva el código de estado real. */
export const metadata: Metadata = {
  title: `Página no encontrada — ${site.nombre}`,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <DraftBanner />
      <Navbar />
      <main className="flex-1">
        <section
          data-tema="oscuro"
          className="relative flex items-center overflow-hidden bg-noche py-24 sm:py-32"
        >
          {/* Mismo resplandor ambiental que el hero de la home: mantiene el
              404 dentro del mismo lenguaje visual, no una pantalla aparte.
              Anclado al centro del bloque (no a los bordes de la sección)
              para que siempre coincida con el contenido, sea cual sea su
              alto real. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-acento/20 blur-[150px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[520px] translate-x-1/4 translate-y-1/4 rounded-full bg-acento/10 blur-[130px]"
          />
          <ConstellationField className="pointer-events-none absolute inset-0 h-full w-full text-noche-texto/[0.14]" />

          <div className="relative mx-auto flex max-w-3xl flex-col items-center px-5 text-center sm:px-8">
            <ConstellationMark
              animate
              className="mb-10 h-24 w-24 text-noche-texto drop-shadow-[0_0_28px_var(--color-acento)] sm:h-28 sm:w-28"
            />

            <span className="inline-flex items-center gap-1.5 rounded-full border border-acento/30 bg-acento/[0.07] px-3 py-1.5 text-[0.75rem] font-medium tracking-tight text-noche-texto/80">
              <Sparkle size={13} weight="fill" className="text-acento-claro" />
              Error 404
            </span>

            <h1 className="mt-6 max-w-[20ch] text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.03em] text-noche-texto uppercase sm:text-[2.75rem]">
              Esta página se perdió{" "}
              <span className="text-acento-claro">entre las estrellas</span>
            </h1>

            <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-relaxed text-noche-texto/60">
              El enlace que seguiste no existe o se movió. Volvamos a un
              punto conocido del mapa.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href="/" variant="inverse" size="lg">
                Volver al inicio
              </Button>
              <Button href="/que-automatizamos" variant="secondaryDark" size="lg">
                Ver qué automatizamos
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
