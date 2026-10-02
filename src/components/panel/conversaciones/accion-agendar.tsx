"use client";

/* ==========================================================================
   Acción rápida: AGENDAR CITA.

   Usa la MISMA acción del servidor que ya usan Contactos y Agenda
   (`agendarCitaManual`, por `/api/agente/agendarCitaManual`): valida el
   horario del negocio, la anticipación y reserva con la misma función
   atómica que usa el agente, así que nunca se pasa de la capacidad. No se
   reutilizó el formulario de `agente-cita-form.tsx` porque ese lleva su
   propio botón de apertura y campos a 13 px (en iPhone, tocar un campo a
   menos de 16 px hace zoom).

   OJO, y está dicho en pantalla: al agendar, el cliente recibe la
   confirmación por WhatsApp (lo hace la acción del servidor).

   Independiente: no sabe de las otras acciones. Para quitarla basta borrar
   su línea en `acciones-rapidas.tsx`.
   ========================================================================== */
import { useState } from "react";
import { Icono } from "@/components/panel/iconos";
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import { IconoChat } from "./iconos-chat";
import { ChipAccion } from "./chip-accion";
import { Hoja, useCerrarHoja } from "./hoja";
import { VacioHoja } from "./vacio-hoja";
import { duracionTexto, precioTexto } from "./textos";
import { cn } from "@/lib/utils";
import type { PropsAccion } from "./acciones-tipos";

const campo =
  "h-12 w-full min-w-0 rounded-xl border border-line-strong bg-surface-2 px-3 text-[16px] text-ink outline-none transition-colors focus:border-[var(--panel-acento)]";

function Formulario({ conversacion, datos }: Pick<PropsAccion, "conversacion" | "datos">) {
  const cerrar = useCerrarHoja();
  const [resultado, agendar, agendando] = useAccionAgente("agendarCitaManual");

  if (resultado?.ok) {
    /* La cita SÍ quedó, pero el aviso por WhatsApp puede haber fallado: la
       acción lo marca con `avisoFallido`. Eso no se pinta de verde. */
    const conAviso = Boolean(resultado.avisoFallido);
    return (
      <div className="flex flex-col gap-4 pt-1">
        <div
          role="status"
          className={cn(
            "flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-[13.5px] leading-snug",
            conAviso ? "border-warn/35 bg-warn/10 text-warn" : "border-ok/35 bg-ok/10 text-ok"
          )}
        >
          <IconoChat nombre="check" className="mt-0.5 h-4 w-4 flex-none" />
          <p>{resultado.mensaje}</p>
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        agendar(new FormData(e.currentTarget));
      }}
      className="flex flex-col gap-3.5 pt-1"
    >
      <input type="hidden" name="contactoId" value={conversacion.contactoId} />
      <CampoToken />

      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] text-ink-mute">Servicio</span>
        <select autoComplete="off" name="servicio" required defaultValue="" className={campo}>
          <option value="" disabled>
            Elegir…
          </option>
          {datos.servicios.map((s) => (
            <option key={s.clave} value={s.clave}>
              {[s.clave, duracionTexto(s.duracionMin), precioTexto(s.monto)].filter(Boolean).join(" · ")}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-[12px] text-ink-mute">Fecha</span>
          <input autoComplete="off" type="date" name="fecha" required min={datos.hoy} className={campo} />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-[12px] text-ink-mute">Hora</span>
          <input autoComplete="off" type="time" name="hora" required step={900} className={campo} />
        </label>
      </div>

      <p className="flex items-start gap-2 text-[12.5px] leading-snug text-ink-mute">
        <Icono nombre="mensajes" className="mt-0.5 h-3.5 w-3.5 flex-none" />
        <span>
          Al agendar, le intentamos mandar la confirmación por WhatsApp. Si pasaron más de 24 h desde su último mensaje, puede que no llegue y te avisamos para que le escribas vos. Se valida contra tu horario y los cupos de la agenda.
        </span>
      </p>

      {resultado && !resultado.ok ? (
        <p role="alert" className="rounded-xl bg-bad/10 px-3.5 py-2.5 text-[13px] leading-snug text-bad">
          {resultado.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={agendando}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--panel-acento)_82%,black)] text-[14px] font-medium text-white transition-[transform,opacity] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
      >
        {agendando ? "Agendando…" : "Agendar cita"}
      </button>
    </form>
  );
}

export function AccionAgendar({ conversacion, datos }: PropsAccion) {
  const [abierta, setAbierta] = useState(false);

  return (
    <>
      <ChipAccion icono={<Icono nombre="calendario" className="h-[18px] w-[18px]" />} onClick={() => setAbierta(true)}>
        Agendar cita
      </ChipAccion>

      <Hoja
        abierta={abierta}
        onCerrar={() => setAbierta(false)}
        titulo="Agendar cita"
        descripcion={`Para ${conversacion.nombre}`}
      >
        {datos.servicios.length === 0 ? (
          <VacioHoja
            texto="Para agendar hace falta al menos un servicio cargado (con su duración). Agregalo en Conocimiento."
            href="/panel/agente/que-sabe"
            enlace="Ir a Conocimiento"
          />
        ) : (
          <Formulario conversacion={conversacion} datos={datos} />
        )}
      </Hoja>
    </>
  );
}
