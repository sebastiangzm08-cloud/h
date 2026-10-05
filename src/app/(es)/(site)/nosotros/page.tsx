import type { Metadata } from "next";
import { paginaMeta } from "@/lib/seo/pagina-meta";
import { getCopy } from "@/lib/copy";
import { NosotrosView } from "@/components/views/nosotros-view";

const t = getCopy("es").meta.nosotros;

export const metadata: Metadata = paginaMeta({
  titulo: t.titulo,
  descripcion: t.descripcion,
  ruta: "/nosotros",
});

export default function NosotrosPage() {
  return <NosotrosView idioma="es" />;
}
