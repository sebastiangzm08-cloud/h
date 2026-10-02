"use client";

/* ==========================================================================
   Envío de un formulario del admin que NO pierde lo escrito si falla.

   Con `<form action={…}>` React 19 limpia los campos sin controlar cuando la
   acción termina, salga bien o mal. En un formulario de ocho campos eso
   significa volver a escribir todo porque el correo ya existía. Acá el envío
   se hace con `onSubmit`: el navegador sigue validando (`required`,
   `minLength`, `type="email"`) antes de disparar el evento, el formulario se
   manda al mismo `useAccionAdmin` de siempre, y los campos solo se limpian
   cuando la acción SALIÓ BIEN.

   Limpiar es tocar el DOM (`form.reset()`), no el estado de React, así que
   no hay efectos que llamen a `setState`.
   ========================================================================== */
import { useEffect, useRef, type FormEvent } from "react";
import type { ResultadoAccion } from "@/lib/panel/admin-acciones";

export function useEnvio(
  estado: ResultadoAccion | null,
  ejecutar: (form: FormData) => void,
  opciones: {
    /** Limpiar los campos cuando la acción sale bien. Por defecto sí. */
    limpiarSiOk?: boolean;
    /** Para hacer algo propio justo antes de mandar (ej. recordar un campo). */
    alEnviar?: (form: FormData) => void;
  } = {}
) {
  const { limpiarSiOk = true, alEnviar } = opciones;
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (limpiarSiOk && estado?.ok) ref.current?.reset();
  }, [estado, limpiarSiOk]);

  return {
    ref,
    /* Si alguien envía antes de que la página termine de cargar (el JavaScript
       todavía no engancha el `onSubmit`), el navegador haría un GET con todos
       los campos en la URL — contraseñas incluidas. Con POST, en el peor caso
       no pasa nada, pero nada queda en la URL. */
    method: "post" as const,
    onSubmit: (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const datos = new FormData(e.currentTarget);
      alEnviar?.(datos);
      ejecutar(datos);
    },
  };
}
