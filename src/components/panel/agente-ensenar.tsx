"use client";

/* ==========================================================================
   Una fila de "Correcciones", ya conectada: la respuesta se guarda en
   `wa_conocimiento` y la pregunta pasa a "ensenada" — el agente la usa desde
   la siguiente conversación. "Descartar" es para preguntas que no aplican
   (spam, fuera de tema) sin ensuciar lo que el agente sabe.
   ========================================================================== */
import { useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import { cn } from "@/lib/utils";

export function FormaEnsenar({ correccionId }: { correccionId: string }) {
  const [respuesta, setRespuesta] = useState("");
  const [estado, ensenar, ensenando] = useAccionAgente("ensenarCorreccion");
  const [, descartar, descartando] = useAccionAgente("descartarCorreccion");

  const campo =
    "min-w-0 flex-1 rounded-lg border border-line-strong bg-surface-2 px-3 py-2 text-[13px] text-ink " +
    "placeholder:text-ink-faint outline-none transition-colors focus:border-ink-faint " +
    "disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div>
      <div className="flex gap-2.5">
        <form action={ensenar} className="flex min-w-0 flex-1 gap-2.5">
          <input type="hidden" name="correccionId" value={correccionId} />
          <CampoToken />
          <input autoComplete="off"
            type="text"
            name="respuesta"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            disabled={ensenando || descartando}
            placeholder="Escribí la respuesta como se la darías vos a un paciente"
            aria-label="Respuesta para la pregunta"
            className={campo}
          />
          <button
            type="submit"
            disabled={ensenando || descartando || !respuesta.trim()}
            className={cn(
              "flex-none rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-paper transition-colors",
              "hover:bg-ink-soft disabled:pointer-events-none disabled:opacity-40"
            )}
          >
            {ensenando ? "Guardando…" : "Enseñarle"}
          </button>
        </form>
        <form action={descartar}>
          <input type="hidden" name="correccionId" value={correccionId} />
          <CampoToken />
          <button
            type="submit"
            disabled={ensenando || descartando}
            className="flex-none rounded-lg border border-line-strong px-3 py-2 text-[13px] text-ink-mute transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-40"
          >
            {descartando ? "…" : "Descartar"}
          </button>
        </form>
      </div>
      {estado && !estado.ok ? (
        <p role="alert" className="mt-1.5 text-[12px] text-bad">
          {estado.error}
        </p>
      ) : null}
    </div>
  );
}
