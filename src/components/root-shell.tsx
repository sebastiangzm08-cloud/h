import { MotionConfig } from "framer-motion";
import { site } from "@/config/site";
import { geistMono, geistSans } from "@/lib/fonts";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";
import { JsonLd } from "@/components/seo/json-ld";

/**
 * Cascarón `<html><body>` compartido por los dos layouts raíz (español e
 * inglés). Hay dos layouts raíz, uno por idioma, para que `<html lang>` salga
 * correcto desde el servidor sin depender de cabeceras dinámicas (las páginas
 * públicas siguen siendo estáticas).
 */
export function RootShell({
  idioma,
  antes,
  children,
}: {
  idioma: Idioma;
  /** Lo que va al principio del <body> (el script del tema del panel, que
      `beforeInteractive` solo permite dentro de `src/app`). */
  antes?: React.ReactNode;
  children: React.ReactNode;
}) {
  const t = getCopy(idioma);
  const organizacionJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.nombre,
    alternateName: "Hoshizora Studio",
    url: site.url,
    description: t.meta.organizacion,
    email: site.contacto.email,
    telephone: `+${site.contacto.whatsapp}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.contacto.ubicacion,
      addressCountry: "CR",
    },
  };

  return (
    <html
      lang={idioma === "en" ? "en" : "es-CR"}
      data-scroll-behavior="smooth"
      data-sitio={site.tema}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col bg-paper text-ink"
        suppressHydrationWarning
      >
        <JsonLd data={organizacionJsonLd} />
        {antes}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
