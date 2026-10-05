import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { AgentIntro, AgentPanel, AgentSteps } from "@/components/home/agent-section";
import { AIAdvisor } from "@/components/ai-advisor";
import { getContenido } from "@/lib/contenido";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";

/** "El Agente IA" / "The AI Agent": la página de detalle de lo único que se
    ofrece hoy. En inglés incluye también el asesor de IA (en español vive en
    /mis-herramientas). */
export function QueAutomatizamosView({ idioma }: { idioma: Idioma }) {
  const t = getCopy(idioma).queAutomatizamos;
  const { planes } = getContenido(idioma);
  const hrefDiagnostico = idioma === "en" ? "/en/diagnostic" : "/diagnostico";

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.titulo} lead={t.lead} />
      <AgentIntro idioma={idioma} />
      <AgentSteps idioma={idioma} />
      <AgentPanel idioma={idioma} />

      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <p className="text-[0.9375rem] text-ink-mute">
            {t.otro}{" "}
            <Link
              href={hrefDiagnostico}
              className="text-ink-soft underline underline-offset-4 transition-colors hover:text-ink"
            >
              {t.otroLink}
            </Link>{" "}
            {t.otroResto}
          </p>
        </div>
      </section>

      {idioma === "en" && <AIAdvisor plan={planes[0]} idioma="en" />}
    </>
  );
}
