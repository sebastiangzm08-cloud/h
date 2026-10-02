"use client";

/* ==========================================================================
   Quién atiende ESTA conversación — en el encabezado del chat.

   Mismas acciones de siempre (`tomarControl` / `devolverAgente`, la pausa
   por conversación que se hizo en la Fase 2), ahora con etiquetas claras:

   - "Transferir a humano": la IA deja de contestar en este chat y contestás
     vos. (Es `tomarControl`: pone la conversación en "humano".)
   - "Tomar la conversación": lo mismo, cuando la IA ya se había detenido
     porque necesitaba a una persona.
   - "Devolver a la IA": la IA vuelve a contestar.

   Celular (Fase 3, 2026-09-30): el encabezado solo lleva una píldora corta
   ("IA", "Vos", "Pendiente") que abre una hoja inferior con la explicación y
   un botón grande de 48 px. Desde 768 px se suma el botón directo.

   Si el agente COMPLETO está en pausa (Automatizaciones), "Devolver a la IA"
   no puede prenderlo: se avisa y se enlaza a donde se reactiva.
   ========================================================================== */
import { useState } from "react";
import Link from "next/link";
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import { Hoja, useCerrarHoja } from "@/components/panel/conversaciones/hoja";
import { IconoChat } from "@/components/panel/conversaciones/iconos-chat";
import { cn } from "@/lib/utils";
import type { ConversacionAgente } from "@/lib/panel/agente";

type Tono = "ok" | "warn" | "idle";

function describir(estado: ConversacionAgente["estado"], agentePausado: boolean) {
  if (estado === "humano")
    return {
      corto: "Vos",
      largo: "Atendés vos",
      detalle: "Estás contestando vos. La IA no responde en este chat.",
      tono: "idle" as Tono,
    };
  if (estado === "espera")
    return {
      corto: "Pendiente",
      largo: "Espera a una persona",
      detalle: "La IA se detuvo y necesita que alguien conteste.",
      tono: "warn" as Tono,
    };
  if (agentePausado)
    return {
      corto: "Pausa",
      largo: "IA en pausa",
      detalle: "La IA está en pausa para todos los chats.",
      tono: "warn" as Tono,
    };
  return {
    corto: "IA",
    largo: "Atiende la IA",
    detalle: "La IA está contestando los mensajes de este cliente.",
    tono: "ok" as Tono,
  };
}

/** Qué botón corresponde según quién tiene el turno. */
function accionPara(estado: ConversacionAgente["estado"]) {
  if (estado === "humano")
    return {
      nombre: "devolverAgente",
      boton: "Devolver a la IA",
      ayuda: "La IA vuelve a contestar los mensajes nuevos de este cliente.",
    };
  if (estado === "espera")
    return {
      nombre: "tomarControl",
      boton: "Tomar la conversación",
      ayuda: "La IA ya se detuvo. Al tomarla, contestás vos y la IA se queda callada hasta que se la devolvás.",
    };
  return {
    nombre: "tomarControl",
    boton: "Transferir a humano",
    ayuda: "La IA deja de contestar en este chat y contestás vos desde la caja de abajo.",
  };
}

const CLASES_TONO: Record<Tono, string> = {
  ok: "border-ok/35 bg-ok/10 text-ok",
  warn: "border-warn/40 bg-warn/10 text-warn",
  idle: "border-line-strong bg-surface-2 text-ink-mute",
};
const CLASES_PUNTO: Record<Tono, string> = { ok: "bg-ok", warn: "bg-warn", idle: "bg-ink-faint" };

/** El botón de un toque (desde 768 px). Cada uno con su propio estado. */
function BotonDirecto({
  conversacion,
  bloqueado,
}: {
  conversacion: ConversacionAgente;
  bloqueado: boolean;
}) {
  const accion = accionPara(conversacion.estado);
  const [resultado, ejecutar, trabajando] = useAccionAgente(accion.nombre);
  const [descartado, setDescartado] = useState<unknown>(null);
  const error = resultado && !resultado.ok && resultado !== descartado ? resultado.error : null;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        ejecutar(new FormData(e.currentTarget));
      }}
      className="relative hidden md:block"
    >
      <input type="hidden" name="conversacionId" value={conversacion.id} />
      <CampoToken />
      <button
        type="submit"
        disabled={trabajando || bloqueado}
        title={accion.ayuda}
        className="inline-flex h-9 items-center rounded-lg border border-line-strong bg-surface-2 px-3 text-[12.5px] font-medium whitespace-nowrap text-ink-soft transition-colors hover:border-[var(--panel-acento-borde)] hover:bg-[var(--panel-acento-fondo)] active:bg-[var(--panel-acento-fondo)] disabled:pointer-events-none disabled:opacity-50"
      >
        {trabajando ? "Un momento…" : accion.boton}
      </button>
      {error ? (
        <button
          type="button"
          role="alert"
          onClick={() => setDescartado(resultado)}
          className="absolute top-full right-0 z-20 mt-1.5 w-72 rounded-xl border border-bad/30 bg-surface p-3 text-left text-[12.5px] leading-snug text-bad shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)]"
        >
          {error}
          <span className="mt-1 block text-[11px] text-ink-mute">Tocá para cerrar</span>
        </button>
      ) : null}
    </form>
  );
}

/** Contenido de la hoja. Se monta al abrir, así cada vez arranca limpio. */
function PanelControl({
  conversacion,
  agentePausado,
}: {
  conversacion: ConversacionAgente;
  agentePausado: boolean;
}) {
  const cerrar = useCerrarHoja();
  const estado = describir(conversacion.estado, agentePausado);
  const accion = accionPara(conversacion.estado);
  const [resTomar, tomar, tomando] = useAccionAgente("tomarControl");
  const [resDevolver, devolver, devolviendo] = useAccionAgente("devolverAgente");
  const esDevolver = accion.nombre === "devolverAgente";
  const ejecutar = esDevolver ? devolver : tomar;
  const trabajando = tomando || devolviendo;
  /* Devolver a la IA no sirve si el agente completo está apagado. */
  const bloqueado = agentePausado && esDevolver;
  /* Si la IA se detuvo esperando a una persona, también se le puede devolver
     la conversación sin contestar vos (antes se podía: no se pierde). */
  const secundaria = conversacion.estado === "espera";
  const hayExito = (resTomar?.ok ? resTomar : null) ?? (resDevolver?.ok ? resDevolver : null);

  if (hayExito) {
    return (
      <div className="flex flex-col gap-4 pt-1">
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-ok/35 bg-ok/10 px-4 py-3.5 text-[13.5px] leading-snug text-ok">
          <IconoChat nombre="check" className="mt-0.5 h-4 w-4 flex-none" />
          <p>{hayExito.mensaje}</p>
        </div>
        <button
          type="button"
          onClick={cerrar}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-line-strong text-[14px] font-medium text-ink-soft transition-colors hover:bg-surface-2 active:bg-surface-3"
        >
          Listo
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 pt-1">
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2 px-3.5 py-3">
        <span
          className={cn("grid h-10 w-10 flex-none place-items-center rounded-full border", CLASES_TONO[estado.tono])}
        >
          <IconoChat nombre={conversacion.estado === "humano" ? "persona" : "chispa"} className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-ink">{estado.largo}</p>
          <p className="mt-0.5 text-[12.5px] leading-snug text-ink-mute">{estado.detalle}</p>
        </div>
      </div>

      {conversacion.estado === "espera" && conversacion.motivoEspera ? (
        <p className="rounded-xl bg-warn/[0.08] px-3.5 py-2.5 text-[12.5px] leading-snug text-warn">
          <span className="font-medium">Por qué se detuvo: </span>
          {conversacion.motivoEspera}
        </p>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ejecutar(new FormData(e.currentTarget));
        }}
        className="flex flex-col gap-2"
      >
        <input type="hidden" name="conversacionId" value={conversacion.id} />
        <CampoToken />
        <button
          type="submit"
          disabled={trabajando || bloqueado}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--panel-acento)_82%,black)] text-[14px] font-medium text-white transition-[transform,opacity] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
        >
          {trabajando ? "Un momento…" : accion.boton}
        </button>
        <p className="text-[12.5px] leading-snug text-ink-mute">
          {bloqueado ? "Primero hay que reactivar la IA: ahora está en pausa para todos los chats." : accion.ayuda}
        </p>
      </form>

      {secundaria ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            devolver(new FormData(e.currentTarget));
          }}
          className="flex flex-col gap-2"
        >
          <input type="hidden" name="conversacionId" value={conversacion.id} />
          <CampoToken />
          <button
            type="submit"
            disabled={trabajando || agentePausado}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-line-strong text-[14px] font-medium text-ink-soft transition-colors hover:bg-surface-2 active:bg-surface-3 disabled:pointer-events-none disabled:opacity-50"
          >
            Devolver a la IA
          </button>
          <p className="text-[12.5px] leading-snug text-ink-mute">
            {agentePausado
              ? "Primero hay que reactivar la IA: ahora está en pausa para todos los chats."
              : "Si ya no hace falta una persona, la IA retoma la conversación."}
          </p>
        </form>
      ) : null}

      {agentePausado ? (
        <Link
          href="/panel/automatizaciones/agente-whatsapp"
          className="inline-flex h-11 items-center self-start text-[13px] text-ink-mute underline underline-offset-2 hover:text-ink"
        >
          Reactivar la IA
        </Link>
      ) : null}

      {[resTomar, resDevolver].find((r) => r && !r.ok) ? (
        <p role="alert" className="rounded-xl bg-bad/10 px-3.5 py-2.5 text-[13px] leading-snug text-bad">
          {(() => {
            const r = [resTomar, resDevolver].find((x) => x && !x.ok);
            return r && !r.ok ? r.error : "";
          })()}
        </p>
      ) : null}
    </div>
  );
}

export function ControlConversacion({
  conversacion,
  agentePausado,
}: {
  conversacion: ConversacionAgente;
  agentePausado: boolean;
}) {
  const [abierta, setAbierta] = useState(false);
  const estado = describir(conversacion.estado, agentePausado);

  return (
    <div className="ml-auto flex flex-none items-center gap-1.5">
      <button
        type="button"
        onClick={() => setAbierta(true)}
        aria-haspopup="dialog"
        aria-label={`Quién atiende este chat: ${estado.largo}. Abrir opciones`}
        className="group inline-flex h-11 items-center"
      >
        <span
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-full border pr-2 pl-2.5 text-[12px] font-medium whitespace-nowrap transition-[transform,background-color] group-active:scale-[0.96]",
            CLASES_TONO[estado.tono]
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", CLASES_PUNTO[estado.tono])} />
          <span className="sm:hidden">{estado.corto}</span>
          <span className="hidden sm:inline">{estado.largo}</span>
          <IconoChat nombre="chevronAbajo" className="h-3.5 w-3.5 opacity-70" />
        </span>
      </button>

      <BotonDirecto
        key={conversacion.estado}
        conversacion={conversacion}
        bloqueado={agentePausado && conversacion.estado === "humano"}
      />

      <Hoja
        abierta={abierta}
        onCerrar={() => setAbierta(false)}
        titulo="Quién atiende este chat"
        descripcion={`${conversacion.nombre} · WhatsApp`}
      >
        <PanelControl conversacion={conversacion} agentePausado={agentePausado} />
      </Hoja>
    </div>
  );
}
