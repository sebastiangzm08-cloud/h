"use client";

/* ==========================================================================
   La caja de responder de "Correo" — mismo patrón que `agente-redactar.tsx`
   (WhatsApp), apuntando a las acciones de correo. Se mantiene aparte en vez
   de generalizar un componente único: el texto y las acciones difieren, y
   son solo dos archivos chicos.

   Fase 4a (celular): el hilo es lo que se lee, así que en pantallas
   angostas la caja de escribir viene PLEGADA y se abre con "Responder"; en
   escritorio (`md`) está siempre abierta, como antes. El formulario es el
   mismo y siempre está montado — plegado es solo `hidden` — así que enviar,
   tomar el control y devolverlo funcionan igual que siempre.

   Cambio de comportamiento chico, a propósito: el texto se borra SOLO si el
   envío salió bien. Antes se borraba al apretar "Enviar" (React 19 vacía un
   `<form action>` apenas termina), así que si el correo fallaba (SMTP caído,
   clave vencida) se perdía lo escrito. Ahora el formulario se manda con
   `onSubmit` (`enviarSinBorrar`) y se vacía acá, solo cuando salió bien.
   ========================================================================== */
import { useEffect, useRef, useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { enviarSinBorrar } from "@/components/panel/clientes/formulario";
import { BOTON, BOTON_BASE } from "@/components/panel/clientes/piezas";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import type { ConversacionCorreo } from "@/lib/panel/agente";
import { cn } from "@/lib/utils";

export function RedactarCorreo({
  conversacion,
  asunto,
  tomadaHace,
}: {
  conversacion: ConversacionCorreo;
  asunto: string;
  /** "hace 3 h" — viene calculado en el servidor para no desfasar al hidratar. */
  tomadaHace: string;
}) {
  const enPausa = conversacion.estado === "espera" || conversacion.estado === "humano";
  const formRef = useRef<HTMLFormElement>(null);
  const [abierto, setAbierto] = useState(false);

  const [estadoEnvio, enviar, enviando] = useAccionAgente("enviarMensajeManualCorreo");
  const [, tomar, tomando] = useAccionAgente("tomarControlCorreo");
  const [, devolver, devolviendo] = useAccionAgente("devolverAgenteCorreo");

  useEffect(() => {
    if (estadoEnvio?.ok) formRef.current?.reset();
  }, [estadoEnvio]);

  return (
    <div className="flex-none border-t border-line bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-5">
      <div className="flex flex-col gap-2.5 md:flex-row md:items-center">
        <p className="flex min-w-0 items-start gap-2 text-[12px] leading-snug text-ink-mute md:flex-1 md:items-center md:text-[12.5px]">
          <span
            className={cn("mt-[5px] h-1.5 w-1.5 flex-none rounded-full md:mt-0", enPausa ? "bg-warn" : "bg-ok")}
            aria-hidden="true"
          />
          <span className="min-w-0">
            {conversacion.estado === "espera"
              ? "El agente está en pausa acá. Si respondés vos, se queda callado hasta que se lo devuelvas."
              : conversacion.estado === "humano"
                ? `Tomaste esta conversación ${tomadaHace}. El agente no responde acá.`
                : "El agente está atendiendo esta conversación."}
          </span>
        </p>

        <div className="flex flex-wrap gap-2 md:flex-none md:flex-nowrap">
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls="redactar-correo-form"
            className={cn(
              BOTON_BASE,
              BOTON.primario,
              "min-h-11 flex-1 basis-[7.5rem] rounded-xl px-4 text-[13.5px] md:hidden"
            )}
          >
            {abierto ? "Ocultar" : "Responder"}
          </button>

          <form action={enPausa ? devolver : tomar} className="flex-1 basis-[7.5rem] md:flex-none">
            <input type="hidden" name="conversacionId" value={conversacion.id} />
            <CampoToken />
            <button
              type="submit"
              disabled={enPausa ? devolviendo : tomando}
              className={cn(
                BOTON_BASE,
                BOTON.secundario,
                "min-h-11 w-full rounded-xl px-3.5 text-[13.5px] md:min-h-8 md:w-auto md:rounded-lg md:px-3 md:text-[12px]"
              )}
            >
              {enPausa
                ? devolviendo
                  ? "…"
                  : "Devolvérselo al agente"
                : tomando
                  ? "…"
                  : "Tomar el control"}
            </button>
          </form>
        </div>
      </div>

      {/* Compositor de correo, no de chat: destinatario y asunto a la vista
          (ambos fijos — es una respuesta, no un mensaje nuevo), y un
          cuadro de varias líneas en vez de un solo renglón. */}
      <form
        id="redactar-correo-form"
        ref={formRef}
        onSubmit={enviarSinBorrar(enviar)}
        className={cn(
          "mt-2.5 overflow-hidden rounded-xl border border-line-strong bg-surface-2 transition-[border-color,box-shadow] duration-150",
          "focus-within:border-[var(--panel-acento)] focus-within:ring-[3px] focus-within:ring-[var(--panel-acento-fondo)]",
          abierto ? "block" : "hidden md:block"
        )}
      >
        <input type="hidden" name="conversacionId" value={conversacion.id} />
        <CampoToken />
        <div className="flex items-baseline gap-2 border-b border-line px-3.5 py-2 font-mono text-[11px]">
          <span className="w-[46px] flex-none text-ink-faint">Para</span>
          <span className="min-w-0 flex-1 truncate text-ink-mute">{conversacion.correo}</span>
        </div>
        <div className="flex items-baseline gap-2 border-b border-line px-3.5 py-2 font-mono text-[11px]">
          <span className="w-[46px] flex-none text-ink-faint">Asunto</span>
          <span className="min-w-0 flex-1 truncate text-ink-mute">{asunto}</span>
        </div>
        <textarea
          autoComplete="off"
          name="texto"
          required
          rows={3}
          placeholder="Escribir un correo…"
          aria-label="Escribir correo"
          className="block w-full resize-none bg-transparent px-3.5 py-3 text-[16px] leading-relaxed text-ink outline-none placeholder:text-ink-faint md:py-2.5 md:text-[13px]"
        />
        <div className="flex justify-end border-t border-line px-3 py-2">
          <button
            type="submit"
            disabled={enviando}
            className={cn(
              BOTON_BASE,
              BOTON.primario,
              "min-h-11 rounded-xl px-5 text-[13.5px] md:min-h-8 md:rounded-lg md:px-3 md:text-[13px]"
            )}
          >
            {enviando ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </form>

      {estadoEnvio && !estadoEnvio.ok ? (
        <p role="alert" className="mt-2 rounded-xl bg-bad/10 px-3.5 py-2.5 text-[12.5px] leading-snug text-bad">
          {estadoEnvio.error}
        </p>
      ) : null}
    </div>
  );
}
