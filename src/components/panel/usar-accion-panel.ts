"use client";

/* ==========================================================================
   Mismo hook que `useAccionAgente`, apuntando a `/api/panel/[nombre]` (las
   acciones genéricas del cliente). Ver el comentario grande de
   `usar-accion-admin.ts` para el porqué del `router.refresh()`.

   Si la acción sale bien y trae `destino`, lleva al navegador ahí en vez de
   solo refrescar (un Route Handler no puede hacer `redirect()` como lo hacía
   el Server Action).
   ========================================================================== */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ResultadoPanel } from "@/lib/panel/panel-acciones";

export function useAccionPanelCliente(
  nombre: string
): [ResultadoPanel | null, (form: FormData) => void, boolean] {
  const router = useRouter();
  const [estado, setEstado] = useState<ResultadoPanel | null>(null);
  const [pendiente, iniciar] = useTransition();

  function ejecutar(form: FormData) {
    iniciar(async () => {
      let resultado: ResultadoPanel;
      try {
        const res = await fetch(`/api/panel/${nombre}`, {
          method: "POST",
          body: form,
          credentials: "same-origin",
        });
        resultado = (await res.json()) as ResultadoPanel;
      } catch {
        resultado = { ok: false, error: "No se pudo conectar con el servidor. Probá de nuevo." };
      }
      setEstado(resultado);
      if (resultado.ok && resultado.destino) router.push(resultado.destino);
      else router.refresh();
    });
  }

  return [estado, ejecutar, pendiente];
}
