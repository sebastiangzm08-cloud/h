/* ==========================================================================
   Cerrar sesión. Es un enlace normal en la barra (`/panel/salir`), así que
   entra por GET: borra la sesión de Supabase (y con ella las cookies) y
   manda a la puerta.
   ========================================================================== */
import { NextResponse, type NextRequest } from "next/server";
import { supabaseServidor } from "@/lib/supabase/servidor";

export async function GET(req: NextRequest) {
  const supabase = await supabaseServidor();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/acceso", req.url));
}
