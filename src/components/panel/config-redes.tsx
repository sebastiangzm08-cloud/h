"use client";

/* ==========================================================================
   Configuración editable de la automatización de Redes: cómo quiere el
   cliente que escriban sus publicaciones. Va a `asignaciones.config` y de
   ahí al prompt de cada post.
   ========================================================================== */
import { useActionState } from "react";
import {
  guardarConfigRedes,
  type ResultadoConfig,
} from "@/lib/panel/config-acciones";
import type { ConfigRedes } from "@/lib/panel/redes-config";
import { cn } from "@/lib/utils";

function Toggle({
  name,
  label,
  ayuda,
  activo,
}: {
  name: string;
  label: string;
  ayuda: string;
  activo: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 border-b border-line py-3 last:border-0">
      <span className="min-w-0">
        <span className="text-[13px] font-medium text-ink-soft">{label}</span>
        <span className="mt-0.5 block text-[11.5px] text-ink-faint">{ayuda}</span>
      </span>
      <input
        type="checkbox"
        name={name}
        defaultChecked={activo}
        className="mt-0.5 h-4 w-4 flex-none accent-ink"
      />
    </label>
  );
}

export function ConfigRedes({
  asignacionId,
  config,
}: {
  asignacionId: string;
  config: ConfigRedes;
}) {
  const [estado, accion, pendiente] = useActionState<
    ResultadoConfig | null,
    FormData
  >(guardarConfigRedes, null);

  const campo =
    "w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[13.5px] text-ink " +
    "placeholder:text-ink-faint transition-colors focus:border-line-strong " +
    "focus:bg-surface-3 focus:outline-none";

  return (
    <form action={accion} className="flex flex-col gap-4">
      <input type="hidden" name="asignacionId" value={asignacionId} />

      <label className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-ink-mute">
          Tono de las publicaciones
        </span>
        <textarea
          name="tono"
          rows={3}
          defaultValue={config.tono}
          placeholder="Ej.: cercano y tico, tratar de vos, sin tecnicismos, entusiasta pero sin exagerar"
          className={cn(campo, "resize-none")}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-ink-mute">
          Largo del texto
        </span>
        <select
          name="largo"
          defaultValue={config.largo}
          className={cn(campo, "max-w-[220px] appearance-none")}
        >
          <option value="corto">Corto — 1 o 2 frases</option>
          <option value="medio">Medio — un párrafo</option>
          <option value="largo">Largo — varios párrafos</option>
        </select>
      </label>

      <div className="rounded-2xl border border-line bg-surface-2 px-4 py-1">
        <Toggle
          name="textoPorRed"
          label="Texto distinto para cada red"
          ayuda="Adapta el mensaje a Instagram y a Facebook por separado."
          activo={config.textoPorRed}
        />
        <Toggle
          name="hashtags"
          label="Poner hashtags"
          ayuda="Entre 3 y 5, en español, al final del texto."
          activo={config.hashtags}
        />
        <Toggle
          name="emojis"
          label="Usar emojis"
          ayuda="Con moderación, para dar aire al texto."
          activo={config.emojis}
        />
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

      <button
        type="submit"
        disabled={pendiente}
        className={cn(
          "inline-flex h-11 items-center justify-center self-start rounded-full bg-ink px-6 text-[13.5px] font-medium text-paper",
          "transition-colors hover:bg-ink-soft disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        {pendiente ? "Guardando…" : "Guardar configuración"}
      </button>
    </form>
  );
}
