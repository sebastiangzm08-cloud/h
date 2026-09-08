import { Button } from "@/components/ui/button";
import { AnalyzerLive } from "@/components/home/analyzer-live";
import { ArrowUpRight, Sparkle } from "@phosphor-icons/react/dist/ssr";

export function Hero() {
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
          {/* La insignia dice algo comprobable, no "IA de nueva generación":
              es la promesa que de verdad diferencia y que además es cierta
              para cualquier cliente, tenga sistemas o no. */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-acento/30 bg-acento/[0.07] px-3 py-1.5 text-[0.75rem] font-medium tracking-tight text-noche-texto/80">
            <Sparkle size={13} weight="fill" className="text-acento-claro" />
            No te pedimos que cambies de sistema
          </span>

          {/* Titular tipo manifiesto: la segunda frase va en color de acento
              para que el contraste "más vs. mejor" pegue de un vistazo. La
              bajada nombra el problema real (el negocio se detiene cuando el
              dueño se detiene) antes de prometer nada. */}
          <h1 className="mt-6 text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.03em] text-noche-texto uppercase sm:text-[3.25rem] lg:text-[3.75rem]">
            El futuro no pertenece a quien trabaja más.{" "}
            <span className="text-acento-claro">
              Pertenece a quien sabe trabajar mejor.
            </span>
          </h1>

          <p className="mt-7 max-w-[48ch] text-[1.0625rem] leading-relaxed text-noche-texto/60">
            Si el negocio se para cuando vos parás, ese es el problema.
            Automatizamos prospección, redes y trabajo repetitivo para que
            siga vendiendo sin depender de vos.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button
              href="/mis-herramientas#analizador"
              variant="inverse"
              size="lg"
            >
              <Sparkle size={16} weight="fill" />
              Analizar mi negocio
            </Button>
            <Button href="/planes" variant="secondaryDark" size="lg">
              Ver catálogo de soluciones
              <ArrowUpRight size={16} weight="bold" />
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-[0.8125rem] text-noche-texto/55">
            {/* Los tres tienen que ser verificables y coincidir con la tabla
                de niveles de content.ts. "2 a 5 días" no correspondía a
                ningún nivel real; N1 son 2 a 4 días. */}
            <span>Diagnóstico sin costo</span>
            <span className="h-1 w-1 rounded-full bg-noche-texto/25" />
            <span>Presupuesto fijo en 48 horas</span>
            <span className="hidden h-1 w-1 rounded-full bg-noche-texto/25 sm:block" />
            <span className="hidden sm:block">Lo más simple, andando en 2 a 4 días</span>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <AnalyzerLive />
        </div>
      </div>
    </section>
  );
}
