import type { Metadata } from "next";
import Script from "next/script";
import "../globals.css";
import { site } from "@/config/site";
import { getCopy } from "@/lib/copy";
import { SCRIPT_APLICAR_TEMA } from "@/lib/panel/tema";
import { RootShell } from "@/components/root-shell";

/* Layout RAÍZ del sitio en español, el panel (/panel), el Agente y el acceso.
   El inglés (`/en`) tiene el suyo en `(en)/layout.tsx`: así `<html lang>` sale
   bien en cada idioma. Navegar entre los dos idiomas recarga la página por
   completo (comportamiento normal de Next entre layouts raíz). */
const t = getCopy("es");

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: t.meta.home.titulo,
  description: t.meta.home.descripcion,
  keywords: t.meta.keywords,
  openGraph: {
    title: t.meta.home.titulo,
    description: t.meta.home.descripcion,
    siteName: site.nombre,
    locale: "es_CR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: t.meta.home.titulo,
    description: t.meta.home.descripcion,
  },
  robots: site.noIndexar
    ? { index: false, follow: false }
    : { index: true, follow: true },
};

export default function RootLayoutEs({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootShell
      idioma="es"
      antes={
        /* Corre ANTES de que React hidrate cualquier pantalla del panel —
           así el tema claro/oscuro que ya eligieron no parpadea al negro de
           siempre en cada carga completa. Solo existe en el layout español:
           el panel no tiene versión en inglés. `beforeInteractive` solo se
           puede usar en un layout raíz, y así cubre las dos áreas con
           `.panel-scope` (panel de cliente/admin y el entorno del Agente)
           con un único script en vez de repetirlo. */
        <Script id="tema-panel" strategy="beforeInteractive">
          {SCRIPT_APLICAR_TEMA}
        </Script>
      }
    >
      {children}
    </RootShell>
  );
}
