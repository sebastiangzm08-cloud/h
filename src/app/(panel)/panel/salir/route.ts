/* ==========================================================================
   Cerrar sesión. Es un `<form method="post">` en la barra (`shell.tsx`), NO
   un `<Link>`: cerrar sesión cambia estado, y un `GET` con ese efecto se
   puede disparar SOLO — Next precarga los enlaces que están a la vista, y
   este botón está siempre visible en la barra. Con `POST` nada lo dispara
   sin un clic real.

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

export async function POST() {
  const supabase = await supabaseServidor();
  await supabase.auth.signOut();

  return new NextResponse(null, {
    status: 303,
    headers: { Location: "/acceso" },
  });
}
