import type { Metadata } from "next";
import { paginaMeta } from "@/lib/seo/pagina-meta";
import { getCopy } from "@/lib/copy";
import { PlanesView } from "@/components/views/planes-view";

const t = getCopy("es").meta.plan;

export const metadata: Metadata = paginaMeta({
  titulo: t.titulo,
  descripcion: t.descripcion,
  ruta: "/planes",
});

export default function PlanesPage() {
  return <PlanesView idioma="es" />;
}
