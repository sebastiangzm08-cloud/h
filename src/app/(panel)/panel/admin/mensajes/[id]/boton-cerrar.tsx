"use client";

import { useAccionAdmin } from "@/components/panel/usar-accion-admin";
import { CampoToken } from "@/components/panel/campo-token";

export function BotonCerrarConsulta({ mensajeId }: { mensajeId: string }) {
  const [estado, ejecutar, pendiente] = useAccionAdmin("cerrarConsulta");

  return (
    <form action={ejecutar}>
      <CampoToken />
      <input type="hidden" name="mensajeId" value={mensajeId} />
      <button
        type="submit"
        disabled={pendiente}
        className="text-[12px] text-ink-mute transition-colors hover:text-ink disabled:opacity-50"
      >
        {pendiente ? "…" : estado?.ok ? "Cerrada" : "Marcar resuelta"}
      </button>
    </form>
  );
}
