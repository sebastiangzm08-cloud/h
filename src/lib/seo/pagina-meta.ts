import type { Metadata } from "next";
import { site } from "@/config/site";
import { alternosDe, type Idioma } from "@/lib/i18n";
import { getCopy } from "@/lib/copy";

/* Compatibilidad: el título y la descripción de la portada en español salen
   de los textos del sitio (`lib/copy/es.ts`). */
export const TITULO_HOME = getCopy("es").meta.home.titulo;
export const DESCRIPCION_HOME = getCopy("es").meta.home.descripcion;

/** Metadata completa de una página pública. Cada página tiene que declarar la
    suya: un `openGraph` o `alternates` definido en una página REEMPLAZA el del
    layout (no se fusiona), así que el canonical no puede vivir en el layout
    raíz — todas las páginas terminarían apuntando a la home. La imagen va
    explícita porque, al sobrescribir `openGraph`, se pierde la del archivo
    `opengraph-image.tsx`.

    Si la página existe en los dos idiomas, también declara `hreflang`
    (`es`, `en` y `x-default` hacia el español). */
export function paginaMeta({
  titulo,
  descripcion,
  ruta,
  idioma = "es",
}: {
  titulo: string;
  descripcion: string;
  ruta: string;
  idioma?: Idioma;
}): Metadata {
  const alternos = alternosDe(ruta);
  /* La imagen en inglés sale de `app/og/en/route.tsx` (URL estable). */
  const imagenOg = idioma === "en" ? "/og/en" : "/opengraph-image";
  const imagenTw = idioma === "en" ? "/og/en" : "/twitter-image";

  return {
    title: titulo,
    description: descripcion,
    alternates: {
      canonical: ruta,
      ...(alternos
        ? {
            languages: {
              es: alternos.es,
              en: alternos.en,
              "x-default": alternos.es,
            },
          }
        : {}),
    },
    openGraph: {
      title: titulo,
      description: descripcion,
      url: ruta,
      siteName: site.nombre,
      locale: idioma === "en" ? "en_US" : "es_CR",
      type: "website",
      images: [{ url: imagenOg, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
      images: [imagenTw],
    },
  };
}
