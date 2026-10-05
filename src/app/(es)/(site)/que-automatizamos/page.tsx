import type { Metadata } from "next";
import { paginaMeta } from "@/lib/seo/pagina-meta";
import { getCopy } from "@/lib/copy";
import { QueAutomatizamosView } from "@/components/views/que-automatizamos-view";

const t = getCopy("es").meta.queAutomatizamos;

export const metadata: Metadata = paginaMeta({
  titulo: t.titulo,
  descripcion: t.descripcion,
  ruta: "/que-automatizamos",
});

export default function QueAutomatizamosPage() {
  return <QueAutomatizamosView idioma="es" />;
}
