"use client";

import { useActionState } from "react";
import { crearConsulta, type ResultadoConsulta } from "@/lib/panel/soporte-acciones";
import { cn } from "@/lib/utils";

const campo =
  "w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[13.5px] text-ink " +
  "placeholder:text-ink-faint transition-colors focus:border-line-strong " +
  "focus:bg-surface-3 focus:outline-none";

export function FormNuevaConsulta() {
  const [estado, accion, pendiente] = useActionState<
    ResultadoConsulta | null,
    FormData
  >(crearConsulta, null);

  return (
    <form action={accion} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-ink-mute">Asunto</span>
        <input
          name="asunto"
          required
          maxLength={120}
          placeholder="Ej.: no me aparece una automatización"
          className={cn(campo, "h-11")}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-ink-mute">Contanos qué pasa</span>
        <textarea
          name="texto"
          required
          rows={5}
          placeholder="Todo el detalle que puedas: qué esperabas, qué viste, desde cuándo…"
          className={cn(campo, "resize-none")}
        />
      </label>

      {estado && !estado.ok ? (
        <p role="alert" className="rounded-lg bg-bad/10 px-3.5 py-3 text-[12.5px] text-bad">
          {estado.error}
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
        {pendiente ? "Enviando…" : "Enviar consulta"}
      </button>
    </form>
  );
}
