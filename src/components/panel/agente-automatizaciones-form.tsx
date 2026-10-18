"use client";

/* ==========================================================================
   "Mensajes automáticos": lo que el agente manda solo, sin que nadie le
   escriba primero (2026-10-17):
   - Seguimiento a quien no agendó (gratis: va dentro de las 24 h).
   - Reseña en Google al día siguiente de la cita.
   - Reactivar pacientes cuando ya les toca volver (por servicio).

   Mismo patrón que `agente-config-form.tsx`: se ve como dato y se edita en
   el lugar. Va a `asignaciones.config` vía `guardarAutomatizacionesAgente`,
   que además crea las plantillas de Meta cuando hacen falta.
   ========================================================================== */
import { useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { BarraGuardar, Campo, InterruptorCasilla, MensajeEstado } from "@/components/panel/configuracion/controles";
import { BTN_PRIMARIO, BTN_SECUNDARIO, BTN_SUAVE, CAMPO } from "@/components/panel/configuracion/estilos";
import { IconoLapiz, Spinner } from "@/components/panel/configuracion/iconos-extra";
import { FilaDato, Filas, Seccion } from "@/components/panel/configuracion/seccion";
import { useAccionPanel, useAvisoTemporal } from "@/components/panel/configuracion/usar-accion";
import { cn } from "@/lib/utils";

export type ConfigAutomatizaciones = {
  seguimiento: boolean;
  resenas: { activo: boolean; url: string };
  reactivar: { activo: boolean; tope: number; servicios: { clave: string; meses: number | null }[] };
  /** Estado de las plantillas en Meta la última vez que se guardó. */
  plantillasPendientes: boolean;
};

export function SeccionAutomatizaciones({ config }: { config: ConfigAutomatizaciones }) {
  const [editando, setEditando] = useState(false);
  const [resenas, setResenas] = useState(config.resenas.activo);
  const [reactivar, setReactivar] = useState(config.reactivar.activo);
  const [estado, guardar, guardando, limpiar] = useAccionPanel("guardarAutomatizacionesAgente", (r) => {
    if (r.ok) setEditando(false);
  });
  const aviso = useAvisoTemporal(estado, 8000);

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    guardar(new FormData(e.currentTarget));
  }

  function abrir() {
    limpiar();
    setResenas(config.resenas.activo);
    setReactivar(config.reactivar.activo);
    setEditando(true);
  }

  const conMeses = config.reactivar.servicios.filter((s) => s.meses);

  return (
    <form onSubmit={enviar} className="flex flex-col gap-[18px]">
      {editando ? <CampoToken /> : null}

      <Seccion
        id="automaticos"
        eyebrow="Ventas"
        titulo="Mensajes automáticos"
        descripcion="Lo que el agente hace solo para que no se te escape nadie ni se te olvide nadie."
        accion={
          editando ? null : (
            <button type="button" onClick={abrir} className={BTN_SUAVE}>
              <IconoLapiz className="h-4 w-4" />
              Editar
            </button>
          )
        }
      >
        {editando ? (
          <fieldset disabled={guardando} className="flex min-w-0 flex-col gap-4">
            <InterruptorCasilla
              nombre="seguimiento"
              activo={config.seguimiento}
              titulo="Seguimiento a quien no agendó"
              ayuda="Si alguien preguntó y no agendó, el agente le escribe una sola vez antes de que pasen 24 horas, retomando lo que hablaron. Gratis en WhatsApp."
            />

            <div className="flex flex-col gap-3">
              <InterruptorCasilla
                nombre="resenas"
                activo={resenas}
                alCambiar={setResenas}
                titulo="Pedir reseña en Google"
                ayuda="Al día siguiente de cada cita, entre 9 a. m. y 6 p. m. A la misma persona no se le vuelve a pedir en 3 meses."
              />
              {resenas ? (
                <Campo
                  etiqueta="Enlace para dejar reseña"
                  ayuda="En Google Business: Inicio → Pedir reseñas → copiar enlace. Empieza con https://"
                >
                  <input
                    name="resenas_url"
                    type="url"
                    inputMode="url"
                    required
                    defaultValue={config.resenas.url}
                    placeholder="https://g.page/r/…/review"
                    autoComplete="off"
                    className={CAMPO}
                  />
                </Campo>
              ) : (
                <input type="hidden" name="resenas_url" value={config.resenas.url} />
              )}
            </div>

            <div className="flex flex-col gap-3">
              <InterruptorCasilla
                nombre="reactivar"
                activo={reactivar}
                alCambiar={setReactivar}
                titulo="Reactivar pacientes"
                ayuda="Cuando a alguien ya le toca volver y no tiene cita, el agente le escribe una vez. Puede responder NO y no recibe más."
              />
              {reactivar ? (
                config.reactivar.servicios.length ? (
                  <div className="flex flex-col gap-3 rounded-xl border border-line p-3.5">
                    <p className="text-[12.5px] leading-snug text-ink-mute">
                      ¿Cada cuántos meses vuelve la gente a cada servicio? Dejalo vacío si ese servicio no se repite.
                    </p>
                    {config.reactivar.servicios.map((s) => (
                      <label key={s.clave} className="flex min-h-11 items-center justify-between gap-3">
                        <span className="min-w-0 text-[13px] text-ink-soft">{s.clave}</span>
                        <span className="flex flex-none items-center gap-2">
                          <input
                            name={`meses::${s.clave}`}
                            type="number"
                            min={1}
                            max={36}
                            inputMode="numeric"
                            defaultValue={s.meses ?? ""}
                            aria-label={`Meses para volver: ${s.clave}`}
                            className={cn(CAMPO, "w-20 text-center")}
                          />
                          <span className="text-[12.5px] text-ink-mute">meses</span>
                        </span>
                      </label>
                    ))}
                    <label className="flex min-h-11 items-center justify-between gap-3 border-t border-line pt-3">
                      <span className="text-[13px] text-ink-soft">Máximo de mensajes por día</span>
                      <input
                        name="tope_dia"
                        type="number"
                        min={1}
                        max={50}
                        inputMode="numeric"
                        defaultValue={config.reactivar.tope}
                        className={cn(CAMPO, "w-20 text-center")}
                      />
                    </label>
                  </div>
                ) : (
                  <p className="rounded-xl bg-warn/10 px-3.5 py-2.5 text-[12.5px] leading-snug text-warn">
                    Primero cargá tus servicios en Conocimiento.
                  </p>
                )
              ) : null}
            </div>

            <p className="text-[12px] leading-snug text-ink-mute">
              Reseñas y reactivación usan mensajes que Meta cobra aparte (centavos de dólar por mensaje) cuando la persona no te
              escribió en las últimas 24 horas. Se crean solos y Meta los revisa en horas o 1–2 días.
            </p>
          </fieldset>
        ) : (
          <Filas>
            <FilaDato k="Seguimiento a quien no agendó">{config.seguimiento ? "Encendido · gratis" : "Apagado"}</FilaDato>
            <FilaDato k="Reseña en Google">{config.resenas.activo ? "Al día siguiente de la cita" : "Apagado"}</FilaDato>
            <FilaDato k="Reactivar pacientes">
              {config.reactivar.activo
                ? conMeses.map((s) => `${s.clave}: cada ${s.meses} meses`).join(" · ") || "Encendido"
                : "Apagado"}
            </FilaDato>
            {config.plantillasPendientes && (config.resenas.activo || config.reactivar.activo) ? (
              <FilaDato k="Mensajes de Meta">En revisión</FilaDato>
            ) : null}
          </Filas>
        )}
      </Seccion>

      {!editando && aviso ? (
        <BarraGuardar>
          <MensajeEstado ok>{aviso}</MensajeEstado>
        </BarraGuardar>
      ) : null}

      {editando ? (
        <BarraGuardar>
          {estado && !estado.ok ? (
            <MensajeEstado ok={false} className="sm:mr-auto sm:flex-1">
              {estado.error}
            </MensajeEstado>
          ) : null}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => {
                limpiar();
                setEditando(false);
              }}
              disabled={guardando}
              className={cn(BTN_SECUNDARIO, "max-sm:flex-1")}
            >
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
