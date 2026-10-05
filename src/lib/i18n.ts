/* ==========================================================================
   Idiomas del sitio público.

   El sitio en español vive en la raíz (`/`, `/planes`...). La versión en
   inglés para Estados Unidos vive bajo `/en` (`/en`, `/en/plans`...). Cada
   idioma tiene su propio layout raíz (`src/app/(es)` y `src/app/(en)`), así
   el `<html lang>` sale bien desde el servidor, sin scripts.

   Este archivo es lo único que sabe qué página del español equivale a cuál
   del inglés. Lo usan el selector de idioma, el hreflang y el sitemap.
   ========================================================================== */

export type Idioma = "es" | "en";

/** Páginas que existen en los dos idiomas (mismo contenido, otra lengua). */
export const paresDeRutas = [
  { es: "/", en: "/en" },
  { es: "/que-automatizamos", en: "/en/what-we-automate" },
  { es: "/planes", en: "/en/plans" },
  { es: "/nosotros", en: "/en/about" },
  { es: "/contacto", en: "/en/contact" },
  { es: "/diagnostico", en: "/en/diagnostic" },
] as const;

/** Rutas del español que no tienen par exacto pero sí un destino cercano en
    inglés. Sirven SOLO para el selector (no para hreflang: no es el mismo
    contenido). El asesor de IA de `/mis-herramientas` vive en inglés dentro
    de `/en/what-we-automate`. */
const destinoCercano: Record<string, string> = {
  "/mis-herramientas": "/en/what-we-automate",
};

function limpiar(pathname: string) {
  const sinQuery = pathname.split(/[?#]/)[0] || "/";
  return sinQuery.length > 1 ? sinQuery.replace(/\/+$/, "") : sinQuery;
}

export function idiomaDeRuta(pathname: string): Idioma {
  const p = limpiar(pathname);
  return p === "/en" || p.startsWith("/en/") ? "en" : "es";
}

/** A dónde manda el selector de idioma desde `pathname`. Si la página no
    tiene equivalente (legales, órdenes, demos) cae en la portada del otro
    idioma. */
export function rutaEquivalente(pathname: string, destino: Idioma): string {
  const p = limpiar(pathname);
  const par = paresDeRutas.find((r) => r.es === p || r.en === p);
  if (par) return par[destino];
  if (destino === "en") return destinoCercano[p] ?? "/en";
  return "/";
}

/** Los dos hreflang de una página que existe en ambos idiomas, o null. */
export function alternosDe(ruta: string): { es: string; en: string } | null {
  const p = limpiar(ruta);
  const par = paresDeRutas.find((r) => r.es === p || r.en === p);
  return par ? { es: par.es, en: par.en } : null;
}

/* --------------------------------------------------------------------------
   Preferencia de idioma del visitante (aviso "Switch to English").
   Se guarda en localStorage Y en una cookie: cualquiera de las dos puede
   estar bloqueada (modo privado, bloqueo de datos del sitio).
   -------------------------------------------------------------------------- */
export const CLAVE_IDIOMA = "hz-idioma";
/** Cookie que pone `proxy.ts` si el servidor recibe una cabecera de país con
    valor US. Hoy ninguna cabecera llega; queda lista para cuando haya CDN. */
export const COOKIE_PAIS = "hz-pais";

export function guardarPreferenciaIdioma(idioma: Idioma) {
  try {
    window.localStorage.setItem(CLAVE_IDIOMA, idioma);
  } catch {
    /* sin almacenamiento: queda la cookie */
  }
  try {
    document.cookie = `${CLAVE_IDIOMA}=${idioma}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    /* sin cookies: el aviso podría repetirse, nada más */
  }
}

export function leerPreferenciaIdioma(): Idioma | null {
  try {
    const v = window.localStorage.getItem(CLAVE_IDIOMA);
    if (v === "es" || v === "en") return v;
  } catch {
    /* sigue con la cookie */
  }
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${CLAVE_IDIOMA}=(es|en)`));
    if (m) return m[1] as Idioma;
  } catch {
    /* nada */
  }
  return null;
}
