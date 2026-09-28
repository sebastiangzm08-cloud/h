"use client";

/* ==========================================================================
   Interruptor del Agente de WhatsApp COMPLETO (Automatizaciones, Fase 2).

   - Pausar pide confirmación ahí mismo (el visor nunca muestra confirm()):
     apagarlo sin querer deja a los pacientes sin respuesta de noche.
   - Reactivar es directo.
   - Si Hoshizora suspendió el servicio (falta de pago), el interruptor queda
     bloqueado y dice por qué: eso solo lo reactiva el admin.
   La pausa es real: el workflow la lee antes de contestar (2026-09-27).
   ========================================================================== */
import { useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import { cn } from "@/lib/utils";

export function InterruptorAgente({
  activo,
  suspendido = false,
  conEtiqueta = true,
}: {
  activo: boolean;
  suspendido?: boolean;
  conEtiqueta?: boolean;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [resPausa, pausar, pausando] = useAccionAgente("pausarAgente");
  const [resActivar, reactivar, activando] = useAccionAgente("reactivarAgente");
  const trabajando = pausando || activando;
  const error = [resPausa, resActivar].find((r) => r && !r.ok);

  const encendido = activo && !suspendido;
  return (
    <div className="relative flex flex-col items-end gap-1">
      <form action={encendido ? undefined : reactivar} className="flex items-center gap-2.5">
        <CampoToken />
        {conEtiqueta ? (
          <span className={cn("text-[12px] whitespace-nowrap", encendido ? "text-ok" : "text-warn")}>
            {suspendido ? "Suspendido" : encendido ? "Activo" : "En pausa"}
          </span>
        ) : null}
        <button
          type={encendido ? "button" : "submit"}
          onClick={encendido ? () => setConfirmando(true) : undefined}
          role="switch"
          aria-checked={encendido}
          aria-label={encendido ? "Pausar el agente" : "Reactivar el agente"}
          disabled={trabajando || suspendido}
          title={suspendido ? "Tu servicio está suspendido: escribinos para reactivarlo." : undefined}
          className={cn(
            "relative h-8 w-[52px] flex-none rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            encendido ? "bg-[var(--panel-acento,#7c5cff)]" : "bg-line-strong"
          )}
        >
          <span
            className={cn(
              "absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200",
              encendido && "translate-x-5"
            )}
          />
        </button>
      </form>
      {/* Confirmación flotante debajo del interruptor: no empuja la fila
          (en celular una caja en línea desbordaba la pantalla). */}
      {confirmando && encendido ? (
        <div
          role="alertdialog"
          aria-label="Confirmar pausa del agente"
          className="absolute top-full right-0 z-30 mt-2 flex w-[min(300px,calc(100vw-48px))] flex-col gap-2.5 rounded-xl border border-warn/30 bg-surface p-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)]"
        >
          <p className="text-[12.5px] leading-snug text-ink">
            El agente va a dejar de responder a tus clientes. Los mensajes siguen llegando a
            Conversaciones para que los contestés vos.
          </p>
          <div className="flex gap-2">
            <form action={(f) => { pausar(f); setConfirmando(false); }}>
              <CampoToken />
              <button type="submit" disabled={trabajando} className="h-9 rounded-lg bg-warn px-3 text-[12.5px] font-medium text-paper disabled:opacity-50">
                Pausar agente
              </button>
            </form>
            <button type="button" onClick={() => setConfirmando(false)} className="h-9 rounded-lg border border-line-strong px-3 text-[12.5px] text-ink-mute hover:bg-surface-2">
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {error && !error.ok ? (
        <p role="alert" className="max-w-[260px] text-right text-[11.5px] text-bad">{error.error}</p>
      ) : null}
    </div>
  );
}
