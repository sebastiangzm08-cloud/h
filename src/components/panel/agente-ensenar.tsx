"use client";

/* ==========================================================================
   Una fila de "Correcciones", ya conectada: la respuesta se guarda en
   `wa_conocimiento` y la pregunta pasa a "ensenada" — el agente la usa desde
   la siguiente conversación. "Descartar" es para preguntas que no aplican
   (spam, fuera de tema) sin ensuciar lo que el agente sabe.

   Estados: guardando (rueda en el botón y todo bloqueado), error (queda a la
   vista y la respuesta escrita NO se pierde) y éxito (la fila desaparece de
   pendientes al refrescar la lista).
   ========================================================================== */
import { useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { MensajeEstado } from "@/components/panel/configuracion/controles";
import { BTN_PRIMARIO, BTN_SECUNDARIO, CAMPO } from "@/components/panel/configuracion/estilos";
import { Spinner } from "@/components/panel/configuracion/iconos-extra";
import { useAccionPanel } from "@/components/panel/configuracion/usar-accion";
import { cn } from "@/lib/utils";

export function FormaEnsenar({ correccionId, pregunta }: { correccionId: string; pregunta: string }) {
  const [respuesta, setRespuesta] = useState("");
  const [estadoEnsenar, ensenar, ensenando] = useAccionPanel("ensenarCorreccion");
  const [estadoDescartar, descartar, descartando] = useAccionPanel("descartarCorreccion");
  const ocupado = ensenando || descartando;
  const error =
    estadoEnsenar && !estadoEnsenar.ok
      ? estadoEnsenar.error
      : estadoDescartar && !estadoDescartar.ok
        ? estadoDescartar.error
        : null;

  /* `onSubmit` y no `action`: con `action`, React 19 vacía el campo al
     enviarlo y, si el guardado fallaba, se perdía la respuesta escrita. */
  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!respuesta.trim()) return;
    const datos = new FormData(e.currentTarget);
    /* Un salto de línea rompe cómo se lista lo que sabe el agente (esto se
       guarda como un dato de Conocimiento): se aplana a un espacio. */
    datos.set("respuesta", String(datos.get("respuesta") ?? "").replace(/\s*\n+\s*/g, " ").trim());
    ensenar(datos);
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-2.5">
      <input type="hidden" name="correccionId" value={correccionId} />
      <CampoToken />

      <textarea
        name="respuesta"
        value={respuesta}
        onChange={(e) => setRespuesta(e.target.value)}
        disabled={ocupado}
        rows={2}
        autoComplete="off"
        aria-label={`Respuesta para: ${pregunta}`}
        placeholder="Escribí la respuesta como se la darías vos a un cliente"
        className={cn(CAMPO, "resize-y")}
      />

      {error ? <MensajeEstado ok={false}>{error}</MensajeEstado> : null}

      <div className="flex flex-wrap gap-2.5">
        <button
          type="submit"
          disabled={ocupado || !respuesta.trim()}
          className={cn(BTN_PRIMARIO, "max-sm:flex-1")}
        >
          {ensenando ? (
            <>
              <Spinner className="h-4 w-4" />
              Guardando…
            </>
          ) : (
            "Enseñarle"
          )}
        </button>
        <button
          type="button"
          disabled={ocupado}
          onClick={(e) => {
            const form = e.currentTarget.form;
            if (form) descartar(new FormData(form));
          }}
          className={BTN_SECUNDARIO}
        >
          {descartando ? (
            <>
              <Spinner className="h-4 w-4" />
              Descartando…
            </>
          ) : (
            "Descartar"
          )}
        </button>
      </div>
    </form>
  );
}
