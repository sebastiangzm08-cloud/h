"use client";

/* ==========================================================================
   Acciones de una cita de la Agenda: marcar cumplida, reagendar y cancelar.
   Cancelar (y reagendar) de verdad le avisan al paciente por WhatsApp — es lo
   que la pantalla ya prometía en su descripción. Solo se dibujan en citas que
   todavía pueden cambiar de estado (confirmada o sin confirmar).

   Se parte en dos piezas porque viven en lugares distintos de la fila
   (`agenda/fila-cita.tsx`): los botones van en la tarjeta, y el formulario de
   reagendar se abre en una hoja modal.
   ========================================================================== */
import { CampoToken } from "@/components/panel/campo-token";
import {
  BotonesFormulario,
  CLASE_INPUT,
  Campo,
  enviarSinBorrar,
  MensajeResultado,
} from "@/components/panel/clientes/formulario";
import { BOTON, BOTON_BASE, TAM_FILA_TRES } from "@/components/panel/clientes/piezas";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import { cn } from "@/lib/utils";

export function BotonesCita({
  citaId,
  pasada,
  nombre,
  onReagendar,
}: {
  citaId: string;
  /** La hora de la cita ya pasó: "Marcar cumplida" pasa a ser lo principal. */
  pasada: boolean;
  nombre: string;
  onReagendar: () => void;
}) {
  const [estadoCancelar, cancelar, cancelando] = useAccionAgente("cancelarCita");
  const [estadoCumplida, cumplir, cumpliendo] = useAccionAgente("marcarCitaCumplida");
  const ocupado = cancelando || cumpliendo;

  const error =
    (estadoCancelar && !estadoCancelar.ok && estadoCancelar.error) ||
    (estadoCumplida && !estadoCumplida.ok && estadoCumplida.error) ||
    null;

  return (
    <div className="flex flex-col gap-1.5 xl:items-end">
      <div className="grid grid-cols-3 gap-2 xl:flex xl:justify-end">
        <button
          type="button"
          onClick={onReagendar}
          disabled={ocupado}
          aria-haspopup="dialog"
          aria-label={`Reagendar la cita de ${nombre}`}
          className={cn(BOTON_BASE, BOTON.secundario, TAM_FILA_TRES)}
        >
          Reagendar
        </button>

        <form action={cumplir}>
          <input type="hidden" name="citaId" value={citaId} />
          <CampoToken />
          <button
            type="submit"
            disabled={ocupado}
            aria-label={`Marcar cumplida la cita de ${nombre}`}
            className={cn(
              BOTON_BASE,
              TAM_FILA_TRES,
              "w-full xl:w-auto",
              pasada ? BOTON.exito : BOTON.secundario
            )}
          >
            {cumpliendo ? (
              "…"
            ) : (
              <>
                <span className="sm:hidden">Cumplida</span>
                <span className="hidden sm:inline">Marcar cumplida</span>
              </>
            )}
          </button>
        </form>

        <form
          action={cancelar}
          onSubmit={(e) => {
            if (!confirm("¿Cancelar esta cita? Se le avisa al paciente por WhatsApp.")) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="citaId" value={citaId} />
          <CampoToken />
          <button
            type="submit"
            disabled={ocupado}
            aria-label={`Cancelar la cita de ${nombre}`}
            className={cn(BOTON_BASE, BOTON.peligro, TAM_FILA_TRES, "w-full xl:w-auto")}
          >
            {cancelando ? "…" : "Cancelar"}
          </button>
        </form>
      </div>
      {error ? (
        <p role="alert" className="text-[12px] leading-snug text-bad">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Cancela la cita vieja y reserva la nueva en un solo paso — antes "mover"
    una cita era en realidad crear una aparte y dejar la original viva,
    duplicándolas (bug real encontrado por Sebastian, 2026-09-16). Si el
    horario nuevo no tiene cupo, la original queda como estaba. */
export function FormaReagendar({ citaId, onCerrar }: { citaId: string; onCerrar: () => void }) {
  const [estado, reagendar, reagendando] = useAccionAgente("reagendarCita");

  return (
    <form onSubmit={enviarSinBorrar(reagendar)} className="flex flex-col gap-3.5">
      <input type="hidden" name="citaId" value={citaId} />
      <CampoToken />
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Nueva fecha">
          <input autoComplete="off" type="date" name="fecha" required className={CLASE_INPUT} />
        </Campo>
        <Campo etiqueta="Nueva hora">
          <input autoComplete="off" type="time" name="hora" required step={900} className={CLASE_INPUT} />
        </Campo>
      </div>
      <p className="text-[12px] leading-snug text-ink-faint">
        Si el horario nuevo no tiene cupo, la cita original queda como estaba.
      </p>
      <MensajeResultado estado={estado} />
      <BotonesFormulario
        ok={Boolean(estado?.ok)}
        pendiente={reagendando}
        textoEnviar="Mover cita"
        textoPendiente="Moviendo…"
        onCerrar={onCerrar}
      />
    </form>
  );
}
