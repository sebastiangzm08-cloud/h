"use client";

import { useAccionAdmin } from "@/components/panel/usar-accion-admin";
import { CampoToken } from "@/components/panel/campo-token";
import { BTN_CHICO_SECUNDARIO, MensajeAccion } from "@/components/admin/admin-ui";

export function BotonCerrarConsulta({ mensajeId }: { mensajeId: string }) {
  const [estado, ejecutar, pendiente] = useAccionAdmin("cerrarConsulta");

  return (
    <form action={ejecutar} className="flex flex-col items-stretch gap-2 sm:items-end">
      <CampoToken />
      <input type="hidden" name="mensajeId" value={mensajeId} />
      <button type="submit" disabled={pendiente || estado?.ok === true} className={BTN_CHICO_SECUNDARIO}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-4 w-4"
        >
          <path d="m5 12 5 5 9-9" />
        </svg>
        {pendiente ? "Cerrando…" : estado?.ok ? "Cerrada" : "Marcar resuelta"}
      </button>
      {estado && !estado.ok ? <MensajeAccion estado={estado} className="max-w-[300px]" /> : null}
    </form>
  );
}
