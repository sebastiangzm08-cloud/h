"use client";

/* ==========================================================================
   Acciones de una fila de "Citas". Cancelar de verdad avisa al paciente por
   WhatsApp — es lo que la pantalla ya prometía en su descripción. Solo se
   muestran en citas que todavía pueden cambiar de estado.
   ========================================================================== */
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";

export function AccionesCita({ citaId, estado }: { citaId: string; estado: string }) {
  const [estadoCancelar, cancelar, cancelando] = useAccionAgente("cancelarCita");
  const [estadoCumplida, cumplir, cumpliendo] = useAccionAgente("marcarCitaCumplida");

  if (estado !== "confirmada" && estado !== "sin_confirmar") return null;

  const error = (estadoCancelar && !estadoCancelar.ok && estadoCancelar.error) ||
    (estadoCumplida && !estadoCumplida.ok && estadoCumplida.error) || null;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex justify-end gap-1.5">
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
