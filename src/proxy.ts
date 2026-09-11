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

   Acá NO se decide quién entra: el portón sigue siendo el layout del panel
   (`(panel)/layout.tsx`), que corre en Node y valida el perfil. Este archivo
   sólo mantiene la sesión viva.
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
  return respuesta;
}

export const config = {
  /* Sólo donde importa la sesión. Nada de estáticos ni imágenes. */
  matcher: ["/panel/:path*", "/acceso/:path*", "/acceso"],
};
