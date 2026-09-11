/* ==========================================================================
   Iniciar sesión — DEL LADO DEL SERVIDOR.

   POR QUÉ ACÁ Y NO EN EL NAVEGADOR (no volver atrás sin leer esto):
   Antes el login lo hacía `supabaseNavegador().auth.signInWithPassword()`, y
   la cookie de sesión la escribía el navegador con `document.cookie`. En el
   VPS esa cookie NO sobrevivía: se perdía apenas cambiabas de página, el
   panel se seguía viendo por la caché del router, y toda request nueva
   llegaba sin sesión → los Server Actions del admin daban "No autorizado."

   Se comprobó con la ruta de diagnóstico que ese mismo navegador SÍ guarda
   y devuelve una cookie de 2600 bytes cuando la escribe el SERVIDOR con
   `Set-Cookie`. Así que el login se hace acá: `supabaseServidor()` valida
   las credenciales y su adaptador de cookies escribe la sesión en la
   respuesta. Un Route Handler sí puede escribir cookies (un Server
   Component no).

   Devuelve sólo `{ ok }` o `{ ok:false, code }` — nunca el token.
   ========================================================================== */
import { NextResponse } from "next/server";
import { supabaseServidor } from "@/lib/supabase/servidor";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let correo = "";
  let clave = "";
  try {
    const cuerpo = await req.json();
    correo = String(cuerpo?.correo ?? "").trim();
    clave = String(cuerpo?.clave ?? "");
  } catch {
    return NextResponse.json({ ok: false, code: "cuerpo_invalido" }, { status: 400 });
  }

  if (!correo || !clave) {
    return NextResponse.json({ ok: false, code: "faltan_datos" }, { status: 400 });
  }

  const supabase = await supabaseServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: clave,
  });

  if (error) {
    // El `code` estable de Supabase; el texto se traduce en el formulario.
    return NextResponse.json(
      { ok: false, code: error.code ?? "", mensaje: error.message },
      { status: 401, headers: { "cache-control": "no-store" } }
    );
  }

  // Sin error, el adaptador de `supabaseServidor()` ya dejó la cookie de
  // sesión en esta respuesta.
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
