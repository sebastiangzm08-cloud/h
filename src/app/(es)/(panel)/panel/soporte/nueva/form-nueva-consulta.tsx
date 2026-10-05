"use client";

import { CampoToken } from "@/components/panel/campo-token";
import { Campo, MensajeEstado } from "@/components/panel/configuracion/controles";
import { BTN_PRIMARIO, CAMPO } from "@/components/panel/configuracion/estilos";
import { Spinner } from "@/components/panel/configuracion/iconos-extra";
import { useAccionPanelCliente } from "@/components/panel/usar-accion-panel";
import { cn } from "@/lib/utils";

export function FormNuevaConsulta() {
  /* Ya no es un Server Action (perdían la cookie en el POST): va por
     `/api/panel/crearConsulta`, como el admin y el agente. */
  const [estado, ejecutar, pendiente] = useAccionPanelCliente("crearConsulta");

  /* `onSubmit` y no `action`: con `action`, React 19 vacía el formulario al
     enviarlo y, si el envío fallaba, se perdía la consulta que la persona
     acababa de escribir. El navegador sigue validando (`required`) antes. */
  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    ejecutar(new FormData(e.currentTarget));
  }

  return (
    <form onSubmit={enviar} method="post" className="flex flex-col gap-4">
      <CampoToken />
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
