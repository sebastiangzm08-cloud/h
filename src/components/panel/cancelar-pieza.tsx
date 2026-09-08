"use client";

/* ==========================================================================
   Botón para cancelar una pieza de la fila. Sólo aparece mientras todavía
   se puede frenar (en fila / mejorándose / programada).
   ========================================================================== */
import { useActionState } from "react";
import {
  cancelarPieza,
  type ResultadoContenido,
} from "@/lib/panel/contenido-acciones";
import type { EstadoPieza } from "@/lib/panel/tipos";

const CANCELABLES: EstadoPieza[] = ["pendiente", "en_retoque", "programada"];

export function CancelarPieza({
  piezaId,
  estado,
}: {
  piezaId: string;
  estado: EstadoPieza;
}) {
  const [res, ejecutar, pendiente] = useActionState<
    ResultadoContenido | null,
    FormData
  >(cancelarPieza, null);

  if (!CANCELABLES.includes(estado)) return null;
  if (res?.ok) return null; // la pieza desaparece de la galería al revalidar

  return (
    <form action={ejecutar} className="contents">
      <input type="hidden" name="piezaId" value={piezaId} />
      <button
        type="submit"
        disabled={pendiente}
        className="font-mono text-[10px] text-ink-faint underline decoration-line-strong underline-offset-2 transition-colors hover:text-bad disabled:opacity-50"
      >
        {pendiente ? "…" : "Cancelar"}
      </button>
      {res && !res.ok ? (
        <span className="text-[10px] text-bad">{res.error}</span>
      ) : null}
    </form>
  );
}
