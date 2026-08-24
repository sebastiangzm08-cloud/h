import { ShieldCheck, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";

export function Trust() {
  return (
    <section className="border-b border-line bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow mb-5 text-paper/50">Por qué confiar</p>
              <h2 className="max-w-[20ch] text-[2rem] leading-[1.05] font-semibold tracking-tight sm:text-[2.5rem]">
                Estudio nuevo. Método probado, riesgo acotado.
              </h2>
              <p className="mt-5 max-w-[42ch] text-[0.9375rem] leading-relaxed text-paper/60">
                No tenemos veinte años de casos para mostrar. Tenemos un
                método claro y condiciones pensadas para que el riesgo sea
                nuestro, no tuyo.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Reveal>
                <div className="rounded-2xl border border-paper/15 p-7">
                  <ShieldCheck size={22} className="text-paper/70" />
                  <h3 className="mt-5 text-[1.0625rem] font-medium tracking-tight">
                    Garantía de las primeras horas
                  </h3>
                  <p className="mt-2.5 text-[0.875rem] leading-relaxed text-paper/60">
                    Si en 30 días no llegás a las horas ahorradas que
                    acordamos en el diagnóstico, te devolvemos la puesta en
                    marcha.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={90}>
                <div className="rounded-2xl border border-paper/15 p-7">
                  <Sparkle size={22} className="text-paper/70" />
                  <h3 className="mt-5 text-[1.0625rem] font-medium tracking-tight">
                    Condición de fundación
                  </h3>
                  <p className="mt-2.5 text-[0.875rem] leading-relaxed text-paper/60">
                    Los primeros clientes del estudio acceden a una
                    condición preferente a cambio de servir como caso de
                    referencia documentado.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0}>
                <div className="rounded-2xl border border-paper/15 p-7">
                  <h3 className="text-[1.0625rem] font-medium tracking-tight">
                    Los flujos son tuyos
                  </h3>
                  <p className="mt-2.5 text-[0.875rem] leading-relaxed text-paper/60">
                    Si en algún momento dejás de trabajar con nosotros, te
                    entregamos cada automatización exportada y documentada.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={90}>
                <div className="rounded-2xl border border-paper/15 p-7">
                  <h3 className="text-[1.0625rem] font-medium tracking-tight">
                    Credenciales, nunca por chat
                  </h3>
                  <p className="mt-2.5 text-[0.875rem] leading-relaxed text-paper/60">
                    Los accesos se manejan en un gestor de contraseñas
                    compartido. Nunca quedan guardados en nuestra base de
                    datos ni en WhatsApp.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
