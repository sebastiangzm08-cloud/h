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

   `/panel/admin*` también se guarda ACÁ (no solo en `admin/layout.tsx`): quien
   no es admin vuelve a `/panel` con un redirect HTTP, y si la consulta del rol
   falla, tampoco entra (falla cerrado).
   ========================================================================== */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { CLAVE_IDIOMA, paresDeRutas, rutaEquivalente } from "@/lib/i18n";

/* ==========================================================================
   PÁGINAS PÚBLICAS (español) — idioma automático para visitantes de EE. UU.

   Las páginas públicas son estáticas: no pueden leer cabeceras. Pero el
   proxy sí. El país llega en una cabecera que agrega Cloudflare
   (`cf-ipcountry`; también se leen `x-vercel-ip-country` y `x-country`).
   Mientras Cloudflare no esté delante del sitio, ninguna cabecera llega y
   todo queda en español. NO se llama a ningún servicio externo de
   geolocalización: ningún dato del visitante sale del sitio. Esta rama corre
   ANTES y sin tocar Supabase: las páginas públicas no tienen sesión.
   ========================================================================== */
const CABECERAS_PAIS = ["cf-ipcountry", "x-vercel-ip-country", "x-country"];

/* CAMBIO AUTOMÁTICO DE IDIOMA (decisión de Sebastian, 2026-10-05): quien llega
   desde EE. UU. a una página pública en español entra directo a su
   equivalente en inglés, sin avisos ni botones. Reglas:
   - El país sale de la cabecera que agrega Cloudflare (`cf-ipcountry`); sin
     cabecera no se hace nada (todo queda en español).
   - Se respeta la elección previa (cookie `hz-idioma`) y `?lang=es|en`, que
     es la forma manual de corregir una detección equivocada.
   - Si el navegador tiene el español como idioma principal, NO se cambia:
     el público de EE. UU. que usa el sitio en español sigue en español.
   - Los rastreadores (Google, Bing, vistas previas de WhatsApp o redes) NUNCA
     se redirigen: Googlebot rastrea desde EE. UU. y perderíamos el español.
   - La redirección es temporal (307) y no se guarda en ninguna caché. */
const RASTREADORES =
  /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|preview|embedly|lighthouse|pagespeed|headless|ahrefs|semrush|curl|wget/i;
const UNA_VEZ_AL_AÑO = 60 * 60 * 24 * 365;

function idiomaPrincipalDelNavegador(request: NextRequest) {
  return (request.headers.get("accept-language") ?? "")
    .split(",")[0]
    .trim()
    .toLowerCase()
    .slice(0, 2);
}

function destinoEnIngles(ruta: string): string | null {
  const limpia = ruta.length > 1 ? ruta.replace(/\/+$/, "") : ruta;
  const hayPar = paresDeRutas.some((p) => p.es === limpia) || limpia === "/mis-herramientas";
  return hayPar ? rutaEquivalente(limpia, "en") : null;
}

function redirigir(request: NextRequest, a: string, idioma?: "es" | "en") {
  const destino = new URL(a, request.url);
  const respuesta = NextResponse.redirect(destino, 307);
  respuesta.headers.set("cache-control", "private, no-store");
  respuesta.headers.set("vary", "cookie, accept-language, cf-ipcountry");
  if (idioma) {
    respuesta.cookies.set(CLAVE_IDIOMA, idioma, {
      path: "/",
      maxAge: UNA_VEZ_AL_AÑO,
      sameSite: "lax",
    });
  }
  return respuesta;
}

function respuestaPublica(request: NextRequest) {
  const ruta = request.nextUrl.pathname;

  /* Forma manual de elegir idioma: /?lang=en  o  /planes?lang=es */
  const pedido = request.nextUrl.searchParams.get("lang");
  if (pedido === "en" || pedido === "es") {
    if (pedido === "en") {
      return redirigir(request, destinoEnIngles(ruta) ?? "/en", "en");
    }
    const limpia = new URL(request.url);
    limpia.searchParams.delete("lang");
    return redirigir(request, limpia.pathname + limpia.search, "es");
  }

  const yaEligio = request.cookies.get(CLAVE_IDIOMA)?.value;
  const esRastreador = RASTREADORES.test(request.headers.get("user-agent") ?? "");
  const esDeEeuu = CABECERAS_PAIS.some(
    (h) => request.headers.get(h)?.trim().toUpperCase() === "US"
  );
  const destino = destinoEnIngles(ruta);
  if (
    esDeEeuu &&
    !yaEligio &&
    !esRastreador &&
    destino &&
    idiomaPrincipalDelNavegador(request) !== "es"
  ) {
    return redirigir(request, destino, "en");
  }

  const respuesta = NextResponse.next();
  respuesta.headers.append("vary", "cookie, accept-language, cf-ipcountry");
  return respuesta;
}

export async function proxy(request: NextRequest) {
  const ruta = request.nextUrl.pathname;
  if (!ruta.startsWith("/panel") && !ruta.startsWith("/acceso")) {
    return respuestaPublica(request);
  }

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
    // `/panel/salir` se salta esta regla: es la que cierra la sesión. Sin la
    // excepción, el admin (que no está bajo `/panel/admin`) era rebotado a
    // `/panel/admin` ANTES de llegar al `signOut`, y nunca podía salir.
    if (pathname !== "/panel/salir") {
      // Una sola consulta de rol por request al panel (la misma de antes: ya
      // se hacía en las rutas que no son del admin; ahora también cubre
      // `/panel/admin*`). Nada de esto corre fuera de `/panel*`.
      const esRutaAdmin = pathname.startsWith("/panel/admin");
      const { data: perfil, error: errorPerfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", data.user.id)
        .maybeSingle();
      /* Falla CERRADO: si la consulta da error, nadie cuenta como admin. */
      const esAdmin = !errorPerfil && perfil?.rol === "admin";

      if (esRutaAdmin && !esAdmin) {
        // Quien no es admin no entra a `/panel/admin*`: vuelve a su panel.
        // No hay bucle: `/panel` solo manda a `/panel/admin` si esAdmin es
        // true, y acá esAdmin es false (o la consulta falló, que también
        // cuenta como false).
        return conCookiesDe(respuesta, new URL("/panel", request.url));
      }
      if (!esRutaAdmin && esAdmin) {
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
  /* Donde importa la sesión (panel y acceso) y las páginas públicas en español
     (solo para la cookie de país, ver arriba). Nada de estáticos ni imágenes. */
  matcher: [
    "/panel/:path*",
    "/acceso/:path*",
    "/acceso",
    "/",
    "/que-automatizamos",
    "/planes",
    "/nosotros",
    "/contacto",
    "/diagnostico",
    "/mis-herramientas",
  ],
};
