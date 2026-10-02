"use client";

/* Indicador de carga dentro de un <Link>: al cambiar el período del embudo la
   pantalla se vuelve a armar en el servidor y tarda un momento; sin esto el
   toque no mostraba nada. Lleva `role="status"` para lectores de pantalla. */
import { useLinkStatus } from "next/link";

export function CargaEnlace() {
  const { pending } = useLinkStatus();
  return (
    <span role="status" className="ml-2 inline-flex h-3 w-3 flex-none items-center justify-center">
      {pending ? (
        <>
          <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" aria-hidden="true" />
          <span className="sr-only">Cargando el período…</span>
        </>
      ) : null}
    </span>
  );
}
