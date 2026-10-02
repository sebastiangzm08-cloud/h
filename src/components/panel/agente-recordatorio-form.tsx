"use client";

/* ==========================================================================
   Programar un recordatorio a mano — para lo que sea (medicamento,
   seguimiento, lo que el dueño quiera). El CONTENIDO lo escribe siempre una
   persona acá; el sistema solo se encarga de mandarlo cuando toca, y de
   repetirlo con el MISMO texto si se configuró así.

   Desde la Fase 4a el formulario se abre dentro de una hoja modal
   (`HojaModal`, ver `clientes/lista-clientes.tsx`): cada apertura monta un
   formulario nuevo, sin el mensaje de éxito de la vez anterior.
   ========================================================================== */
import { useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import {
  BotonesFormulario,
  CLASE_AREA,
  CLASE_INPUT,
  Campo,
  enviarSinBorrar,
  MensajeResultado,
} from "@/components/panel/clientes/formulario";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import { PLANTILLAS_RECORDATORIO_MANUAL, type TipoRecordatorioManual } from "@/lib/panel/agente-plantillas";
import { cn } from "@/lib/utils";

type TipoRecordatorio = TipoRecordatorioManual | "libre";

export function FormularioRecordatorio({
  contactoId,
  onCerrar,
}: {
  contactoId: string;
  onCerrar: () => void;
}) {
  const [estado, crear, creando] = useAccionAgente("crearRecordatorio");
  const [repite, setRepite] = useState(false);
  const [tipo, setTipo] = useState<TipoRecordatorio>("libre");
  const plantilla = PLANTILLAS_RECORDATORIO_MANUAL.find((p) => p.tipo === tipo);

  return (
    <form onSubmit={enviarSinBorrar(crear)} className="flex flex-col gap-3.5">
      <input type="hidden" name="contactoId" value={contactoId} />
      <CampoToken />

      <Campo etiqueta="Tipo de recordatorio">
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoRecordatorio)}
          className={CLASE_INPUT}
        >
          <option value="libre">Texto libre (solo si escribió hace poco)</option>
          {PLANTILLAS_RECORDATORIO_MANUAL.map((p) => (
            <option key={p.tipo} value={p.tipo}>
              {p.etiqueta}
            </option>
          ))}
        </select>
      </Campo>

      {tipo === "libre" ? (
        <Campo
          etiqueta="Mensaje"
          ayuda="Escribilo tal cual se lo vas a mandar. Funciona solo si la persona escribió en las últimas 24 h; si no, elegí uno de los tipos de arriba."
        >
          <textarea
            autoComplete="off"
            name="mensaje"
            required
            rows={3}
            placeholder="Ej.: Recuerde tomar su antibiótico cada 8 horas."
            className={CLASE_AREA}
          />
        </Campo>
      ) : (
        <div className="flex flex-col gap-3.5">
          {plantilla?.campos.map((c) => (
            <Campo key={c.nombre} etiqueta={c.etiqueta}>
              <input
                autoComplete="off"
                name="campoValor"
                required
                placeholder={c.placeholder}
                className={CLASE_INPUT}
              />
            </Campo>
          ))}
        </div>
      )}

      <Campo etiqueta="Cuándo mandarlo">
        <input autoComplete="off" type="datetime-local" name="cuando" required className={CLASE_INPUT} />
      </Campo>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface-2 px-3.5 text-[13.5px] text-ink-soft">
        <input
          type="checkbox"
          checked={repite}
          onChange={(e) => setRepite(e.target.checked)}
          className="h-[18px] w-[18px] flex-none accent-ink"
        />
        Repetir automáticamente
      </label>

      {repite ? (
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Cada cuántas horas">
            <input
              autoComplete="off"
              type="number"
              inputMode="numeric"
              name="repetirCadaHoras"
              min={1}
              defaultValue={8}
              className={CLASE_INPUT}
            />
          </Campo>
          <Campo etiqueta="Cuántas veces en total">
            <input
              autoComplete="off"
              type="number"
              inputMode="numeric"
              name="repeticiones"
              min={1}
              defaultValue={3}
              className={CLASE_INPUT}
            />
          </Campo>
        </div>
      ) : null}

      <MensajeResultado estado={estado} />
      <BotonesFormulario
        ok={Boolean(estado?.ok)}
        pendiente={creando}
        textoEnviar="Programar"
        textoPendiente="Guardando…"
        onCerrar={onCerrar}
      />
    </form>
  );
}

export function BotonCancelarRecordatorio({ id }: { id: string }) {
  const [, cancelar, cancelando] = useAccionAgente("cancelarRecordatorio");
  return (
    <form
      action={cancelar}
      onSubmit={(e) => {
        if (!confirm("¿Cancelar este recordatorio?")) e.preventDefault();
      }}
      className="flex-none"
    >
      <input type="hidden" name="id" value={id} />
      <CampoToken />
      <button
        type="submit"
        disabled={cancelando}
        className={cn(
          "inline-flex min-h-11 items-center justify-center rounded-xl border border-bad/35 px-3.5 text-[13px] font-medium text-bad",
          "transition-[background-color,transform] duration-150 hover:bg-bad/10 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 sm:min-h-8 sm:rounded-lg sm:px-3 sm:text-[12px]"
        )}
      >
        {cancelando ? "…" : "Cancelar"}
      </button>
    </form>
  );
}
