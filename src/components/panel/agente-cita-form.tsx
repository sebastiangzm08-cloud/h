"use client";

/* ==========================================================================
   Agendar una cita A MANO — mismo patrón que `agente-recordatorio-form.tsx`
   (botón chico que se abre en un formulario). Dos entradas, un solo
   formulario compartido: desde una fila de Contactos (el contacto ya se
   sabe) o desde arriba de Citas (hay que elegirlo). El servidor valida
   horario/anticipación y reserva con la MISMA función que usa el bot — acá
   solo se junta la info y se manda.
   ========================================================================== */
import { useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";

const campo =
  "w-full rounded-lg border border-line-strong bg-surface-2 px-3 py-2 text-[13px] text-ink " +
  "placeholder:text-ink-faint outline-none transition-colors focus:border-ink-faint";

export type ServicioOpcion = { clave: string; monto: number | null; duracionMin: number | null };
export type ContactoOpcion = { id: string; nombre: string; telefono: string };

function textoServicio(s: ServicioOpcion) {
  const partes = [s.clave];
  if (s.duracionMin) partes.push(`${s.duracionMin} min`);
  if (s.monto) partes.push(`₡${s.monto.toLocaleString("es-CR")}`);
  else if (s.monto === 0) partes.push("gratis");
  return partes.join(" · ");
}

function CamposComunes({ servicios }: { servicios: ServicioOpcion[] }) {
  return (
    <>
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] text-ink-faint">Servicio</span>
        <select autoComplete="off" name="servicio" required defaultValue="" className={campo}>
          <option value="" disabled>
            Elegir…
          </option>
          {servicios.map((s) => (
            <option key={s.clave} value={s.clave}>
              {textoServicio(s)}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2.5">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-ink-faint">Fecha</span>
          <input autoComplete="off" type="date" name="fecha" required className={campo} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-ink-faint">Hora</span>
          <input autoComplete="off" type="time" name="hora" required step={900} className={campo} />
        </label>
      </div>
    </>
  );
}

function Resultado({ estado }: { estado: { ok: boolean; error?: string; mensaje?: string } | null }) {
  if (!estado) return null;
  if (!estado.ok) return <p className="text-[12px] text-bad">{estado.error}</p>;
  return <p className="text-[12px] text-ok">{estado.mensaje}</p>;
}

function FormularioCitaContacto({
  contactoId,
  nombre,
  servicios,
  onCerrar,
}: {
  contactoId: string;
  nombre: string;
  servicios: ServicioOpcion[];
  onCerrar: () => void;
}) {
  const [estado, agendar, agendando] = useAccionAgente("agendarCitaManual");

  return (
    <form action={agendar} className="flex flex-col gap-2.5 rounded-xl border border-line bg-surface-2/40 p-3">
      <input type="hidden" name="contactoId" value={contactoId} />
      <CampoToken />
      <p className="text-[11.5px] text-ink-faint">
        Cita para <span className="text-ink-soft">{nombre}</span>.
      </p>
      <CamposComunes servicios={servicios} />
      <Resultado estado={estado} />
      <div className="flex gap-2">
        {estado?.ok ? null : (
          <button
            type="submit"
            disabled={agendando}
            className="rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft disabled:pointer-events-none disabled:opacity-40"
          >
            {agendando ? "Agendando…" : "Agendar"}
          </button>
        )}
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-lg border border-line-strong px-3.5 py-2 text-[13px] text-ink-mute transition-colors hover:bg-surface-2"
        >
          {estado?.ok ? "Cerrar" : "Cancelar"}
        </button>
      </div>
    </form>
  );
}

/** Desde una fila de Contactos: el contacto ya está fijo, solo falta el resto. */
export function FormaAgendarCitaContacto({
  contactoId,
  nombre,
  servicios,
}: {
  contactoId: string;
  nombre: string;
  servicios: ServicioOpcion[];
}) {
  const [abierto, setAbierto] = useState(false);
  /* Cambia cada vez que se abre — fuerza a React a MONTAR un formulario
     nuevo (con su propio `useAccionAgente` recién nacido) en vez de reusar
     el que se quedó con el resultado de la última vez. Sin esto, cerrar
     después de agendar y volver a abrir se queda pegado en el mensaje de
     éxito anterior, sin dejar mandar una cita nueva. */
  const [vuelta, setVuelta] = useState(0);

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => {
          setVuelta((v) => v + 1);
          setAbierto(true);
        }}
        className="rounded-md border border-line-strong px-2 py-1 text-[11px] text-ink-mute transition-colors hover:bg-surface-2"
      >
        Agendar cita
      </button>
    );
  }

  return (
    <FormularioCitaContacto
      key={vuelta}
      contactoId={contactoId}
      nombre={nombre}
      servicios={servicios}
      onCerrar={() => setAbierto(false)}
    />
  );
}

function FormularioCitaNueva({
  contactos,
  servicios,
  onCerrar,
}: {
  contactos: ContactoOpcion[];
  servicios: ServicioOpcion[];
  onCerrar: () => void;
}) {
  const [estado, agendar, agendando] = useAccionAgente("agendarCitaManual");
  const [esNuevo, setEsNuevo] = useState(false);

  return (
    <form
      action={agendar}
      className="mb-4 flex flex-col gap-2.5 rounded-xl border border-line bg-surface-2/40 p-4"
    >
      <CampoToken />
      <p className="text-[12.5px] font-medium text-ink-soft">Agendar cita nueva</p>

      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setEsNuevo(false)}
          className={`rounded-md border px-2.5 py-1 text-[11.5px] transition-colors ${
            esNuevo ? "border-line-strong text-ink-mute hover:bg-surface-2" : "border-ink bg-ink text-paper"
          }`}
        >
          Ya escribió antes
        </button>
        <button
          type="button"
          onClick={() => setEsNuevo(true)}
          className={`rounded-md border px-2.5 py-1 text-[11.5px] transition-colors ${
            esNuevo ? "border-ink bg-ink text-paper" : "border-line-strong text-ink-mute hover:bg-surface-2"
          }`}
        >
          Número nuevo
        </button>
      </div>

      {esNuevo ? (
        <div className="grid grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-ink-faint">Número de WhatsApp</span>
            <input autoComplete="off"
              type="tel"
              name="telefonoNuevo"
              required
              placeholder="Con código de país, ej. 50688881234"
              className={campo}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-ink-faint">Nombre (opcional)</span>
            <input autoComplete="off" type="text" name="nombreNuevo" placeholder="Quién es" className={campo} />
          </label>
        </div>
      ) : (
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] text-ink-faint">Contacto</span>
          <select autoComplete="off" name="contactoId" required defaultValue="" className={campo}>
            <option value="" disabled>
              Elegir…
            </option>
            {contactos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre ? `${c.nombre} · ${c.telefono}` : c.telefono}
              </option>
            ))}
          </select>
        </label>
      )}

      <CamposComunes servicios={servicios} />
      <Resultado estado={estado} />
      <div className="flex gap-2">
        {estado?.ok ? null : (
          <button
            type="submit"
            disabled={agendando}
            className="rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft disabled:pointer-events-none disabled:opacity-40"
          >
            {agendando ? "Agendando…" : "Agendar"}
          </button>
        )}
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-lg border border-line-strong px-3.5 py-2 text-[13px] text-ink-mute transition-colors hover:bg-surface-2"
        >
          {estado?.ok ? "Cerrar" : "Cancelar"}
        </button>
      </div>
    </form>
  );
}

/** Desde arriba de Citas: hay que elegir el contacto también. */
export function BotonAgendarCita({
  contactos,
  servicios,
}: {
  contactos: ContactoOpcion[];
  servicios: ServicioOpcion[];
}) {
  const [abierto, setAbierto] = useState(false);
  const [vuelta, setVuelta] = useState(0);

  if (!abierto) {
    return (
      <div className="mb-4">
        <button
          type="button"
          onClick={() => {
            setVuelta((v) => v + 1);
            setAbierto(true);
          }}
          className="rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft"
        >
          + Agendar cita
        </button>
      </div>
    );
  }

  return (
    <FormularioCitaNueva
      key={vuelta}
      contactos={contactos}
      servicios={servicios}
      onCerrar={() => setAbierto(false)}
    />
  );
}
