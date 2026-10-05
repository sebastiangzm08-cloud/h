import type { Metadata } from "next";
import "../globals.css";
import { site } from "@/config/site";
import { getCopy } from "@/lib/copy";
import { RootShell } from "@/components/root-shell";

/* Layout RAÍZ del sitio en inglés (EE. UU.), bajo `/en`. `<html lang="en">`
   sale desde el servidor; ver `components/root-shell.tsx`. */
const t = getCopy("en");

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: t.meta.home.titulo,
  description: t.meta.home.descripcion,
  keywords: t.meta.keywords,
  openGraph: {
    title: t.meta.home.titulo,
    description: t.meta.home.descripcion,
    siteName: site.nombre,
    locale: "en_US",
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

export default function RootLayoutEn({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootShell idioma="en">{children}</RootShell>;
}
