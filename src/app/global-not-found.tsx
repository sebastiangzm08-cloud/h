import "./globals.css";
import type { Metadata } from "next";
import { geistMono, geistSans } from "@/lib/fonts";
import { site } from "@/config/site";

/* 404 GLOBAL (URL que no coincide con ninguna ruta). Hay dos layouts raíz (uno
   por idioma), así que Next no puede armar este 404 con un layout: tiene que
   ser un documento completo. Se activa con `experimental.globalNotFound` en
   next.config.ts. Es bilingüe a propósito: no se sabe en qué idioma estaba
   la persona. El 404 normal en español (página que llama a `notFound()`)
   sigue en `(es)/not-found.tsx`. */
export const metadata: Metadata = {
  title: `404 — ${site.nombre}`,
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html
      lang="es-CR"
      data-sitio={site.tema}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col items-center justify-center bg-paper px-6 py-24 text-center text-ink">
        <p className="eyebrow mb-5">Error 404</p>
        <h1 className="max-w-[22ch] text-[2rem] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[2.5rem]">
          Esta página no existe
        </h1>
        <p className="mt-4 max-w-[44ch] text-[1rem] leading-relaxed text-ink-mute">
          El enlace no existe o se movió.
        </p>
        <p lang="en" className="mt-2 max-w-[44ch] text-[1rem] leading-relaxed text-ink-mute">
          This page doesn&apos;t exist, or it moved.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          {/* <a> normal a propósito: este documento es su propio layout raíz,
              no hay router de Next para una navegación suave. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="inline-flex h-[3.25rem] items-center justify-center rounded-full bg-gradient-to-b from-acento-claro to-acento px-7 text-[0.975rem] font-medium tracking-tight text-noche-texto"
          >
            Volver al inicio
          </a>
          <a
            href="/en"
            lang="en"
            className="inline-flex h-[3.25rem] items-center justify-center rounded-full border border-line-strong px-7 text-[0.975rem] font-medium tracking-tight text-ink"
          >
            Back to the English site
          </a>
        </div>
      </body>
    </html>
  );
}
