"use client";

import { useActionState } from "react";
import { cerrarConsulta, type ResultadoAccion } from "@/lib/panel/admin-acciones";
import { CampoToken } from "@/components/panel/campo-token";

export function BotonCerrarConsulta({ mensajeId }: { mensajeId: string }) {
  const [estado, ejecutar, pendiente] = useActionState<
    ResultadoAccion | null,
    FormData
  >(cerrarConsulta, null);

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
