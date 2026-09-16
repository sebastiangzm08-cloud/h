import Link from "next/link";
import { Cabecera, Cuerpo, Bloque } from "@/components/panel/agente-ui";
import { AgenteOnboardingWizard } from "@/components/panel/agente-onboarding-wizard";
import { getAsignacion } from "@/lib/panel/datos";
import { getHorarioNegocio } from "@/lib/panel/agente";
import { leerConfigAgente } from "@/lib/panel/agente-config";

export default async function OnboardingAgentePage() {
  const [asignacion, horario] = await Promise.all([
    getAsignacion("agente-whatsapp"),
    getHorarioNegocio(),
  ]);
  const cfg = leerConfigAgente(asignacion?.config);

  return (
    <>
      <Cabecera
        eyebrow="El agente"
        titulo="Contanos de tu negocio"
        descripcion="7 preguntas cortas, una sola vez. Con esto el agente ya contesta bien desde el primer mensaje real — lo podés seguir afinando después."
      />

      <Cuerpo className="flex flex-col gap-6">
        {cfg.onboardingCompleto ? (
          <Bloque titulo="Ya completaste esto" sub="Para cambiar algo, andá directo a la pantalla que lo edita">
            <div className="flex flex-col gap-3 px-4 py-4">
              <p className="text-[13px] text-ink-soft">
                Los servicios, el horario y el tono ya no se editan desde acá — este formulario es solo para la
                primera vez, así no se duplica nada.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <Link
                  href="/panel/agente/que-sabe"
                  className="rounded-full border border-line-strong px-4 py-2 text-[13px] text-ink-soft transition-colors hover:bg-surface-2"
                >
                  Editar servicios (Qué sabe)
                </Link>
                <Link
                  href="/panel/agente/como-responde"
                  className="rounded-full border border-line-strong px-4 py-2 text-[13px] text-ink-soft transition-colors hover:bg-surface-2"
                >
                  Editar tono y horario (Cómo responde)
                </Link>
              </div>
            </div>
          </Bloque>
        ) : (
          <div className="mx-auto w-full max-w-[620px] rounded-xl border border-line bg-surface p-5 md:p-6">
            <AgenteOnboardingWizard horarioActual={horario} />
          </div>
        )}
      </Cuerpo>
    </>
  );
}
