"use client";

/* ==========================================================================
   Programar un recordatorio a mano — para lo que sea (medicamento,
   seguimiento, lo que el dueño quiera). El CONTENIDO lo escribe siempre una
   persona acá; el sistema solo se encarga de mandarlo cuando toca, y de
   repetirlo con el MISMO texto si se configuró así.
   ========================================================================== */
import { useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import { PLANTILLAS_RECORDATORIO_MANUAL, type TipoRecordatorioManual } from "@/lib/panel/agente-plantillas";
import { cn } from "@/lib/utils";

type TipoRecordatorio = TipoRecordatorioManual | "libre";

const campo =
  "w-full rounded-lg border border-line-strong bg-surface-2 px-3 py-2 text-[13px] text-ink " +
  "placeholder:text-ink-faint outline-none transition-colors focus:border-ink-faint";

export function FormaRecordatorio({ contactoId, nombre }: { contactoId: string; nombre: string }) {
  const [abierto, setAbierto] = useState(false);
  /* Cambia cada vez que se abre — fuerza a React a MONTAR un formulario
     nuevo (con su propio `useAccionAgente` recién nacido) en vez de reusar
     el que se quedó con el resultado de la última vez. Sin esto, cerrar
     después de programar uno y volver a abrir se queda pegado en el
     mensaje de éxito anterior — mismo bug que ya se arregló en
     `agente-cita-form.tsx` y `agente-correo-nuevo.tsx`. */
  const [vuelta, setVuelta] = useState(0);

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => {
          setVuelta((v) => v + 1);
          setAbierto(true);
        }}
        className="rounded-md border border-line-strong px-2 py-1 text-[11px] text-ink-mute transition-colors hover:bg-surface-2"
      >
        Programar recordatorio
      </button>
    );
  }

  return (
    <FormularioRecordatorio
      key={vuelta}
      contactoId={contactoId}
      nombre={nombre}
      onCerrar={() => setAbierto(false)}
    />
  );
}

function FormularioRecordatorio({
  contactoId,
  nombre,
  onCerrar,
}: {
  contactoId: string;
  nombre: string;
  onCerrar: () => void;
}) {
  const [estado, crear, creando] = useAccionAgente("crearRecordatorio");
  const [repite, setRepite] = useState(false);
  const [tipo, setTipo] = useState<TipoRecordatorio>("libre");
  const plantilla = PLANTILLAS_RECORDATORIO_MANUAL.find((p) => p.tipo === tipo);

  return (
    <form action={crear} className="flex flex-col gap-2.5 rounded-xl border border-line bg-surface-2/40 p-3">
      <input type="hidden" name="contactoId" value={contactoId} />
      <CampoToken />

      <p className="text-[11.5px] text-ink-faint">
        Para <span className="text-ink-soft">{nombre}</span>.
      </p>

      <label className="flex flex-col gap-1">
        <span className="text-[11px] text-ink-faint">Tipo de recordatorio</span>
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoRecordatorio)}
          className={cn(campo, "appearance-none")}
        >
          <option value="libre">Texto libre (solo si escribió hace poco)</option>
          {PLANTILLAS_RECORDATORIO_MANUAL.map((p) => (
            <option key={p.tipo} value={p.tipo}>
              {p.etiqueta}
            </option>
          ))}
        </select>
      </label>

      {tipo === "libre" ? (
        <>
          <p className="text-[11px] text-ink-faint">
            Escribilo tal cual se lo vas a mandar. Funciona solo si la persona escribió en las últimas 24
            h — si no, mejor elegí uno de los tipos de arriba.
          </p>
          <textarea autoComplete="off"
            name="mensaje"
            required
            rows={2}
            placeholder="Ej.: Recuerde tomar su antibiótico cada 8 horas."
            className={cn(campo, "resize-none")}
          />
        </>
      ) : (
        <div className="flex flex-col gap-2">
          {plantilla?.campos.map((c) => (
            <label key={c.nombre} className="flex flex-col gap-1">
              <span className="text-[11px] text-ink-faint">{c.etiqueta}</span>
              <input autoComplete="off" name="campoValor" required placeholder={c.placeholder} className={campo} />
            </label>
          ))}
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] text-ink-faint">Cuándo mandarlo</span>
        <input autoComplete="off" type="datetime-local" name="cuando" required className={campo} />
      </label>

      <label className="flex cursor-pointer items-center gap-2 text-[12px] text-ink-soft">
        <input
          type="checkbox"
          checked={repite}
          onChange={(e) => setRepite(e.target.checked)}
          className="h-3.5 w-3.5 accent-ink"
        />
        Repetir automáticamente
      </label>

      {repite ? (
        <div className="grid grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-ink-faint">Cada cuántas horas</span>
            <input autoComplete="off" type="number" name="repetirCadaHoras" min={1} defaultValue={8} className={campo} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-ink-faint">Cuántas veces en total</span>
            <input autoComplete="off" type="number" name="repeticiones" min={1} defaultValue={3} className={campo} />
          </label>
        </div>
      ) : null}

      {estado && !estado.ok ? <p className="text-[12px] text-bad">{estado.error}</p> : null}
      {estado && estado.ok ? <p className="text-[12px] text-ok">{estado.mensaje}</p> : null}

      <div className="flex gap-2">
        {estado?.ok ? null : (
          <button
            type="submit"
            disabled={creando}
            className="rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft disabled:pointer-events-none disabled:opacity-40"
          >
            {creando ? "Guardando…" : "Programar"}
          </button>
        )}
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-lg border border-line-strong px-3.5 py-2 text-[13px] text-ink-mute transition-colors hover:bg-surface-2"
        >
          {estado?.ok ? "Cerrar" : "Cancelar"}
        </button>
      </div>
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
    >
      <input type="hidden" name="id" value={id} />
      <CampoToken />
      <button
        type="submit"
        disabled={cancelando}
        className="rounded-md border border-line-strong px-2 py-1 text-[11px] text-bad transition-colors hover:bg-bad/10 disabled:pointer-events-none disabled:opacity-40"
      >
        {cancelando ? "…" : "Cancelar"}
      </button>
    </form>
  );
}
