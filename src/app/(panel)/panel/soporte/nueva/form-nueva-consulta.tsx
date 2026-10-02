"use client";

import { startTransition, useActionState } from "react";
import { Campo, MensajeEstado } from "@/components/panel/configuracion/controles";
import { BTN_PRIMARIO, CAMPO } from "@/components/panel/configuracion/estilos";
import { Spinner } from "@/components/panel/configuracion/iconos-extra";
import { crearConsulta, type ResultadoConsulta } from "@/lib/panel/soporte-acciones";
import { cn } from "@/lib/utils";

export function FormNuevaConsulta() {
  const [estado, accion, pendiente] = useActionState<
    ResultadoConsulta | null,
    FormData
  >(crearConsulta, null);

  /* `onSubmit` y no `action`: con `action`, React 19 vacía el formulario al
     enviarlo y, si el envío fallaba, se perdía la consulta que la persona
     acababa de escribir. Es la misma acción del servidor de siempre. */
  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    startTransition(() => {
      accion(datos);
    });
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <Campo etiqueta="Asunto">
        <input
          name="asunto"
          required
          maxLength={120}
          autoComplete="off"
          disabled={pendiente}
          placeholder="Ej.: no me aparece una automatización"
          className={CAMPO}
        />
      </Campo>

      <Campo etiqueta="Contanos qué pasa">
        <textarea
          name="texto"
          required
          rows={6}
          disabled={pendiente}
          placeholder="Todo el detalle que puedas: qué esperabas, qué viste, desde cuándo…"
          className={cn(CAMPO, "resize-y")}
        />
      </Campo>

      {estado && !estado.ok ? <MensajeEstado ok={false}>{estado.error}</MensajeEstado> : null}

      <button type="submit" disabled={pendiente} className={cn(BTN_PRIMARIO, "w-full sm:w-auto sm:self-start")}>
        {pendiente ? (
          <>
            <Spinner className="h-4 w-4" />
            Enviando…
          </>
        ) : (
          "Enviar consulta"
        )}
      </button>
    </form>
  );
}
