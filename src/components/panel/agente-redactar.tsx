"use client";

/* ==========================================================================
   La caja de responder de "Conversaciones" — de verdad, ya conectada.
   Tomar el control / devolvérselo al agente vive en el menú ⋮ del
   encabezado (`agente-control-chat.tsx`, 2026-09-27).
   ========================================================================== */
import { useRef } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import type { ConversacionAgente } from "@/lib/panel/agente";

export function Redactar({ conversacion }: { conversacion: ConversacionAgente }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [estadoEnvio, enviar, enviando] = useAccionAgente("enviarMensajeManual");

  function alEnviar(form: FormData) {
    enviar(form);
    formRef.current?.reset();
  }

  /* Quién atiende la conversación ya no va acá: es la etiqueta y el menú ⋮
     del encabezado (`ControlConversacion`). Antes este bloque ocupaba media
     pantalla en celular. */
  return (
    <div className="border-t border-line bg-surface px-3 py-2.5 sm:px-5 sm:py-3">
      <form
        ref={formRef}
        action={alEnviar}
        className="flex items-center gap-2.5 rounded-[9px] border border-line-strong bg-surface-2 px-3 py-2 focus-within:border-line-strong"
      >
        <input type="hidden" name="conversacionId" value={conversacion.id} />
        <CampoToken />
        <input autoComplete="off"
          type="text"
          name="texto"
          required
          placeholder="Escribir un mensaje…"
          aria-label="Escribir mensaje"
          className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-faint sm:text-[13px]"
        />
        <button
          type="submit"
          disabled={enviando}
          className="flex-none rounded-lg bg-ink px-3 py-1.5 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft disabled:pointer-events-none disabled:opacity-40"
        >
          {enviando ? "Enviando…" : "Enviar"}
        </button>
      </form>

      {estadoEnvio && !estadoEnvio.ok ? (
        <p role="alert" className="mt-2 text-[12px] text-bad">
          {estadoEnvio.error}
        </p>
      ) : null}
    </div>
  );
}
