/* ==========================================================================
   Firma un permiso de subida a ImageKit para el navegador.

   Exige sesión: sin login no se reparten firmas. No devuelve la llave
   privada — solo el token/expire/signature de un uso y la llave pública,
   que es pública por diseño.
   ========================================================================== */
import { NextResponse } from "next/server";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { firmarSubida, imagekitConfigurado } from "@/lib/imagekit";

export async function GET() {
  const supabase = await supabaseServidor();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }

  if (!imagekitConfigurado()) {
    return NextResponse.json(
      { error: "El almacenamiento de archivos todavía no está configurado." },
      { status: 503 }
    );
  }

  // Nunca cachear una firma: es de un solo uso.
  return NextResponse.json(firmarSubida(), {
    headers: { "Cache-Control": "no-store" },
  });
}
