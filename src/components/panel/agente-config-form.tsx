"use client";

/* ==========================================================================
   Editar "Cómo responde" — tono, largo, emojis, espera y cuándo escalar.
   Va a `asignaciones.config`, mismo jsonb que ya lee el workflow de n8n.
   ========================================================================== */
import { useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import type { ConfigAgente } from "@/lib/panel/agente-config";
import { cn } from "@/lib/utils";

const campo =
  "w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[13.5px] text-ink " +
  "placeholder:text-ink-faint transition-colors focus:border-line-strong " +
  "focus:bg-surface-3 focus:outline-none";

export function FormaConfigAgente({ config }: { config: ConfigAgente }) {
  const [estado, accion, pendiente] = useAccionAgente("guardarConfigAgente");
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="self-start rounded-lg border border-line-strong px-3.5 py-2 text-[13px] text-ink-soft transition-colors hover:bg-surface-2"
      >
        Editar cómo responde
      </button>
    );
  }

  return (
    <form action={accion} className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4">
      <CampoToken />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">Trato</span>
          <select autoComplete="off" name="trato" defaultValue={config.trato} className={cn(campo, "appearance-none")}>
            <option value="usted">De usted</option>
            <option value="vos">De vos</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">Emojis</span>
          <select autoComplete="off" name="emojis" defaultValue={config.emojis} className={cn(campo, "appearance-none")}>
            <option value="ninguno">Ninguno</option>
            <option value="pocos">Pocos</option>
            <option value="varios">Varios</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">Largo de respuesta</span>
          <select autoComplete="off" name="largo" defaultValue={config.largo} className={cn(campo, "appearance-none")}>
            <option value="corto">Corto</option>
            <option value="medio">Medio</option>
            <option value="largo">Largo</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">
            Espera después del último mensaje (segundos)
          </span>
          <input autoComplete="off"
            type="number"
            name="esperaSegundos"
            min={0}
            max={60}
            defaultValue={config.esperaSegundos}
            className={campo}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-ink-mute">Estilo</span>
        <textarea autoComplete="off"
          name="estilo"
          rows={2}
          defaultValue={config.estilo}
          placeholder="Ej.: Cálido y cercano, como quien atiende bien en recepción."
          className={cn(campo, "resize-none")}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-ink-mute">
          Cuándo llamarte a vos — una situación por línea
        </span>
        <textarea autoComplete="off"
          name="escalar"
          rows={4}
          defaultValue={config.escalar.join("\n")}
          className={cn(campo, "resize-none font-mono text-[12.5px]")}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-ink-mute">Fuera de horario</span>
        <select autoComplete="off"
          name="fueraDeHorario"
          defaultValue={config.fueraDeHorario}
          className={cn(campo, "max-w-[260px] appearance-none")}
        >
          <option value="responde">Responde igual y agenda</option>
          <option value="avisa">Avisa que están cerrados</option>
          <option value="callado">No responde hasta abrir</option>
        </select>
      </label>

      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-surface-2 px-4 py-3">
        <span className="text-[13px] text-ink-soft">Escuchar y transcribir notas de voz</span>
        <input
          type="checkbox"
          name="transcribirAudios"
          defaultChecked={config.transcribirAudios}
          className="h-4 w-4 accent-ink"
        />
      </label>

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
