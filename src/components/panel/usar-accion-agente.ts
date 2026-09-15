"use client";

/* ==========================================================================
   Mismo hook que `useAccionAdmin`, apuntando a `/api/agente/[nombre]` en vez
   de `/api/admin`. Ver el comentario grande de ese archivo para el porqué
   del `router.refresh()`.
   ========================================================================== */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ResultadoAccion } from "@/lib/panel/agente-acciones";

export function useAccionAgente(
  nombre: string
): [ResultadoAccion | null, (form: FormData) => void, boolean] {
  const router = useRouter();
  const [estado, setEstado] = useState<ResultadoAccion | null>(null);
  const [pendiente, iniciar] = useTransition();

  function ejecutar(form: FormData) {
    iniciar(async () => {
      try {
        const res = await fetch(`/api/agente/${nombre}`, {
          method: "POST",
          body: form,
          credentials: "same-origin",
        });
        const datos = (await res.json()) as ResultadoAccion;
        setEstado(datos);
      } catch {
        setEstado({ ok: false, error: "No se pudo conectar con el servidor. Probá de nuevo." });
      } finally {
        router.refresh();
      }
    });
  }

  return [estado, ejecutar, pendiente];
}
