"use client";

/* ==========================================================================
   Mismo flujo que `useAccionAgente` (POST a `/api/agente/[nombre]` y
   `router.refresh()` al terminar), con dos agregados que las pantallas de
   Conocimiento y Configuración necesitan:

   - `alTerminar`: avisa con el resultado en cuanto llega, para que el
     formulario pueda cerrarse SOLO si salió bien. Antes se cerraba antes de
     saber, y un error quedaba invisible dentro de un formulario ya cerrado.
   - `useAvisoTemporal`: el "Guardado" verde se apaga solo a los pocos
     segundos en vez de quedarse pegado para siempre.

   El endpoint, el cuerpo y las acciones son exactamente los mismos.
   ========================================================================== */
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ResultadoAccion } from "@/lib/panel/agente-acciones";

export function useAccionPanel(
  nombre: string,
  alTerminar?: (resultado: ResultadoAccion) => void
): [ResultadoAccion | null, (form: FormData) => void, boolean, () => void] {
  const router = useRouter();
  const [estado, setEstado] = useState<ResultadoAccion | null>(null);
  const [pendiente, iniciar] = useTransition();

  function ejecutar(form: FormData) {
    iniciar(async () => {
      let resultado: ResultadoAccion;
      try {
        const res = await fetch(`/api/agente/${nombre}`, {
          method: "POST",
          body: form,
          credentials: "same-origin",
        });
        resultado = (await res.json()) as ResultadoAccion;
      } catch {
        resultado = { ok: false, error: "No se pudo conectar con el servidor. Probá de nuevo." };
      }
      setEstado(resultado);
      alTerminar?.(resultado);
      router.refresh();
    });
  }

  /* Borra el último resultado: al reabrir un formulario no debe verse el
     error (o el "Guardado") de la vez anterior. */
  const limpiar = () => setEstado(null);

  return [estado, ejecutar, pendiente, limpiar];
}

/**
 * El texto de éxito de una acción, durante unos segundos. Devuelve `null`
 * cuando no hay nada que mostrar (no se ha guardado, falló, o ya pasó el
 * tiempo). Cada resultado nuevo vuelve a encender el aviso.
 */
export function useAvisoTemporal(estado: ResultadoAccion | null, ms = 4000): string | null {
  const [apagado, setApagado] = useState<ResultadoAccion | null>(null);

  useEffect(() => {
    if (!estado?.ok) return;
    const t = setTimeout(() => setApagado(estado), ms);
    return () => clearTimeout(t);
  }, [estado, ms]);

  return estado?.ok && apagado !== estado ? estado.mensaje : null;
}
