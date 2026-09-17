"use client";

/* ==========================================================================
   Acciones de una fila de "Citas". Cancelar de verdad avisa al paciente por
   WhatsApp — es lo que la pantalla ya prometía en su descripción. Solo se
   muestran en citas que todavía pueden cambiar de estado.
   ========================================================================== */
import { useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";

const campo =
  "h-8 rounded-md border border-line-strong bg-surface-2 px-2 text-[12px] text-ink " +
  "outline-none transition-colors focus:border-ink-faint";

export function AccionesCita({ citaId, estado }: { citaId: string; estado: string }) {
  const [estadoCancelar, cancelar, cancelando] = useAccionAgente("cancelarCita");
  const [estadoCumplida, cumplir, cumpliendo] = useAccionAgente("marcarCitaCumplida");
  const [reagendando, setReagendando] = useState(false);

  if (estado !== "confirmada" && estado !== "sin_confirmar") return null;

  const error = (estadoCancelar && !estadoCancelar.ok && estadoCancelar.error) ||
    (estadoCumplida && !estadoCumplida.ok && estadoCumplida.error) || null;

  if (reagendando) {
    return <FormaReagendar citaId={citaId} onCerrar={() => setReagendando(false)} />;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex justify-end gap-1.5">
        <button
          type="button"
          onClick={() => setReagendando(true)}
          disabled={cancelando || cumpliendo}
          className="rounded-md border border-line-strong px-2 py-1 text-[11.5px] text-ink-mute transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-40"
        >
          Reagendar
        </button>
        <form action={cumplir}>
          <input type="hidden" name="citaId" value={citaId} />
          <CampoToken />
          <button
            type="submit"
            disabled={cancelando || cumpliendo}
            className="rounded-md border border-line-strong px-2 py-1 text-[11.5px] text-ink-mute transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-40"
          >
            {cumpliendo ? "…" : "Marcar cumplida"}
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
            disabled={cancelando || cumpliendo}
            className="rounded-md border border-line-strong px-2 py-1 text-[11.5px] text-bad transition-colors hover:bg-bad/10 disabled:pointer-events-none disabled:opacity-40"
          >
            {cancelando ? "…" : "Cancelar"}
          </button>
        </form>
      </div>
      {error ? <p className="text-[11px] text-bad">{error}</p> : null}
    </div>
  );
}

/** Cancela la cita vieja y reserva la nueva en un solo paso — antes "mover"
    una cita era en realidad crear una aparte y dejar la original viva,
    duplicándolas (bug real encontrado por Sebastián, 2026-09-16). */
function FormaReagendar({ citaId, onCerrar }: { citaId: string; onCerrar: () => void }) {
  const [estado, reagendar, reagendando] = useAccionAgente("reagendarCita");

  if (estado?.ok) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <p className="text-[11.5px] text-ok">{estado.mensaje}</p>
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-md border border-line-strong px-2 py-1 text-[11.5px] text-ink-mute transition-colors hover:bg-surface-2"
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <form action={reagendar} className="flex flex-col items-end gap-1.5">
      <input type="hidden" name="citaId" value={citaId} />
      <CampoToken />
      <div className="flex items-center gap-1.5">
        <input type="date" name="fecha" required className={campo} />
        <input type="time" name="hora" required step={900} className={campo} />
        <button
          type="submit"
          disabled={reagendando}
          className="rounded-md bg-ink px-2.5 py-1 text-[11.5px] font-medium text-paper transition-colors hover:bg-ink-soft disabled:pointer-events-none disabled:opacity-40"
        >
          {reagendando ? "…" : "Mover"}
        </button>
        <button
          type="button"
          onClick={onCerrar}
          disabled={reagendando}
          className="rounded-md border border-line-strong px-2 py-1 text-[11.5px] text-ink-mute transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-40"
        >
          Cancelar
        </button>
      </div>
      {estado && !estado.ok ? <p className="text-[11px] text-bad">{estado.error}</p> : null}
    </form>
  );
}
