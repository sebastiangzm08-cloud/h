/* ==========================================================================
   Sesión en el borde: se llama desde `src/proxy.ts` en cada petición al
   panel.

   Hace dos cosas:
   1. Renueva el token si está por vencer y reescribe las cookies. Esto es
      lo que un Server Component NO puede hacer, y por eso el proxy existe.
   2. Si no hay sesión y la ruta es del panel, manda a /acceso.

   Regla de oro del SSR de Supabase: entre crear el cliente y devolver la
   respuesta NO puede pasar nada más. Cualquier lógica en el medio puede
   dejar al usuario deslogueado de formas imposibles de depurar.
   ========================================================================== */
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON, SUPABASE_URL } from "./entorno";

export async function pasarSesion(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(SUPABASE_URL(), SUPABASE_ANON(), {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll(cookies) {
        for (const { name, value } of cookies) {
          req.cookies.set(name, value);
        }
        res = NextResponse.next({ request: req });
        for (const { name, value, options } of cookies) {
          res.cookies.set(name, value, options);
        }
      },
    },
  });

  // Valida la sesión contra el servidor de Supabase y, si hace falta, la
  // renueva antes de responder. `getUser()` es el patrón oficial para
  // middleware — más robusto en el edge/serverless que `getClaims()`.
  const { data } = await supabase.auth.getUser();
  const haySesion = Boolean(data?.user);

  const { pathname } = req.nextUrl;
  const esPanel = pathname.startsWith("/panel");

  if (esPanel && !haySesion) {
    const url = req.nextUrl.clone();
    url.pathname = "/acceso";
    url.searchParams.set("volver", pathname); // para devolverlo a donde iba
    return NextResponse.redirect(url);
  }

  // Ya con sesión, /acceso no tiene sentido: al panel.
  if (pathname === "/acceso" && haySesion) {
    const url = req.nextUrl.clone();
    url.pathname = "/panel";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return res;
}
