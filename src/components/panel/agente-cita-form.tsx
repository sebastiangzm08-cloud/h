"use client";

/* ==========================================================================
   Agendar una cita A MANO. Regla de Sebastian: todo lo que hace el bot, se
   puede hacer también a mano. Dos entradas, mismo formulario de fondo:
   desde una fila de Clientes (el contacto ya se sabe) o desde arriba de
   Agenda (hay que elegirlo, o escribir un número nuevo).

   El servidor valida horario, anticipación y cupo, y reserva con la MISMA
   función que usa el bot (`wa_reservar_cita`) — acá solo se junta la info y
   se manda. Desde la Fase 4a los formularios viven dentro de una hoja modal
   (`HojaModal`): quien la abre decide cuándo montarla, y cada apertura es un
   formulario nuevo, sin el mensaje de éxito de la vez anterior.
   ========================================================================== */
import { useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import {
  BotonesFormulario,
  CLASE_INPUT,
  Campo,
  enviarSinBorrar,
  MensajeResultado,
} from "@/components/panel/clientes/formulario";
import { HojaModal } from "@/components/panel/clientes/hoja-modal";
import { BOTON, BOTON_BASE } from "@/components/panel/clientes/piezas";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import { cn } from "@/lib/utils";

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
      <Campo etiqueta="Servicio">
        <select autoComplete="off" name="servicio" required defaultValue="" className={CLASE_INPUT}>
          <option value="" disabled>
            Elegir…
          </option>
          {servicios.map((s) => (
            <option key={s.clave} value={s.clave}>
              {textoServicio(s)}
            </option>
          ))}
        </select>
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Fecha">
          <input autoComplete="off" type="date" name="fecha" required className={CLASE_INPUT} />
        </Campo>
        <Campo etiqueta="Hora">
          <input autoComplete="off" type="time" name="hora" required step={900} className={CLASE_INPUT} />
        </Campo>
      </div>
    </>
  );
}

/** Desde una fila de Clientes: el contacto ya está fijo, solo falta el resto. */
export function FormularioCitaContacto({
  contactoId,
  servicios,
  onCerrar,
}: {
  contactoId: string;
  servicios: ServicioOpcion[];
  onCerrar: () => void;
}) {
  const [estado, agendar, agendando] = useAccionAgente("agendarCitaManual");

  return (
    <form onSubmit={enviarSinBorrar(agendar)} className="flex flex-col gap-3.5">
      <input type="hidden" name="contactoId" value={contactoId} />
      <CampoToken />
      <CamposComunes servicios={servicios} />
      <MensajeResultado estado={estado} />
      <BotonesFormulario
        ok={Boolean(estado?.ok)}
        pendiente={agendando}
        textoEnviar="Agendar"
        textoPendiente="Agendando…"
        onCerrar={onCerrar}
      />
    </form>
  );
}

/** Desde arriba de Agenda: hay que elegir el contacto también. */
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
    <form onSubmit={enviarSinBorrar(agendar)} className="flex flex-col gap-3.5">
      <CampoToken />

      <div
        role="group"
        aria-label="De quién es la cita"
        className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface-2 p-1"
      >
        {[
          { nuevo: false, texto: "Ya escribió antes" },
          { nuevo: true, texto: "Número nuevo" },
        ].map((op) => (
          <button
            key={op.texto}
            type="button"
            aria-pressed={esNuevo === op.nuevo}
            onClick={() => setEsNuevo(op.nuevo)}
            className={cn(
              "min-h-10 rounded-lg px-2 text-[13px] font-medium transition-colors",
              esNuevo === op.nuevo ? "bg-ink text-paper" : "text-ink-mute hover:text-ink"
            )}
          >
            {op.texto}
          </button>
        ))}
      </div>

      {esNuevo ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Número de WhatsApp" ayuda="Con código de país, ej. 50688881234">
            <input
              autoComplete="off"
              type="tel"
              inputMode="tel"
              name="telefonoNuevo"
              required
              placeholder="50688881234"
              className={CLASE_INPUT}
            />
          </Campo>
          <Campo etiqueta="Nombre (opcional)">
            <input autoComplete="off" type="text" name="nombreNuevo" placeholder="Quién es" className={CLASE_INPUT} />
          </Campo>
        </div>
      ) : (
        <Campo etiqueta="Contacto">
          <select autoComplete="off" name="contactoId" required defaultValue="" className={CLASE_INPUT}>
            <option value="" disabled>
              Elegir…
            </option>
            {contactos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre ? `${c.nombre} · ${c.telefono}` : c.telefono}
              </option>
            ))}
          </select>
        </Campo>
      )}

      <CamposComunes servicios={servicios} />
      <MensajeResultado estado={estado} />
      <BotonesFormulario
        ok={Boolean(estado?.ok)}
        pendiente={agendando}
        textoEnviar="Agendar"
        textoPendiente="Agendando…"
        onCerrar={onCerrar}
      />
    </form>
  );
}

/** El botón "+ Agendar cita" de arriba de Agenda; abre la hoja con el formulario. */
export function BotonAgendarCita({
  contactos,
  servicios,
  className,
}: {
  contactos: ContactoOpcion[];
  servicios: ServicioOpcion[];
  className?: string;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setAbierto(true)}
        className={cn(BOTON_BASE, BOTON.primario, "min-h-11 rounded-xl px-4 text-[13.5px] sm:min-h-10", className)}
      >
        <span aria-hidden="true" className="text-[17px] leading-none">
          +
        </span>
        Agendar cita
      </button>

      {abierto ? (
        <HojaModal
          titulo="Agendar cita nueva"
          descripcion="Se revisan el horario y los cupos igual que cuando agenda el agente."
          onCerrar={() => setAbierto(false)}
        >
          <FormularioCitaNueva contactos={contactos} servicios={servicios} onCerrar={() => setAbierto(false)} />
        </HojaModal>
      ) : null}
    </>
  );
}
