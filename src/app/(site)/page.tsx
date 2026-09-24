import { DESCRIPCION_HOME, paginaMeta, TITULO_HOME } from "@/lib/seo/pagina-meta";
import { Hero } from "@/components/home/hero";
import { ToolsMarquee } from "@/components/home/tools-marquee";
import { BentoSolutions } from "@/components/home/bento-solutions";
import { PlansSummary } from "@/components/home/plans-summary";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCta } from "@/components/home/final-cta";

export const metadata = paginaMeta({
  titulo: TITULO_HOME,
  descripcion: DESCRIPCION_HOME,
  ruta: "/",
});

export default function Home() {
  return (
    <>
      <Hero />
      <ToolsMarquee />
      <BentoSolutions />
      <PlansSummary />
      <FaqSection />
      <FinalCta />
    </>
  );
}
