"use client";

/* ==========================================================================
   Redactar un correo NUEVO — a diferencia de `RedactarCorreo` (que solo
   responde dentro de un hilo ya abierto), esto empieza uno.

   Desde la Fase 4a se abre en una hoja modal (`HojaModal`) en vez de
   desplegarse en línea arriba de la bandeja: la pantalla de Correo tiene
   altura fija y, en el celular, un formulario de cinco campos abierto ahí
   empujaba la lista y quedaba cortado. Cada apertura monta un formulario
   nuevo, sin el mensaje de éxito del correo anterior.
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
import { HojaModal } from "@/components/panel/clientes/hoja-modal";
import { BOTON, BOTON_BASE } from "@/components/panel/clientes/piezas";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import { cn } from "@/lib/utils";

function FormularioCorreoNuevo({ onCerrar }: { onCerrar: () => void }) {
  const [estado, iniciar, enviando] = useAccionAgente("iniciarCorreoNuevo");

  return (
    <form onSubmit={enviarSinBorrar(iniciar)} className="flex flex-col gap-3.5">
      <CampoToken />
      <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-3">
        <Campo etiqueta="Para">
          <input
            autoComplete="off"
            type="email"
            inputMode="email"
            name="destinatario"
            required
            placeholder="correo@ejemplo.com"
            className={CLASE_INPUT}
          />
        </Campo>
        <Campo etiqueta="Nombre (opcional)">
          <input autoComplete="off" type="text" name="nombre" placeholder="Quién es" className={CLASE_INPUT} />
        </Campo>
      </div>
      <Campo etiqueta="Asunto">
        <input
          autoComplete="off"
          type="text"
          name="asunto"
          required
          placeholder="De qué se trata"
          className={CLASE_INPUT}
        />
      </Campo>
      <Campo etiqueta="Mensaje">
        <textarea
          autoComplete="off"
          name="texto"
          required
          rows={5}
          placeholder="Escribir el correo…"
          className={CLASE_AREA}
        />
      </Campo>
      <MensajeResultado estado={estado} />
      <BotonesFormulario
        ok={Boolean(estado?.ok)}
        pendiente={enviando}
        textoEnviar="Enviar"
        textoPendiente="Enviando…"
        onCerrar={onCerrar}
      />
    </form>
  );
}

export function BotonCorreoNuevo({ className }: { className?: string }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setAbierto(true)}
        className={cn(BOTON_BASE, BOTON.primario, "min-h-11 flex-none rounded-xl px-4 text-[13.5px] md:min-h-10", className)}
      >
        <span aria-hidden="true" className="text-[17px] leading-none">
          +
        </span>
        Redactar nuevo
      </button>

      {abierto ? (
        <HojaModal
          titulo="Redactar correo nuevo"
          descripcion="Sale desde la casilla conectada. Si esa persona ya te había escrito, se suma a su conversación."
          onCerrar={() => setAbierto(false)}
        >
          <FormularioCorreoNuevo onCerrar={() => setAbierto(false)} />
        </HojaModal>
      ) : null}
    </>
  );
}
