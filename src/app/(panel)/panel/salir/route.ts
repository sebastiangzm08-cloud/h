/* ==========================================================================
   Cerrar sesión. Es un enlace normal en la barra (`/panel/salir`), así que
   entra por GET: borra la sesión de Supabase (y con ella las cookies) y
   manda a la puerta.

   OJO con la redirección: NO usar `NextResponse.redirect(new URL(..., req.url))`.
   Detrás de un proxy (Traefik en el VPS), `req.url` trae el host INTERNO
   (`https://localhost:3000/...`), así que el navegador terminaba yendo a
   `https://localhost:3000/acceso` — una dirección muerta. Resultado: no se
   podía llegar a la pantalla de acceso para volver a entrar.

   Una `Location` RELATIVA es HTTP válido y el navegador la resuelve contra el
   dominio real, sea cual sea. No hay que adivinar el host.
   ========================================================================== */
import { NextResponse } from "next/server";
import { supabaseServidor } from "@/lib/supabase/servidor";

export async function GET() {
  const supabase = await supabaseServidor();
  await supabase.auth.signOut();

  return new NextResponse(null, {
    status: 307,
    headers: { Location: "/acceso" },
  });
}
