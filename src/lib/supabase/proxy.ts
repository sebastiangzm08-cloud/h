/* ==========================================================================
   Sesión en el borde: se llama desde `src/proxy.ts` en cada petición al
   panel.

   IMPORTANTE — el proxy NO llama a Supabase ni renueva la sesión.

   Renovar acá (el middleware corre en el edge de Netlify) compite con el
   cliente del navegador: al refrescar, el refresh token rota, pero la
   cookie nueva no siempre vuelve al navegador → la siguiente navegación
   manda un token ya usado, Supabase la rechaza y rebota a /acceso en CADA
   clic. El navegador mantiene el token fresco solo. Acá sólo miramos si la
   cookie de sesión existe y no está muerta; la validación de verdad la hace
   `(panel)/layout.tsx` en el servidor (Node), donde sí se puede sin romper.
   ========================================================================== */
import { NextResponse, type NextRequest } from "next/server";

export async function pasarSesion(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const haySesion = cookieDeSesionViva(req);

  if (pathname.startsWith("/panel") && !haySesion) {
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

  return NextResponse.next({ request: req });
}

/* ¿Hay cookie de sesión de Supabase y su access token todavía sirve?
   Todo local, sin red. `@supabase/ssr` guarda la sesión en
   `sb-<ref>-auth-token`, a veces partida en `.0` / `.1`, y el valor puede
   venir como JSON o con prefijo `base64-`. Si no se entiende el formato,
   se asume que NO hay sesión (mejor mandar a /acceso que hacer un bucle). */
function cookieDeSesionViva(req: NextRequest): boolean {
  const trozos = req.cookies
    .getAll()
    .filter((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (trozos.length === 0) return false;

  let raw = trozos.map((c) => c.value).join("");
  try {
    if (raw.startsWith("base64-")) raw = atob(raw.slice("base64-".length));
    const sesion = JSON.parse(raw);
    const exp = sesion?.expires_at;
    if (typeof exp !== "number") return false;
    // Vencido hace más de 30 días → muerta. Si no, que lo resuelva el
    // servidor (o el navegador, que refresca solo mientras la pestaña vive).
    return exp * 1000 > Date.now() - 30 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}
