"use client";

/* ==========================================================================
   "Cómo habla" y "Cuándo te llama": tono, estilo, emojis, largo y las
   situaciones en las que el agente se frena. Se ven como datos y se editan en
   el mismo lugar (botón Editar), con un solo guardado.

   Va a `asignaciones.config`, el mismo jsonb que lee el workflow, a través de
   la acción `guardarConfigAgente`: mismos campos y mismos nombres que antes.
   ========================================================================== */
import { useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { BarraGuardar, Campo, MensajeEstado, Segmentado } from "@/components/panel/configuracion/controles";
import { BTN_PRIMARIO, BTN_SECUNDARIO, BTN_SUAVE, CAMPO } from "@/components/panel/configuracion/estilos";
import { IconoAlerta, IconoLapiz, Spinner } from "@/components/panel/configuracion/iconos-extra";
import { FilaDato, Filas, Seccion } from "@/components/panel/configuracion/seccion";
import { useAccionPanel, useAvisoTemporal } from "@/components/panel/configuracion/usar-accion";
import {
  TEXTO_EMOJIS,
  TEXTO_LARGO,
  type ConfigAgente,
} from "@/lib/panel/agente-config";
import { cn } from "@/lib/utils";

export function SeccionesComportamiento({ config }: { config: ConfigAgente }) {
  const [editando, setEditando] = useState(false);
  const [estado, guardar, guardando, limpiar] = useAccionPanel("guardarConfigAgente", (r) => {
    if (r.ok) setEditando(false);
  });
  const aviso = useAvisoTemporal(estado);

  /* `onSubmit` y no `action`: con `action`, React 19 vacía el formulario en
     cuanto se envía, y si el guardado fallaba se perdía lo escrito. */
  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    guardar(new FormData(e.currentTarget));
  }

  function abrir() {
    limpiar();
    setEditando(true);
  }
  function cerrar() {
    limpiar();
    setEditando(false);
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-[18px]">
      {editando ? <CampoToken /> : null}

      <Seccion
        id="habla"
        eyebrow="Personalidad"
        titulo="Cómo habla"
        descripcion="Cómo le habla a la gente."
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
            <div className="grid gap-4 md:grid-cols-3">
              <Segmentado
                nombre="trato"
                etiqueta="Trato"
                valor={config.trato}
                opciones={[
                  { valor: "usted", texto: "De usted" },
                  { valor: "vos", texto: "De vos" },
                ]}
              />
              <Segmentado
                nombre="emojis"
                etiqueta="Emojis"
                valor={config.emojis}
                opciones={[
                  { valor: "ninguno", texto: "Ninguno" },
                  { valor: "pocos", texto: "Pocos" },
                  { valor: "varios", texto: "Varios" },
                ]}
              />
              <Segmentado
                nombre="largo"
                etiqueta="Largo de respuesta"
                valor={config.largo}
                opciones={[
                  { valor: "corto", texto: "Corto" },
                  { valor: "medio", texto: "Medio" },
                  { valor: "largo", texto: "Largo" },
                ]}
              />
            </div>

            <Campo etiqueta="Estilo" ayuda="Cómo querés que suene: una o dos frases alcanzan.">
              <textarea
                name="estilo"
                rows={2}
                defaultValue={config.estilo}
                autoComplete="off"
                placeholder="Ej.: Cálido y cercano, como quien atiende bien en recepción."
                className={cn(CAMPO, "resize-none")}
              />
            </Campo>
          </fieldset>
        ) : (
          <Filas>
            <FilaDato k="Trato">{config.trato === "usted" ? "De usted" : "De vos"}</FilaDato>
            <FilaDato k="Emojis">{TEXTO_EMOJIS[config.emojis]}</FilaDato>
            <FilaDato k="Largo de respuesta">{TEXTO_LARGO[config.largo]}</FilaDato>
            <div className="py-3 last:pb-0">
              <dt className="text-[13px] text-ink-mute">Estilo</dt>
              <dd className="mt-1 text-[13px] leading-relaxed text-ink">{config.estilo}</dd>
            </div>
          </Filas>
        )}
      </Seccion>

      <Seccion
        id="escalar"
        eyebrow="Límites"
        titulo="Cuándo te llama"
        descripcion="Si pasa alguna de estas cosas, el agente se frena y te avisa."
      >
        {editando ? (
          <fieldset disabled={guardando} className="min-w-0">
            <Campo
              etiqueta="Una situación por línea"
              ayuda="Si lo dejás vacío se mantienen las de ahora."
            >
              <textarea
                name="escalar"
                rows={5}
                defaultValue={config.escalar.join("\n")}
                autoComplete="off"
                className={cn(CAMPO, "resize-y leading-relaxed")}
              />
            </Campo>
          </fieldset>
        ) : (
          <ul className="divide-y divide-line">
            {config.escalar.map((situacion, i) => (
              <li key={`${i}-${situacion}`} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="mt-px grid h-6 w-6 flex-none place-items-center rounded-lg bg-warn/15 text-warn">
                  <IconoAlerta className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 text-[13px] leading-snug break-words text-ink-soft">{situacion}</span>
              </li>
            ))}
          </ul>
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
          {estado && !estado.ok ? <MensajeEstado ok={false} className="sm:mr-auto sm:flex-1">{estado.error}</MensajeEstado> : null}
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
