"use client";

/* ==========================================================================
   "Cómo agenda" y "Horario de atención". Dos tablas distintas
   (`asignaciones.config.agenda` y `clientes.horario`) pero un solo
   formulario: el dueño las ve y las cambia juntas, con un solo guardado.

   En celular cada día del horario es una tarjeta (día arriba, horas debajo):
   la fila de una sola línea con dos selectores de hora no cabía en 360 px.
   ========================================================================== */
import { useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import {
  BarraGuardar,
  Campo,
  InterruptorCasilla,
  MensajeEstado,
} from "@/components/panel/configuracion/controles";
import { BTN_PRIMARIO, BTN_SECUNDARIO, BTN_SUAVE, CAMPO } from "@/components/panel/configuracion/estilos";
import { IconoLapiz, Spinner } from "@/components/panel/configuracion/iconos-extra";
import { EditorHorario } from "@/components/panel/configuracion/editor-horario";
import { FilaDato, Filas, Seccion } from "@/components/panel/configuracion/seccion";
import { useAccionPanel, useAvisoTemporal } from "@/components/panel/configuracion/usar-accion";
import { Pill } from "@/components/panel/ui";
import { DIAS_HORARIO, textoBloquesHorario, type ConfigAgenda } from "@/lib/panel/agente-config";
import { cn } from "@/lib/utils";

type Horario = Record<string, [string, string][]>;

export function SeccionesAgenda({ agenda, horario }: { agenda: ConfigAgenda; horario: Horario }) {
  const [editando, setEditando] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [estado, guardar, guardando, limpiar] = useAccionPanel("guardarAgenda", (r) => {
    if (r.ok) setEditando(false);
  });
  const aviso = useAvisoTemporal(estado);

  function abrir() {
    limpiar();
    setErrorLocal(null);
    setEditando(true);
  }
  function cerrar() {
    limpiar();
    setErrorLocal(null);
    setEditando(false);
  }

  /* Un día que abre a las 5 y cierra a las 8 de la mañana dejaría la agenda
     sin horarios: mejor frenarlo acá, con nombre y apellido, que guardarlo. */
  function enviar(e: React.FormEvent<HTMLFormElement>) {
    /* `onSubmit` y no `action`: con `action`, React 19 vacía el formulario en
       cuanto se envía, y si el guardado fallaba se perdía lo escrito. */
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    for (const { clave, texto } of DIAS_HORARIO) {
      if (datos.get(`cerrado_${clave}`) === "on") continue;
      const ini = String(datos.get(`ini_${clave}`) ?? "");
      const fin = String(datos.get(`fin_${clave}`) ?? "");
      if (ini && fin && fin <= ini) {
        setErrorLocal(`El ${texto.toLowerCase()} cierra antes de abrir. Revisá las horas.`);
        return;
      }
    }
    setErrorLocal(null);
    guardar(datos);
  }

  const error = errorLocal ?? (estado && !estado.ok ? estado.error : null);

  return (
    <form onSubmit={enviar} className="flex flex-col gap-[18px]">
      {editando ? <CampoToken /> : null}

      <Seccion
        id="agenda"
        eyebrow="Agenda"
        titulo="Cómo agenda"
        descripcion={agenda.activa ? "Reserva sola, en el momento." : "Apagado: solo toma el dato y avisa."}
        accion={
          editando ? null : (
            <>
              <Pill tono={agenda.activa ? "ok" : "idle"}>{agenda.activa ? "Activa" : "Apagada"}</Pill>
              <button type="button" onClick={abrir} className={BTN_SUAVE}>
                <IconoLapiz className="h-4 w-4" />
                Editar agenda y horario
              </button>
            </>
          )
        }
      >
        {editando ? (
          <fieldset disabled={guardando} className="flex min-w-0 flex-col gap-4">
            <InterruptorCasilla
              nombre="activa"
              activo={agenda.activa}
              titulo="Agendar solo"
              ayuda="Si lo apagás, el agente toma el dato y avisa que alguien lo confirma."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Capacidad simultánea" ayuda="Cuántas citas caben a la misma hora.">
                <input
                  type="number"
                  name="capacidad"
                  min={1}
                  max={20}
                  inputMode="numeric"
                  autoComplete="off"
                  defaultValue={agenda.capacidad}
                  className={CAMPO}
                />
              </Campo>
              <Campo etiqueta="Colchón entre citas (min)" ayuda="Minutos de respiro entre una cita y la siguiente.">
                <input
                  type="number"
                  name="colchonMin"
                  min={0}
                  max={120}
                  inputMode="numeric"
                  autoComplete="off"
                  defaultValue={agenda.colchonMin}
                  className={CAMPO}
                />
              </Campo>
              <Campo
                etiqueta="Anticipación mínima (min)"
                ayuda="No ofrece horarios que empiecen antes de este tiempo desde ahora."
              >
                <input
                  type="number"
                  name="anticipacionMin"
                  min={0}
                  max={1440}
                  inputMode="numeric"
                  autoComplete="off"
                  defaultValue={agenda.anticipacionMin}
                  className={CAMPO}
                />
              </Campo>
              <Campo etiqueta="Busca campo hasta (días)" ayuda="Cuántos días adelante ofrece horarios.">
                <input
                  type="number"
                  name="maximoDiasAdelante"
                  min={1}
                  max={90}
                  inputMode="numeric"
                  autoComplete="off"
                  defaultValue={agenda.maximoDiasAdelante}
                  className={CAMPO}
                />
              </Campo>
            </div>
          </fieldset>
        ) : (
          <Filas>
            <FilaDato k="Capacidad" mono>
              {agenda.capacidad} {agenda.capacidad === 1 ? "cita" : "citas"} a la misma hora
            </FilaDato>
            <FilaDato k="Colchón entre citas" mono>
              {agenda.colchonMin === 0 ? "Ninguno, van pegadas" : `${agenda.colchonMin} minutos`}
            </FilaDato>
            <FilaDato k="Anticipación mínima" mono>
              {agenda.anticipacionMin} minutos
            </FilaDato>
            <FilaDato k="Busca campo hasta" mono>
              {agenda.maximoDiasAdelante} días adelante
            </FilaDato>
          </Filas>
        )}
      </Seccion>

      <Seccion
        id="horario"
        eyebrow="Horario"
        titulo="Horario de atención"
        descripcion="De acá sale la disponibilidad real que ofrece el agente."
      >
        {editando ? (
          <fieldset disabled={guardando} className="min-w-0">
            {/* Se monta de nuevo cada vez que se abre, así arranca con lo que
                hay guardado ahora y no con lo que se tocó antes. */}
            <EditorHorario horario={horario} />
          </fieldset>
        ) : (
          <Filas>
            {DIAS_HORARIO.map(({ clave, texto }) => {
              const texto12 = textoBloquesHorario(horario[clave]);
              return (
                <FilaDato key={clave} k={texto} mono={texto12 !== "Cerrado"}>
                  {texto12 === "Cerrado" ? <span className="text-ink-mute">Cerrado</span> : texto12}
                </FilaDato>
              );
            })}
          </Filas>
        )}
      </Seccion>

      {/* La confirmación va en la misma barra pegada abajo donde estaba el botón:
          arriba, en celular, quedaba fuera de vista. */}
      {!editando && aviso ? (
        <BarraGuardar>
          <MensajeEstado ok>{aviso}</MensajeEstado>
        </BarraGuardar>
      ) : null}

      {editando ? (
        <BarraGuardar>
          {error ? <MensajeEstado ok={false} className="sm:mr-auto sm:flex-1">{error}</MensajeEstado> : null}
          <div className="flex gap-2.5">
            <button type="button" onClick={cerrar} disabled={guardando} className={cn(BTN_SECUNDARIO, "max-sm:flex-1")}>
              Cancelar
            </button>
            <button type="submit" disabled={guardando} className={cn(BTN_PRIMARIO, "max-sm:flex-1")}>
              {guardando ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Guardando…
                </>
              ) : (
                "Guardar cambios"
              )}
            </button>
          </div>
        </BarraGuardar>
      ) : null}
    </form>
  );
}
