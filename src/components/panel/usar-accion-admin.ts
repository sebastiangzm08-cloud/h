"use client";

/* ==========================================================================
   Reemplazo de `useActionState` para las acciones del admin.

   Antes cada formulario hacía `useActionState(crearCuentaCliente, null)`
   contra un Server Action. Ahora las acciones son rutas normales
   (`/api/admin/[nombre]`) — ver el porqué en el comentario grande de
   `admin-acciones.ts`. Este hook imita la forma de `useActionState`
   ([estado, ejecutar, pendiente]) para que los formularios casi no cambien:
   sólo se reemplaza el import y esta línea, el resto del JSX queda igual.
   ========================================================================== */
import { useState, useTransition } from "react";
import type { ResultadoAccion } from "@/lib/panel/admin-acciones";

export function useAccionAdmin(
  nombre: string
): [ResultadoAccion | null, (form: FormData) => void, boolean] {
  const [estado, setEstado] = useState<ResultadoAccion | null>(null);
  const [pendiente, iniciar] = useTransition();

  function ejecutar(form: FormData) {
    iniciar(async () => {
      try {
        const res = await fetch(`/api/admin/${nombre}`, {
          method: "POST",
          body: form,
          credentials: "same-origin",
        });
        const datos = (await res.json()) as ResultadoAccion;
        setEstado(datos);
      } catch {
        setEstado({
          ok: false,
          error: "No se pudo conectar con el servidor. Probá de nuevo.",
        });
      }
    });
  }

  return [estado, ejecutar, pendiente];
}
