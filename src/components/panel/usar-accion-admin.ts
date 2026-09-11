"use client";

/* ==========================================================================
   Reemplazo de `useActionState` para las acciones del admin.

   Antes cada formulario hacía `useActionState(crearCuentaCliente, null)`
   contra un Server Action. Ahora las acciones son rutas normales
   (`/api/admin/[nombre]`) — ver el porqué en el comentario grande de
   `admin-acciones.ts`. Este hook imita la forma de `useActionState`
   ([estado, ejecutar, pendiente]) para que los formularios casi no cambien:
   sólo se reemplaza el import y esta línea, el resto del JSX queda igual.

   OJO con el `router.refresh()` — no es cosmético, arregla un bug real:
   un Server Action le avisa AUTOMÁTICAMENTE al navegador qué páginas
   cambiaron (viaja pegado a la respuesta de la acción); un `fetch()` normal
   a una ruta NO tiene ese aviso. `revalidatePath()` en el servidor limpia
   SU caché, pero sin este refresh el navegador puede seguir mostrando una
   página ya visitada (o pre-cargada por el `<Link>` de la barra lateral)
   con los datos viejos — ej.: crear un cliente y que la lista de Clientes
   se siga viendo en 0 hasta forzar una recarga a mano.
   ========================================================================== */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ResultadoAccion } from "@/lib/panel/admin-acciones";

export function useAccionAdmin(
  nombre: string
): [ResultadoAccion | null, (form: FormData) => void, boolean] {
  const router = useRouter();
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
      } finally {
        // Siempre, no sólo si `ok`: `revalidatePath()` ya corrió del lado
        // del servidor aunque la acción haya fallado por otra razón, y esto
        // no le cuesta nada a una acción que no cambió datos.
        router.refresh();
      }
    });
  }

  return [estado, ejecutar, pendiente];
}
