"use client";

/* ==========================================================================
   La caja de responder de "Correo" — mismo patrón que `agente-redactar.tsx`
   (WhatsApp), apuntando a las acciones de correo. Se mantiene aparte en vez
   de generalizar un componente único: el texto y las acciones difieren, y
   son solo dos archivos chicos.
   ========================================================================== */
import { useRef } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import { cn } from "@/lib/utils";
import { relativa } from "@/lib/panel/agente-formato";
import type { ConversacionCorreo } from "@/lib/panel/agente";

export function RedactarCorreo({
  conversacion,
  asunto,
}: {
  conversacion: ConversacionCorreo;
  asunto: string;
}) {
  const enPausa = conversacion.estado === "espera" || conversacion.estado === "humano";
  const formRef = useRef<HTMLFormElement>(null);

  const [estadoEnvio, enviar, enviando] = useAccionAgente("enviarMensajeManualCorreo");
  const [, tomar, tomando] = useAccionAgente("tomarControlCorreo");
  const [, devolver, devolviendo] = useAccionAgente("devolverAgenteCorreo");

  function alEnviar(form: FormData) {
    enviar(form);
    formRef.current?.reset();
  }

  return (
    <div className="border-t border-line bg-surface px-5 py-3">
      <div className="mb-2.5 flex items-center gap-2.5 text-xs text-ink-mute">
        <span className={cn("h-1.5 w-1.5 flex-none rounded-full", enPausa ? "bg-warn" : "bg-ok")} />
        <span className="min-w-0 flex-1">
          {conversacion.estado === "espera"
            ? "El agente está en pausa acá. Si respondés vos, se queda callado hasta que se lo devuelvas."
            : conversacion.estado === "humano"
              ? `Tomaste esta conversación ${relativa(conversacion.ultimoEn)}. El agente no responde acá.`
              : "El agente está atendiendo esta conversación."}
        </span>
        {enPausa ? (
          <form action={devolver}>
            <input type="hidden" name="conversacionId" value={conversacion.id} />
            <CampoToken />
            <button
              type="submit"
              disabled={devolviendo}
              className="flex-none rounded-lg border border-line-strong px-3 py-1.5 text-[13px] text-ink-mute transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {devolviendo ? "…" : "Devolvérselo al agente"}
            </button>
          </form>
        ) : (
          <form action={tomar}>
            <input type="hidden" name="conversacionId" value={conversacion.id} />
            <CampoToken />
            <button
              type="submit"
              disabled={tomando}
              className="flex-none rounded-lg border border-line-strong px-3 py-1.5 text-[13px] text-ink-mute transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {tomando ? "…" : "Tomar el control"}
            </button>
          </form>
        )}
      </div>

      {/* Compositor de correo, no de chat: destinatario y asunto a la vista
          (ambos fijos — es una respuesta, no un mensaje nuevo), y un
          cuadro de varias líneas en vez de un solo renglón. */}
      <form
        ref={formRef}
        action={alEnviar}
        className="overflow-hidden rounded-[10px] border border-line-strong bg-surface-2 focus-within:border-ink-faint"
      >
        <input type="hidden" name="conversacionId" value={conversacion.id} />
        <CampoToken />
        <div className="flex items-baseline gap-2 border-b border-line px-3 py-2 font-mono text-[11px]">
          <span className="flex-none text-ink-faint">Para</span>
          <span className="min-w-0 flex-1 truncate text-ink-mute">{conversacion.correo}</span>
        </div>
        <div className="flex items-baseline gap-2 border-b border-line px-3 py-2 font-mono text-[11px]">
          <span className="flex-none text-ink-faint">Asunto</span>
          <span className="min-w-0 flex-1 truncate text-ink-mute">{asunto}</span>
        </div>
        <textarea autoComplete="off"
          name="texto"
          required
          rows={3}
          placeholder="Escribir un correo…"
          aria-label="Escribir correo"
          className="block w-full resize-none bg-transparent px-3 py-2.5 text-[13px] leading-relaxed text-ink outline-none placeholder:text-ink-faint"
        />
        <div className="flex justify-end border-t border-line px-3 py-2">
          <button
            type="submit"
            disabled={enviando}
            className="flex-none rounded-lg bg-ink px-3 py-1.5 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft disabled:pointer-events-none disabled:opacity-40"
          >
            {enviando ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </form>

      {estadoEnvio && !estadoEnvio.ok ? (
        <p role="alert" className="mt-2 text-[12px] text-bad">
          {estadoEnvio.error}
        </p>
      ) : null}
    </div>
  );
}
