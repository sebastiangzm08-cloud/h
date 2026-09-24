import type { Metadata } from "next";
import { paginaMeta } from "@/lib/seo/pagina-meta";
import { PageHeader } from "@/components/page-header";
import { AIAdvisor } from "@/components/ai-advisor";
import { site } from "@/config/site";

export const metadata: Metadata = paginaMeta({
  titulo: `Qué puedo automatizar — ${site.nombre}`,
  descripcion:
    "Contanos en una frase cómo funciona tu negocio y te decimos cuál de las automatizaciones te sirve y en qué plan entra.",
  ruta: "/mis-herramientas",
});

export default function MisHerramientasPage() {
  return (
    <>
      <PageHeader
        eyebrow="Qué puedo automatizar"
        title="Contanos tu negocio y te decimos por dónde empezar"
        lead="Una frase sobre cómo trabajás hoy y qué herramientas usás. Te devolvemos cuál de nuestras automatizaciones encaja y en qué plan entra — o si conviene un diagnóstico."
      />
      <AIAdvisor />
    </>
  );
}
