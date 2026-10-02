"use client";

/* ==========================================================================
   Panel que se abre y se cierra, atado al resultado de su acción.

   Antes, "Editar datos" y "Cambiar el precio" se cerraban EN EL MOMENTO de
   enviar. Si la acción fallaba, el formulario ya no estaba y el error nunca
   se veía: parecía que había guardado. Ahora se queda abierto hasta que la
   acción responde: con error sigue ahí mostrándolo; con éxito se cierra y
   deja el mensaje de listo.

   Sin efectos: todo se deriva del `estado` que ya devuelve `useAccionAdmin`.
   `base` guarda el resultado que había al abrir, para que un "listo" viejo
   no cierre el panel apenas se vuelve a abrir.
   ========================================================================== */
import { useState } from "react";
import type { ResultadoAccion } from "@/lib/panel/admin-acciones";

export function useDesplegable(estado: ResultadoAccion | null) {
  const [abierto, setAbierto] = useState(false);
  const [base, setBase] = useState<ResultadoAccion | null>(null);

  const guardado = estado?.ok === true && estado !== base;

  return {
    /** ¿Se muestra el formulario? */
    visible: abierto && !guardado,
    /** Se acaba de guardar: mostrar el mensaje de éxito en lugar del formulario. */
    guardado: abierto && guardado,
    abrir: () => {
      setBase(estado);
      setAbierto(true);
    },
    cerrar: () => setAbierto(false),
  };
}
