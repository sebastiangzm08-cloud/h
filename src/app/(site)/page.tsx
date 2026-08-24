import { Hero } from "@/components/home/hero";
import { ToolsMarquee } from "@/components/home/tools-marquee";
import { Symptoms } from "@/components/home/symptoms";
import { ProcessesGrid } from "@/components/home/processes-grid";
import { BentoSolutions } from "@/components/home/bento-solutions";
import { ToolSelector } from "@/components/home/tool-selector";
import { HowItWorks } from "@/components/home/how-it-works";
import { Demos } from "@/components/home/demos";
import { BeforeAfter } from "@/components/home/before-after";
import { PlansSummary } from "@/components/home/plans-summary";
import { Trust } from "@/components/home/trust";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCta } from "@/components/home/final-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <ToolsMarquee />
      <Symptoms />
      <ProcessesGrid />
      <BentoSolutions />
      <ToolSelector />
      <HowItWorks />
      <Demos />
      <BeforeAfter />
      <PlansSummary />
      <Trust />
      <FaqSection />
      <FinalCta />
    </>
  );
}
