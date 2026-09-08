import { Hero } from "@/components/home/hero";
import { ToolsMarquee } from "@/components/home/tools-marquee";
import { Symptoms } from "@/components/home/symptoms";
import { ProcessesExplorer } from "@/components/home/processes-explorer";
import { BentoSolutions } from "@/components/home/bento-solutions";
import { ToolSelector } from "@/components/home/tool-selector";
import { HowItWorks } from "@/components/home/how-it-works";
import { Demos } from "@/components/home/demos";
import { PlansSummary } from "@/components/home/plans-summary";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCta } from "@/components/home/final-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <ToolsMarquee />
      <Symptoms />
      <BentoSolutions />
      <PlansSummary />
      <ProcessesExplorer />
      <ToolSelector />
      <HowItWorks />
      <Demos />
      <FaqSection />
      <FinalCta />
    </>
  );
}
