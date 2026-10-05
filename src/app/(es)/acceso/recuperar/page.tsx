/* ==========================================================================
   "Olvidé mi contraseña": pide el correo y dispara el enlace de reinicio.

   El enlace lo manda Supabase por correo. Hoy el correo de Supabase gratis
   solo llega a miembros de la organización, así que para clientes esto
   funciona de verdad cuando se conecte un SMTP propio (Resend). Mientras
   tanto la pantalla responde igual — no delata si un correo existe o no —
   y el enlace simplemente no llega hasta que el correo esté configurado.
   ========================================================================== */
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoAcceso } from "../marco";
import { FormRecuperar } from "./form-recuperar";

export const metadata: Metadata = {
  title: "Recuperar contraseña · Panel Hoshizora",
  robots: { index: false, follow: false },
};

export default function RecuperarPage() {
  return (
    <MarcoAcceso
      titulo="Recuperar tu contraseña"
      descripcion="Poné tu correo y te mandamos un enlace para crear una nueva."
    >
      <FormRecuperar />
      <p className="mt-6 text-center text-[12px] text-ink-faint">
        <Link href="/acceso" className="underline underline-offset-2 hover:text-ink-mute">
          Volver al inicio de sesión
        </Link>
      </p>
    </MarcoAcceso>
  );
}
