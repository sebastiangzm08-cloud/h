import type { Metadata } from "next";
import { ToolSelector } from "@/components/home/tool-selector";
import { AIAdvisor } from "@/components/ai-advisor";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Qué puedo automatizar — ${site.nombre}`,
  description:
    "Marcá las herramientas que ya usás y mirá qué automatizaciones son posibles con esa combinación.",
};

export default function MisHerramientasPage() {
  return (
    <>
      <ToolSelector />
      <AIAdvisor />
    </>
  );
}
