import { Hero } from "@/components/home/hero";
import { ToolsMarquee } from "@/components/home/tools-marquee";
import { AgentSection } from "@/components/home/agent-section";
import { PlansSummary } from "@/components/home/plans-summary";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCta } from "@/components/home/final-cta";
import type { Idioma } from "@/lib/i18n";

/** Portada, igual para los dos idiomas: lo que cambia es el texto. */
export function HomeView({ idioma }: { idioma: Idioma }) {
  return (
    <>
      <Hero idioma={idioma} />
      <ToolsMarquee idioma={idioma} />
      <AgentSection idioma={idioma} />
      <PlansSummary idioma={idioma} />
      <FaqSection idioma={idioma} />
      <FinalCta idioma={idioma} />
    </>
  );
}
