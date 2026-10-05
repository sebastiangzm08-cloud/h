import { Cabecera, Cuerpo } from "@/components/panel/agente-ui";
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

      <Cuerpo>
        {/* El wizard se queda montado aunque la página refresque al guardar:
            así puede mostrar su pantalla de "Listo". Si ya estaba completo
            al entrar, él mismo muestra los enlaces a dónde editar. */}
        <div className="mx-auto w-full max-w-[640px] rounded-2xl border border-line bg-surface-2 p-4 sm:p-6">
          <AgenteOnboardingWizard horarioActual={horario} completo={cfg.onboardingCompleto} />
        </div>
      </Cuerpo>
    </>
  );
}
