import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import Script from "next/script";
import "./globals.css";
import { site } from "@/config/site";
import { SCRIPT_APLICAR_TEMA } from "@/lib/panel/tema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.nombre} — ${site.claim}`,
  description:
    "Automatizamos los procesos de captación, atención, administración y operación de cualquier negocio que ya use tecnología, sin cambiar tus herramientas.",
  robots: site.noIndexar
    ? { index: false, follow: false }
    : { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es-CR"
      data-scroll-behavior="smooth"
      data-sitio={site.tema}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col bg-paper text-ink"
        suppressHydrationWarning
      >
        {/* Corre ANTES de que React hidrate cualquier pantalla del panel —
            así el tema claro/oscuro que ya eligieron no parpadea al negro
            de siempre en cada carga completa. Vive acá (layout raíz) y no
            en `TemaSelector` porque `beforeInteractive` solo se puede usar
            en el layout raíz, y así cubre las dos áreas con `.panel-scope`
            (panel de cliente/admin y el entorno del Agente) con un único
            script en vez de repetirlo. */}
        <Script id="tema-panel" strategy="beforeInteractive">
          {SCRIPT_APLICAR_TEMA}
        </Script>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
