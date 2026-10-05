import { renderOgImage } from "@/lib/seo/og-image";

/* Imagen de preview en inglés para las páginas de /en (Open Graph y Twitter).
   Es un route handler y no un `opengraph-image.tsx` dentro de /en porque Next
   le agrega un hash a la URL de los archivos de imagen anidados, y las
   páginas necesitan una URL estable y explícita (ver `paginaMeta`). Se genera
   una vez, en el build. */
export const dynamic = "force-static";

export function GET() {
  return renderOgImage("en");
}
