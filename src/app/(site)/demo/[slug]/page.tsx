import type { Metadata } from "next";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { ChatWhatsapp } from "@/components/demo/chat-whatsapp";
import { getDemoPublicaPorSlug } from "@/lib/panel/demo-publico";
import { waLink } from "@/config/site";

/* Cada demo es un enlace privado para UN prospecto — nunca al buscador. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DemoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const demo = await getDemoPublicaPorSlug(slug);

  if (!demo || !demo.activo) {
    return (
      <PageHeader
        eyebrow="Demo"
        title="Esta demo ya no está disponible"
        lead="Si esperabas ver algo acá, escribinos y te mandamos un enlace nuevo."
      >
        <div className="mt-8">
          <Button
            href={waLink("Hola, un enlace de demo que me pasaron ya no funciona.")}
            variant="primary"
            size="lg"
          >
            <WhatsappLogo size={17} weight="fill" />
            Escribir por WhatsApp
          </Button>
        </div>
      </PageHeader>
    );
  }

  const mensajeCTA = `Hola, vi la demo de "${demo.nombreNegocio}" y quiero esto para mi negocio.`;

  return (
    <>
      <PageHeader
        eyebrow="Demo personalizada"
        title={`Así atendería el Agente de WhatsApp a ${demo.nombreNegocio}`}
        lead="Escribile como si fueras un cliente tuyo. Las respuestas son reales, generadas en el momento con los datos que nos diste — no es un guion grabado."
      />

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-32">
          <Reveal>
            <ChatWhatsapp slug={demo.slug} nombreNegocio={demo.nombreNegocio} />
          </Reveal>

          <Reveal delay={120}>
            <div className="mx-auto mt-14 max-w-[46ch] text-center">
              <h2 className="text-[1.375rem] font-semibold tracking-tight text-ink">
                ¿Te gustó cómo respondió?
              </h2>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-mute">
                Esto puede estar atendiendo el WhatsApp real de tu negocio en pocos días.
              </p>
              <div className="mt-6 flex justify-center">
                <Button href={waLink(mensajeCTA)} variant="primary" size="lg">
                  <WhatsappLogo size={17} weight="fill" />
                  Quiero esto para mi negocio
                </Button>
              </div>
              <p className="mt-8 text-[0.75rem] text-ink-faint">
                Esta es una demostración de venta de Hoshizora. Las respuestas las genera una
                inteligencia artificial a partir de la información que nos compartiste — no
                queda ninguna cita ni dato real guardado acá.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
