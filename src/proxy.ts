/* ==========================================================================
   Refresco de la sesión de Supabase — en Next 16 esto va en `proxy.ts`
   (antes se llamaba `middleware.ts`).

   POR QUÉ EXISTE (no borrarlo otra vez):
   El token de acceso de Supabase dura una hora. Quien lo renueva tiene que
   ESCRIBIR la cookie nueva, y un Server Component NO puede escribir cookies
   (por eso el `setAll` de `servidor.ts` tiene un try/catch vacío). Sin este
   archivo nadie renueva nada: al vencer el token, `@supabase/ssr` da la
   sesión por inválida y BORRA la cookie (`maxAge: 0`). A partir de ahí el
   panel sigue viéndose por la caché del router, pero cada request nueva
   llega sin sesión — y los Server Actions del admin devuelven
   "No autorizado." aunque en pantalla parezcas logueado.

   TAMBIÉN DECIDE QUIÉN ENTRA (desde 2026-09-17 — antes NO, ver el porqué):
   Antes esto lo hacía SOLO el layout del panel, con `redirect()` dentro de
   un Server Component. Eso choca con un bug real y confirmado de Next.js
   16.2.11–16.3.4 (seguía sin arreglar en 16.3.5 — issues #97329 y #98345 de
   vercel/next.js): cuando un `<Link>`, un `router.refresh()` o un
   `router.replace()` apunta a una ruta que un Server Component redirige
   con `redirect()`, el router del navegador entra en un bucle infinito de
   peticiones `_rsc=...` que nunca se resuelve solo — se confirmó en vivo
   (cientos de peticiones por segundo, pantalla en negro permanente, tanto
   en cuenta admin como cliente). Un redirect HTTP normal (el que hace este
   archivo con `NextResponse.redirect`) NO dispara ese bug: el navegador lo
   sigue por su cuenta, sin pasar por el mecanismo de RSC que está roto.

   El layout (`(panel)/layout.tsx`) TODAVÍA tiene sus propios `redirect()`
   como red de seguridad por si este archivo fallara (ej. la consulta a
   `perfiles` de acá abajo error), pero en el camino normal ya no deberían
   dispararse — este archivo redirige antes de que la petición llegue ahí.
   ========================================================================== */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Sin llaves no hay nada que refrescar; dejamos pasar en vez de romper.
  if (!url || !anon) {
    console.error(
      `[proxy] SIN LLAVES (url=${!!url} anon=${!!anon}) — no puedo refrescar`
    );
    respuesta.headers.set("x-pathname", request.nextUrl.pathname);
    return respuesta;
  }
  let escribio = 0;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(aEscribir) {
        /* CANDADO: el proxy sólo REFRESCA, nunca BORRA.

           `@supabase/ssr` pide borrar una cookie mandándola con el valor
           vacío y `maxAge: 0`. Si el proxy obedeciera eso, un fallo pasajero
           de `getUser()` (un blip de red al servidor de auth, una carrera
           justo después del login) dejaría al usuario sin sesión de forma
           permanente — y como el panel se sigue viendo por la caché del
           router, el síntoma es "No autorizado." sin explicación.

           Cerrar sesión de verdad se hace en `/panel/salir`, que sí borra. */
        const soloRefrescos = aEscribir.filter(
          ({ value, options }) => value !== "" && options?.maxAge !== 0
        );
        const borradosIgnorados = aEscribir.length - soloRefrescos.length;
        if (borradosIgnorados > 0) {
          console.error(
            `[proxy] IGNORÉ ${borradosIgnorados} borrado(s) de cookie en ${request.nextUrl.pathname}`
          );
        }
        if (soloRefrescos.length === 0) return;

        // 1. Que el resto de la request ya vea la cookie nueva.
        for (const { name, value } of soloRefrescos) {
          request.cookies.set(name, value);
        }
        // 2. Y que el navegador se la guarde.
        respuesta = NextResponse.next({ request });
        for (const { name, value, options } of soloRefrescos) {
          respuesta.cookies.set(name, value, options);
        }
        escribio = soloRefrescos.length;
      },
    },
  });

  // Esta llamada es la que renueva el token si hace falta. No se le quita el
  // `await` ni se cambia por `getSession()`: `getUser()` valida contra
  // Supabase y dispara el refresco.
  const { data, error } = await supabase.auth.getUser();

  console.error(
    `[proxy] ${request.method} ${request.nextUrl.pathname} · cookies entrada: ${request.cookies
      .getAll()
      .map((c) => c.name)
      .join("|") || "NINGUNA"} · user: ${data?.user?.id ?? "no"} · error: ${
      error?.message ?? "no"
    } · cookies escritas: ${escribio}`
  );

  respuesta.headers.set("x-pathname", request.nextUrl.pathname);

  // Redirecciones reales de HTTP — ver el comentario grande de arriba sobre
  // por qué esto ya NO se hace con `redirect()` en el layout.
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/panel")) {
    if (!data?.user) {
      return conCookiesDe(respuesta, new URL("/acceso", request.url));
    }
    if (!pathname.startsWith("/panel/admin")) {
      // Solo se consulta el rol cuando hace falta decidir esto — no en
      // cada request al panel, para no sumar una consulta de más siempre.
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", data.user.id)
        .maybeSingle();
      if (perfil?.rol === "admin") {
        return conCookiesDe(respuesta, new URL("/panel/admin", request.url));
      }
    }
  }

  return respuesta;
}

/** Copia las cookies (nuevas o refrescadas) de una respuesta a otra — un
    redirect es una respuesta DISTINTA, y sin esto el refresco de sesión de
    arriba se perdería en el mismo request que decide redirigir. */
function conCookiesDe(base: NextResponse, destino: URL) {
  const redireccion = NextResponse.redirect(destino);
  for (const cookie of base.cookies.getAll()) {
    redireccion.cookies.set(cookie);
  }
  return redireccion;
}

export const config = {
  /* Sólo donde importa la sesión. Nada de estáticos ni imágenes. */
  matcher: ["/panel/:path*", "/acceso/:path*", "/acceso"],
};
