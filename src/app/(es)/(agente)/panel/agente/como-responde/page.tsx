import Link from "next/link";
import { Cabecera, Cuerpo } from "@/components/panel/agente-ui";
import { SeccionesComportamiento } from "@/components/panel/agente-config-form";
import { SeccionesAgenda } from "@/components/panel/agente-agenda-form";
import { SeccionAutomatizaciones, type ConfigAutomatizaciones } from "@/components/panel/agente-automatizaciones-form";
import { FilaDato, Filas, Seccion } from "@/components/panel/configuracion/seccion";
import { Chip } from "@/components/panel/ui";
import { getAsignacion } from "@/lib/panel/datos";
import { getConocimiento, getHorarioNegocio } from "@/lib/panel/agente";
import { leerConfigAgente, leerConfigAgenda } from "@/lib/panel/agente-config";

/* ==========================================================================
   Configuración del agente (en la barra: "Configuración").

   Cinco cajas, de lo que dice a lo que hace: cómo habla, cuándo te llama,
   lo que hace antes de contestar (fijo), cómo agenda y el horario. Las cuatro
   editables se cambian en el lugar; lo que se guarda se aplica en la
   siguiente conversación.
   ========================================================================== */
export default async function ConfiguracionAgentePage() {
  const [asignacion, horario, conocimiento] = await Promise.all([
    getAsignacion("agente-whatsapp"),
    getHorarioNegocio(),
    getConocimiento(),
  ]);
  const cfg = leerConfigAgente(asignacion?.config);
  const agenda = leerConfigAgenda(asignacion?.config);

  /* "Mensajes automáticos": lo guardado + los servicios activos de Conocimiento. */
  const raw = (asignacion?.config ?? {}) as Record<string, unknown>;
  const leer = (k: string) => (raw[k] as Record<string, unknown> | undefined) ?? {};
  const mesesGuardados = (leer("reactivar").servicios as Record<string, number> | undefined) ?? {};
  const plantillas = leer("plantillas");
  const automaticos: ConfigAutomatizaciones = {
    seguimiento: leer("seguimiento").activo === true,
    resenas: { activo: leer("resenas").activo === true, url: String(leer("resenas").url ?? "") },
    reactivar: {
      activo: leer("reactivar").activo === true,
      tope: Number(leer("reactivar").tope_dia) || 10,
      servicios: conocimiento
        .filter((c) => c.tipo === "servicio" && c.activo)
        .map((c) => ({ clave: c.clave, meses: mesesGuardados[c.clave] ?? null })),
    },
    plantillasPendientes: Object.entries(plantillas).some(([k, v]) => k.startsWith("hz_") && v !== "APPROVED"),
  };

  return (
    <>
      <Cabecera
        eyebrow="El agente"
        titulo="Configuración"
        descripcion="Cómo habla, cuándo te llama y cómo agenda. Lo que cambiés se aplica en la siguiente conversación, sin tener que avisarnos."
      />

      <Cuerpo className="flex flex-col gap-[18px]">
        <SeccionesComportamiento config={cfg} />

        {/* Estas 3 filas son fijas a propósito (no leen `cfg`): esperaSegundos,
            transcribirAudios y fueraDeHorario se sacaron del formulario porque
            el bot nunca las respetaba. Mostrar acá lo que guardó el cliente en
            vez de lo que el bot REALMENTE hace sería la misma mentira con otra
            cara. Esto es lo que pasa de verdad, siempre, hasta que se conecten
            (ver la memoria del proyecto: project_agente_whatsapp). */}
        <Seccion
          id="antes"
          eyebrow="Automático"
          titulo="Antes de contestar"
          descripcion="El agente espera a que la persona termine de escribir. Esto funciona siempre así y por ahora no se cambia."
          accion={<Chip>Fijo</Chip>}
        >
          <Filas>
            <FilaDato k="Espera después del último mensaje" mono>
              12 segundos
            </FilaDato>
            <FilaDato k="Notas de voz">Las escucha y transcribe siempre</FilaDato>
            <FilaDato k="Fuera de horario">Responde igual y agenda</FilaDato>
          </Filas>
        </Seccion>

        <SeccionesAgenda agenda={agenda} horario={horario} />

        <SeccionAutomatizaciones config={automaticos} />

        <p className="text-[12.5px] leading-snug text-ink-mute">
          Los servicios, precios y reglas de lo que nunca decir se editan en{" "}
          <Link
            href="/panel/agente/que-sabe"
            className="text-ink-mute underline underline-offset-2 hover:text-ink"
          >
            Conocimiento
          </Link>
          .
        </p>
      </Cuerpo>
    </>
  );
}
