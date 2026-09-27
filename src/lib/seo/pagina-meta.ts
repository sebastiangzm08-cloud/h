import type { Metadata } from "next";
import { site } from "@/config/site";

export const TITULO_HOME = `${site.nombre} | Automatización de procesos con IA para negocios`;
export const DESCRIPCION_HOME =
  "Automatizamos WhatsApp, ventas, redes y administración de tu negocio con IA, sin cambiar tus herramientas. Agencia desde Costa Rica. Diagnóstico gratis.";

/** Metadata completa de una página pública. Cada página tiene que declarar la
    suya: un `openGraph` o `alternates` definido en una página REEMPLAZA el del
    layout (no se fusiona), así que el canonical no puede vivir en el layout
    raíz — todas las páginas terminarían apuntando a la home. La imagen va
    explícita porque, al sobrescribir `openGraph`, se pierde la del archivo
    `opengraph-image.tsx`. */
export function paginaMeta({
  titulo,
  descripcion,
  ruta,
}: {
  titulo: string;
  descripcion: string;
  ruta: string;
}): Metadata {
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: ruta },
    openGraph: {
      title: titulo,
      description: descripcion,
      url: ruta,
      siteName: site.nombre,
      locale: "es_CR",
      type: "website",
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
      images: ["/twitter-image"],
    },
  };
}
