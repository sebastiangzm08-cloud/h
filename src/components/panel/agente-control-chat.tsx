"use client";

/* ==========================================================================
   Quién atiende ESTA conversación — en el encabezado del chat.

   Antes era un bloque de texto + botón encima de la caja de escribir que en
   celular se comía media pantalla (pedido de Sebastian, 2026-09-27): ahora
   es una etiqueta chiquita (punto + quién atiende) y un menú ⋮ con un
   interruptor "El agente responde acá". Mismas acciones de siempre:
   `tomarControl` / `devolverAgente`.

   Si el agente COMPLETO está en pausa (Automatizaciones), el interruptor de
   la conversación no puede prenderlo: se avisa y se enlaza a donde se
   reactiva.
   ========================================================================== */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import { cn } from "@/lib/utils";
import type { ConversacionAgente } from "@/lib/panel/agente";

export function ControlConversacion({
  conversacion,
  agentePausado,
}: {
  conversacion: ConversacionAgente;
  agentePausado: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const [resTomar, tomar, tomando] = useAccionAgente("tomarControl");
  const [resDevolver, devolver, devolviendo] = useAccionAgente("devolverAgente");
  const trabajando = tomando || devolviendo;
  const error = [resTomar, resDevolver].find((r) => r && !r.ok);

  const atiendeAgente = conversacion.estado === "agente";
  const etiqueta = agentePausado
    ? { texto: "Agente en pausa", tono: "warn" as const }
    : conversacion.estado === "humano"
      ? { texto: "Atendés vos", tono: "idle" as const }
      : conversacion.estado === "espera"
        ? { texto: "Espera a una persona", tono: "warn" as const }
        : { texto: "Atiende el agente", tono: "ok" as const };

  /* Se cierra al tocar afuera o con Escape. */
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  return (
    <div ref={caja} className="relative ml-auto flex flex-none items-center gap-1.5">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] whitespace-nowrap",
          etiqueta.tono === "ok" && "border-ok/30 text-ok",
          etiqueta.tono === "warn" && "border-warn/30 text-warn",
          etiqueta.tono === "idle" && "border-line-strong text-ink-mute"
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            etiqueta.tono === "ok" ? "bg-ok" : etiqueta.tono === "warn" ? "bg-warn" : "bg-ink-faint"
          )}
        />
        <span className="max-sm:sr-only">{etiqueta.texto}</span>
      </span>

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="true"
        aria-label="Opciones de la conversación"
        className="grid h-9 w-9 place-items-center rounded-lg text-ink-mute transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="5" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="12" cy="19" r="1.7" />
        </svg>
      </button>

      {abierto ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-30 mt-1.5 w-[min(300px,calc(100vw-32px))] rounded-xl border border-line-strong bg-surface p-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)]"
        >
          <form action={atiendeAgente ? tomar : devolver} className="flex items-start gap-3">
            <input type="hidden" name="conversacionId" value={conversacion.id} />
            <CampoToken />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-ink">El agente responde acá</p>
              <p className="mt-0.5 text-[12px] leading-snug text-ink-faint">
                {agentePausado
                  ? "El agente está en pausa para todas las conversaciones."
                  : atiendeAgente
                    ? "Apagalo si querés contestar vos esta conversación."
                    : "Prendelo para que el agente vuelva a contestar acá."}
              </p>
            </div>
            <button
              type="submit"
              role="switch"
              aria-checked={atiendeAgente && !agentePausado}
              disabled={trabajando || agentePausado}
              className={cn(
                "relative mt-0.5 h-6 w-11 flex-none rounded-full transition-colors disabled:opacity-50",
                atiendeAgente && !agentePausado ? "bg-[var(--panel-acento,#7c5cff)]" : "bg-line-strong"
              )}
            >
              <span className="sr-only">El agente responde en esta conversación</span>
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  atiendeAgente && !agentePausado && "translate-x-5"
                )}
              />
            </button>
          </form>

          {conversacion.estado === "espera" && conversacion.motivoEspera ? (
            <p className="mt-2.5 rounded-lg bg-warn/[0.08] px-2.5 py-2 text-[12px] leading-snug text-warn">
              {conversacion.motivoEspera}
            </p>
          ) : null}

          {agentePausado ? (
            <Link
              href="/panel/automatizaciones/agente-whatsapp"
              className="mt-2.5 inline-flex text-[12px] text-ink-mute underline underline-offset-2 hover:text-ink"
            >
              Reactivar el agente
            </Link>
          ) : null}

          {error ? (
            <p role="alert" className="mt-2 text-[12px] text-bad">
              {error.ok ? "" : error.error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
