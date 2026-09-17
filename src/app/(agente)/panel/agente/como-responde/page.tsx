import { Cabecera, Cuerpo, Bloque, Fila } from "@/components/panel/agente-ui";
import { Icono } from "@/components/panel/iconos";
import { FormaConfigAgente } from "@/components/panel/agente-config-form";
import { FormaAgenda } from "@/components/panel/agente-agenda-form";
import { getAsignacion } from "@/lib/panel/datos";
import { getHorarioNegocio } from "@/lib/panel/agente";
import {
  leerConfigAgente,
  leerConfigAgenda,
  TEXTO_EMOJIS,
  TEXTO_LARGO,
  DIAS_HORARIO,
  textoBloquesHorario,
} from "@/lib/panel/agente-config";

export default async function ComoRespondePage() {
  const [asignacion, horario] = await Promise.all([
    getAsignacion("agente-whatsapp"),
    getHorarioNegocio(),
  ]);
  const cfg = leerConfigAgente(asignacion?.config);
  const agenda = leerConfigAgenda(asignacion?.config);

  return (
    <>
      <Cabecera
        eyebrow="El agente"
        titulo="Cómo responde"
        descripcion="Acá se define la personalidad y los límites. Lo que cambiés se aplica en la siguiente conversación, sin tener que avisarnos."
      />

      <Cuerpo className="flex flex-col gap-4">
        <Bloque titulo="Tono" sub="Cómo le habla a la gente">
          <Fila k="Trato" v={cfg.trato === "usted" ? "De usted" : "De vos"} />
          <Fila k="Estilo" v={cfg.estilo} />
          <Fila k="Emojis" v={TEXTO_EMOJIS[cfg.emojis]} />
          <Fila k="Largo de respuesta" v={TEXTO_LARGO[cfg.largo]} />
        </Bloque>

        {/* Estas 3 filas son fijas a propósito (no leen `cfg`): esperaSegundos,
            transcribirAudios y fueraDeHorario se sacaron del formulario de
            abajo porque el bot nunca las respetaba — mostrar acá lo que
            guardó el cliente en vez de lo que el bot REALMENTE hace sería
            la misma mentira con otra cara. Esto es lo que pasa de verdad,
            siempre, hasta que se conecten de verdad (ver memoria del
            proyecto). */}
        <Bloque titulo="Antes de contestar" sub="El agente espera a que la persona termine de escribir">
          <Fila k="Espera después del último mensaje" v="12 segundos" />
          <Fila k="Notas de voz" v="Las escucha y transcribe siempre" />
          <Fila k="Fuera de horario" v="Responde igual y agenda" />
        </Bloque>

        <Bloque titulo="Cuándo llamarte a vos" sub="Si pasa esto, el agente se frena y te avisa">
          <ul className="py-1.5">
            {cfg.escalar.map((r) => (
              <li
                key={r}
                className="flex items-start gap-2.5 border-line px-4 py-2.5 text-[13px] text-ink-soft [&+li]:border-t"
              >
                <Icono nombre="pendientes" className="mt-0.5 h-3.5 w-3.5 flex-none text-warn" />
                {r}
              </li>
            ))}
          </ul>
        </Bloque>

        <FormaConfigAgente config={cfg} />

        <Bloque
          titulo="Cómo agenda"
          sub={agenda.activa ? "Reserva sola, en el momento" : "Apagado: solo toma el dato y avisa"}
        >
          <Fila k="Capacidad" v={`${agenda.capacidad} ${agenda.capacidad === 1 ? "cita" : "citas"} a la misma hora`} />
          <Fila
            k="Colchón entre citas"
            v={agenda.colchonMin === 0 ? "Ninguno, van pegadas" : `${agenda.colchonMin} minutos`}
          />
          <Fila k="Anticipación mínima" v={`${agenda.anticipacionMin} minutos`} />
          <Fila k="Busca campo hasta" v={`${agenda.maximoDiasAdelante} días adelante`} />
        </Bloque>

        <Bloque titulo="Horario de atención" sub="De acá sale la disponibilidad real que ofrece el agente">
          {DIAS_HORARIO.map(({ clave, texto }) => (
            <Fila key={clave} k={texto} v={textoBloquesHorario(horario[clave])} />
          ))}
        </Bloque>

        <FormaAgenda agenda={agenda} horario={horario} />
      </Cuerpo>
    </>
  );
}
