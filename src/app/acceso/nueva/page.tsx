/* ==========================================================================
   La pantalla a la que lleva el enlace del correo de reinicio. El enlace
   trae un código de un solo uso: el cliente del navegador lo canjea por una
   sesión temporal y, con eso, deja poner la contraseña nueva.
   ========================================================================== */
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoAcceso } from "../marco";
import { FormNueva } from "./form-nueva";

export const metadata: Metadata = {
  title: "Nueva contraseña · Panel Hoshizora",
  robots: { index: false, follow: false },
};

export default function NuevaPage() {
  return (
    <MarcoAcceso titulo="Elegí tu nueva contraseña">
      <FormNueva />
      <p className="mt-6 text-center text-[12px] text-ink-faint">
        <Link href="/acceso" className="underline underline-offset-2 hover:text-ink-mute">
          Volver al inicio de sesión
        </Link>
      </p>
    </MarcoAcceso>
  );
}
