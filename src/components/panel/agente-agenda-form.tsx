"use client";

/* ==========================================================================
   Editar "Cómo agenda" y el horario de atención. Dos tablas distintas
   (`asignaciones.config.agenda` y `clientes.horario`) pero un solo
   formulario — el dueño los ve y los cambia juntos.
   ========================================================================== */
import { useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import { DIAS_HORARIO, type ConfigAgenda } from "@/lib/panel/agente-config";
import { cn } from "@/lib/utils";

const campo =
  "w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[13.5px] text-ink " +
  "transition-colors focus:border-line-strong focus:bg-surface-3 focus:outline-none";

export function FormaAgenda({
  agenda,
  horario,
}: {
  agenda: ConfigAgenda;
  horario: Record<string, [string, string][]>;
}) {
  const [estado, accion, pendiente] = useAccionAgente("guardarAgenda");
  const [abierto, setAbierto] = useState(false);
  const [cerrados, setCerrados] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(DIAS_HORARIO.map(({ clave }) => [clave, !horario[clave]?.length]))
  );

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="self-start rounded-lg border border-line-strong px-3.5 py-2 text-[13px] text-ink-soft transition-colors hover:bg-surface-2"
      >
        Editar agenda y horario
      </button>
    );
  }

  return (
    <form action={accion} className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4">
      <CampoToken />

      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-surface-2 px-4 py-3">
        <span className="min-w-0">
          <span className="block text-[13px] font-medium text-ink-soft">Agendar solo</span>
          <span className="mt-0.5 block text-[11.5px] text-ink-faint">
            Si lo apagás, el agente toma el dato y avisa que alguien lo confirma.
          </span>
        </span>
        <input type="checkbox" name="activa" defaultChecked={agenda.activa} className="h-4 w-4 flex-none accent-ink" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">Capacidad simultánea</span>
          <input autoComplete="off" type="number" name="capacidad" min={1} max={20} defaultValue={agenda.capacidad} className={campo} />
          <span className="text-[11px] text-ink-faint">Cuántas citas caben a la misma hora.</span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">Colchón entre citas (min)</span>
          <input autoComplete="off" type="number" name="colchonMin" min={0} max={120} defaultValue={agenda.colchonMin} className={campo} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">Anticipación mínima (min)</span>
          <input autoComplete="off"
            type="number"
            name="anticipacionMin"
            min={0}
            max={1440}
            defaultValue={agenda.anticipacionMin}
            className={campo}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">Busca campo hasta (días)</span>
          <input autoComplete="off"
            type="number"
            name="maximoDiasAdelante"
            min={1}
            max={90}
            defaultValue={agenda.maximoDiasAdelante}
            className={campo}
          />
        </label>
      </div>

      <div className="rounded-xl border border-line bg-surface-2 p-3">
        <p className="mb-2 px-1 text-[11.5px] font-medium text-ink-mute">Horario de atención</p>
        <div className="flex flex-col gap-2">
          {DIAS_HORARIO.map(({ clave, texto }) => {
            const bloque = horario[clave]?.[0];
            const cerrado = cerrados[clave];
            return (
              <div key={clave} className="flex items-center gap-2.5">
                <label className="flex w-28 flex-none items-center gap-2 text-[12.5px] text-ink-soft">
                  <input
                    type="checkbox"
                    checked={!cerrado}
                    onChange={(e) => setCerrados((c) => ({ ...c, [clave]: !e.target.checked }))}
                    className="h-3.5 w-3.5 accent-ink"
                  />
                  {texto}
                </label>
                <input autoComplete="off"
                  type="time"
                  name={`ini_${clave}`}
                  defaultValue={bloque?.[0] ?? "08:00"}
                  disabled={cerrado}
                  className={cn(campo, "max-w-[130px] py-1.5 disabled:opacity-40")}
                />
                <span className="text-ink-faint">–</span>
                <input autoComplete="off"
                  type="time"
                  name={`fin_${clave}`}
                  defaultValue={bloque?.[1] ?? "17:00"}
                  disabled={cerrado}
                  className={cn(campo, "max-w-[130px] py-1.5 disabled:opacity-40")}
                />
                <input type="hidden" name={`cerrado_${clave}`} value={cerrado ? "on" : ""} />
              </div>
            );
          })}
        </div>
      </div>

      {estado && !estado.ok ? (
        <p role="alert" className="rounded-lg bg-bad/10 px-3.5 py-3 text-[12.5px] text-bad">
          {estado.error}
        </p>
      ) : null}
      {estado && estado.ok ? (
        <p role="status" className="rounded-lg bg-ok/10 px-3.5 py-3 text-[12.5px] text-ok">
          {estado.mensaje}
        </p>
      ) : null}

      <div className="flex gap-2.5">
        <button
          type="submit"
          disabled={pendiente}
          className={cn(
            "inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-[13.5px] font-medium text-paper",
            "transition-colors hover:bg-ink-soft disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          {pendiente ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="inline-flex h-11 items-center justify-center rounded-full border border-line-strong px-5 text-[13.5px] text-ink-soft transition-colors hover:bg-surface-2"
        >
          Cerrar
        </button>
      </div>
    </form>
  );
}
