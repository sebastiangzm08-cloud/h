"use client";

/* ==========================================================================
   Conocimiento del agente, editable: agregar servicios/datos/reglas,
   apagarlos sin perderlos, o borrarlos. Todo pasa por `wa_conocimiento`, el
   mismo lugar de donde el workflow arma lo que el agente sabe, así que lo que
   se guarda acá lo usa desde la siguiente conversación.

   Estados de cada acción (Fase 4b):
   - guardando: el botón muestra la rueda y se bloquea, la fila se atenúa.
   - guardado: "Agregado." / "Desactivado." un momento, después se apaga.
   - error: queda a la vista junto al formulario o a la fila. El formulario de
     agregar ya NO se cierra antes de saber si salió bien.
   - borrar pide confirmación en la misma fila, sin el cuadro del navegador.
   ========================================================================== */
import { useState } from "react";
import { CampoMonto } from "@/components/panel/campo-monto";
import { CampoToken } from "@/components/panel/campo-token";
import {
  Campo,
  InterruptorEnvio,
  MensajeEstado,
} from "@/components/panel/configuracion/controles";
import { BTN_PELIGRO, BTN_PRIMARIO, BTN_SECUNDARIO, CAMPO } from "@/components/panel/configuracion/estilos";
import { IconoBasura, IconoProhibido, Spinner } from "@/components/panel/configuracion/iconos-extra";
import { useAccionPanel, useAvisoTemporal } from "@/components/panel/configuracion/usar-accion";
import { colones, Pill } from "@/components/panel/ui";
import type { ItemConocimiento } from "@/lib/panel/agente";
import { cn } from "@/lib/utils";

type Tipo = ItemConocimiento["tipo"];

/** Textos por tipo. Un solo lugar para que el formulario y la lista no se desfasen. */
export const TEXTOS_CONOCIMIENTO: Record<
  Tipo,
  { boton: string; enviar: string; singular: string; etiquetaClave: string; ayudaClave?: string }
> = {
  servicio: {
    boton: "Agregar servicio",
    enviar: "Agregar servicio",
    singular: "servicio",
    etiquetaClave: "Nombre del servicio",
  },
  dato: {
    boton: "Agregar dato",
    enviar: "Agregar dato",
    singular: "dato",
    etiquetaClave: "¿Qué dato es?",
  },
  regla: {
    boton: "Agregar regla",
    enviar: "Agregar regla",
    singular: "regla",
    etiquetaClave: "La regla, tal cual",
    ayudaClave: "Escribila como se la dirías a una persona nueva en el mostrador.",
  },
};

/* -------------------------------------------------------------------------
   Formulario para agregar
   ------------------------------------------------------------------------- */

export function FormaAgregarConocimiento({
  tipo,
  alCerrar,
  alAgregar,
}: {
  tipo: Tipo;
  alCerrar: () => void;
  /** Se llama solo cuando el servidor confirmó que quedó guardado. */
  alAgregar: (mensaje: string) => void;
}) {
  const [estado, agregar, agregando] = useAccionPanel("agregarConocimiento", (r) => {
    if (r.ok) alAgregar(r.mensaje);
  });
  const textos = TEXTOS_CONOCIMIENTO[tipo];

  /* `onSubmit` y no `action`: con `action`, React 19 vacía el formulario en
     cuanto se envía, y si el guardado fallaba la persona perdía lo que había
     escrito. Así, ante un error, todo queda como estaba. */
  function alEnviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    /* Un salto de línea dentro de una regla o un dato rompe cómo se lista
       lo que sabe el agente: se aplana a un espacio. */
    for (const campo of ["clave", "valor"]) {
      const v = datos.get(campo);
      if (typeof v === "string") datos.set(campo, v.replace(/\s*\n+\s*/g, " ").trim());
    }
    agregar(datos);
  }

  return (
    <form
      onSubmit={alEnviar}
      className="flex flex-col gap-3.5 border-t border-line bg-surface/50 px-4 py-4 sm:px-[18px]"
    >
      <input type="hidden" name="tipo" value={tipo} />
      <CampoToken />

      <Campo etiqueta={textos.etiquetaClave} ayuda={textos.ayudaClave}>
        {tipo === "regla" ? (
          <textarea
            name="clave"
            required
            autoFocus
            rows={2}
            maxLength={300}
            autoComplete="off"
            placeholder="Ej.: No dar diagnósticos ni recetar por chat."
            className={cn(CAMPO, "resize-none")}
          />
        ) : (
          <input
            type="text"
            name="clave"
            required
            autoFocus
            maxLength={120}
            autoComplete="off"
            placeholder={tipo === "servicio" ? "Ej.: Limpieza dental" : "Ej.: Dirección"}
            className={CAMPO}
          />
        )}
      </Campo>

      {tipo === "dato" ? (
        <Campo etiqueta="El dato en sí">
          <input
            type="text"
            name="valor"
            maxLength={300}
            autoComplete="off"
            placeholder="Ej.: 200 m sur del parque, San Rafael"
            className={CAMPO}
          />
        </Campo>
      ) : null}

      {tipo === "servicio" ? (
        <>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Campo etiqueta="Precio (₡)" ayuda="Vacío = «a consultar». Poné 0 si es gratis.">
              <CampoMonto name="monto" placeholder="Ej.: 25.000" className={CAMPO} />
            </Campo>
            <Campo etiqueta="Duración (minutos)" ayuda="Con esto calcula cuánto espacio ocupa en la agenda.">
              <input
                type="number"
                name="duracionMin"
                min={0}
                max={600}
                inputMode="numeric"
                autoComplete="off"
                placeholder="Ej.: 40"
                className={CAMPO}
              />
            </Campo>
          </div>
          <Campo etiqueta={<>Detalle <span className="text-ink-mute">(opcional)</span></>}>
            <input
              type="text"
              name="valor"
              maxLength={300}
              autoComplete="off"
              placeholder="Ej.: Incluye revisión y pulido"
              className={CAMPO}
            />
          </Campo>
        </>
      ) : null}

      {estado && !estado.ok ? <MensajeEstado ok={false}>{estado.error}</MensajeEstado> : null}

      <div className="flex flex-wrap gap-2.5">
        <button type="submit" disabled={agregando} className={cn(BTN_PRIMARIO, "max-sm:flex-1")}>
          {agregando ? (
            <>
              <Spinner className="h-4 w-4" />
              Guardando…
            </>
          ) : (
            textos.enviar
          )}
        </button>
        <button type="button" onClick={alCerrar} disabled={agregando} className={BTN_SECUNDARIO}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------
   Una fila de la lista
   ------------------------------------------------------------------------- */

function precioTexto(monto: number | null) {
  if (monto === 0) return "Gratis";
  if (monto != null) return colones(monto);
  return "A consultar";
}

function Contenido({ item }: { item: ItemConocimiento }) {
  if (item.tipo === "servicio") {
    return (
      <>
        <p className="text-[13.5px] leading-snug font-medium break-words text-ink">{item.clave}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12.5px] text-ink-mute">
          <span className="font-mono tabular-nums text-ink-soft">{precioTexto(item.monto)}</span>
          {item.duracionMin ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{item.duracionMin} min</span>
            </>
          ) : null}
          {item.valor ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="break-words">{item.valor}</span>
            </>
          ) : null}
        </p>
      </>
    );
  }

  if (item.tipo === "dato") {
    return (
      <>
        <p className="text-[12px] text-ink-mute">{item.clave}</p>
        <p className="mt-0.5 text-[13.5px] leading-snug break-words text-ink">{item.valor || "—"}</p>
      </>
    );
  }

  return (
    <p className="flex items-start gap-2.5 text-[13.5px] leading-snug break-words text-ink">
      <IconoProhibido className="mt-[3px] h-3.5 w-3.5 flex-none text-bad" />
      <span className="min-w-0">
        {item.clave}
        {item.valor ? <span className="mt-0.5 block text-[12.5px] font-normal text-ink-mute">{item.valor}</span> : null}
      </span>
    </p>
  );
}

export function FilaConocimiento({ item }: { item: ItemConocimiento }) {
  const [confirmando, setConfirmando] = useState(false);
  const [estadoAlternar, alternar, alternando] = useAccionPanel("alternarConocimiento");
  const [estadoEliminar, eliminar, eliminando] = useAccionPanel("eliminarConocimiento", (r) => {
    if (!r.ok) setConfirmando(false);
  });
  const ocupado = alternando || eliminando;
  const aviso = useAvisoTemporal(estadoAlternar, 2500);
  const error =
    estadoAlternar && !estadoAlternar.ok
      ? estadoAlternar.error
      : estadoEliminar && !estadoEliminar.ok
        ? estadoEliminar.error
        : null;
  const nombre = `${TEXTOS_CONOCIMIENTO[item.tipo].singular} «${item.clave}»`;

  return (
    <li
      aria-busy={ocupado}
      className={cn("px-4 py-3 transition-colors sm:px-[18px]", ocupado && "bg-surface-3/40")}
    >
      <form action={alternar}>
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="activo" value={String(item.activo)} />
        <CampoToken />

        <div className="flex items-start gap-3">
          <div className={cn("min-w-0 flex-1 py-1 transition-opacity", !item.activo && "opacity-55")}>
            <Contenido item={item} />
            {!item.activo ? (
              <span className="mt-1.5 inline-flex">
                <Pill tono="idle">Apagado</Pill>
              </span>
            ) : null}
          </div>

          {/* Controles: 44 px de objetivo, con margen negativo para que el
              ícono quede alineado con el borde de la caja. */}
          <div className="-mr-3 flex flex-none items-center">
            <InterruptorEnvio
              activo={item.activo}
              ocupado={alternando}
              etiqueta={`Usar ${nombre}`}
            />
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              disabled={ocupado || confirmando}
              aria-label={`Eliminar ${nombre}`}
              className="grid h-11 w-11 flex-none place-items-center rounded-full text-ink-mute transition-colors outline-none hover:bg-bad/10 hover:text-bad focus-visible:ring-2 focus-visible:ring-[color:var(--panel-acento-borde)] disabled:pointer-events-none disabled:opacity-40"
            >
              <IconoBasura className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        {confirmando ? (
          <div
            role="group"
            aria-label={`Confirmar eliminar ${nombre}`}
            className="mt-2 flex flex-col gap-3 rounded-xl border border-bad/30 bg-bad/[0.07] p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-[12.5px] leading-snug text-ink-soft">
              ¿Eliminar esto para siempre? Si solo querés que el agente deje de usarlo, apagalo con el interruptor.
            </p>
            <div className="flex flex-none gap-2">
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                disabled={eliminando}
                className={cn(BTN_SECUNDARIO, "max-sm:flex-1")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                formAction={eliminar}
                disabled={eliminando}
                className={cn(BTN_PELIGRO, "max-sm:flex-1")}
              >
                {eliminando ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Eliminando…
                  </>
                ) : (
                  "Sí, eliminar"
                )}
              </button>
            </div>
          </div>
        ) : null}

        {error ? <MensajeEstado ok={false} className="mt-2">{error}</MensajeEstado> : null}
        {aviso && !error ? (
          <p role="status" className="mt-1 text-[11.5px] text-ok">
            {aviso}
          </p>
        ) : null}
      </form>
    </li>
  );
}
