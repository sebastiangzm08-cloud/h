import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { AIAdvisor } from "@/components/ai-advisor";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Qué puedo automatizar — ${site.nombre}`,
  description:
    "Contanos en una frase cómo funciona tu negocio y te decimos cuál de las automatizaciones te sirve y en qué plan entra.",
};

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
