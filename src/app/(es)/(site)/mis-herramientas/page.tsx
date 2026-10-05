import type { Metadata } from "next";
import { paginaMeta } from "@/lib/seo/pagina-meta";
import { PageHeader } from "@/components/page-header";
import { AIAdvisor } from "@/components/ai-advisor";
import { getCopy } from "@/lib/copy";
import { planes } from "@/lib/content";

const copy = getCopy("es").asesor;
const t = getCopy("es").meta.asesor;

export const metadata: Metadata = paginaMeta({
  titulo: t.titulo,
  descripcion: t.descripcion,
  ruta: "/mis-herramientas",
});

export default function MisHerramientasPage() {
  return (
    <>
      <PageHeader
        eyebrow={copy.paginaEyebrow}
        title={copy.paginaTitulo}
        lead={copy.paginaLead}
      />
      <AIAdvisor plan={planes[0]} idioma="es" />
    </>
  );
}
