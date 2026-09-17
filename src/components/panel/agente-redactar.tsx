"use client";

/* ==========================================================================
   La caja de responder de "Conversaciones" — de verdad, ya conectada.

   Tres acciones, tres formularios chiquitos (no uno solo): mandar un
   mensaje, tomar el control, devolvérselo al agente. Cada una define su
   propio `_token` porque `useAccionAgente` dispara un fetch aparte por
   acción — no hace falta compartir estado entre las tres.
   ========================================================================== */
import { useRef } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import { cn } from "@/lib/utils";
import { relativa } from "@/lib/panel/agente-formato";
import type { ConversacionAgente } from "@/lib/panel/agente";

export function Redactar({ conversacion }: { conversacion: ConversacionAgente }) {
  const enPausa = conversacion.estado === "espera" || conversacion.estado === "humano";
  const formRef = useRef<HTMLFormElement>(null);

  const [estadoEnvio, enviar, enviando] = useAccionAgente("enviarMensajeManual");
  const [, tomar, tomando] = useAccionAgente("tomarControl");
  const [, devolver, devolviendo] = useAccionAgente("devolverAgente");

  function alEnviar(form: FormData) {
    enviar(form);
    formRef.current?.reset();
  }

  return (
    <div className="border-t border-line bg-surface px-5 py-3">
      {/* Apilado siempre (texto arriba, botón abajo), no en la misma fila.
          Se probó como una sola fila con flex-wrap y `flex-1` para que el
          texto ocupara lo que sobraba: no funciona, porque `flex-1` pone
          `flex-basis: 0%`, y con basis 0 el ítem SIEMPRE "cabe" (puede
          encogerse hasta nada), así que flex-wrap nunca ve un desborde y
          nunca manda el botón a su propia línea — el texto terminaba
          angostado a una palabra por renglón en cualquier ventana que no
          fuera bien ancha. Apilar de una vez es más simple y no depende de
          adivinar en qué ancho exacto se rompe. */}
      <div className="mb-2.5 flex flex-col gap-1.5 text-xs text-ink-mute">
        <span className="flex items-center gap-2.5">
          <span className={cn("h-1.5 w-1.5 flex-none rounded-full", enPausa ? "bg-warn" : "bg-ok")} />
          <span>
            {conversacion.estado === "espera"
              ? "El agente está en pausa acá. Si respondés vos, se queda callado hasta que se lo devuelvas."
              : conversacion.estado === "humano"
                ? `Tomaste esta conversación ${relativa(conversacion.ultimoEn)}. El agente no responde acá.`
                : "El agente está atendiendo esta conversación."}
          </span>
        </span>
        {enPausa ? (
          <form action={devolver}>
            <input type="hidden" name="conversacionId" value={conversacion.id} />
            <CampoToken />
            <button
              type="submit"
              disabled={devolviendo}
              className="rounded-lg border border-line-strong px-3 py-1.5 text-[13px] text-ink-mute transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-50"
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
              className="rounded-lg border border-line-strong px-3 py-1.5 text-[13px] text-ink-mute transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {tomando ? "…" : "Tomar el control"}
            </button>
          </form>
        )}
      </div>

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
          className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint"
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
