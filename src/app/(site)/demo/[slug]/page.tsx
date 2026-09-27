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
        lead="Si esperaba ver algo aquí, escríbanos y le mandamos un enlace nuevo."
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

  const pasos = [
    {
      n: "1",
      t: "Con la información de su negocio",
      d: "Servicios, horarios y datos de su negocio. Si le preguntan algo que no sabe, no lo inventa.",
    },
    {
      n: "2",
      t: "Responde en vivo, no un guion",
      d: "Cada respuesta se genera en el momento. Pruébelo con lo que le preguntaría un paciente o cliente.",
    },
    {
      n: "3",
      t: "Así atendería su WhatsApp real",
      d: "Si le convence, lo dejamos funcionando con su número en pocos días.",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Demo personalizada"
        title={`Así atendería el Agente de WhatsApp a ${demo.nombreNegocio}`}
        lead="Escríbale como si fuera uno de sus pacientes o clientes. Las respuestas son reales, se generan en el momento con la información de su negocio. No es un guion grabado."
      >
        <Reveal delay={80}>
          <div className="mt-12 grid grid-cols-1 gap-8 border-t border-line pt-10 sm:grid-cols-3 sm:gap-6">
            {pasos.map((p) => (
              <div key={p.n}>
                <span className="font-mono text-[0.75rem] tracking-wide text-acento">
                  {p.n}
                </span>
                <p className="mt-2 text-[0.9375rem] font-medium tracking-tight text-ink">
                  {p.t}
                </p>
                <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-mute">
                  {p.d}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </PageHeader>

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-32">
          <Reveal>
            <ChatWhatsapp slug={demo.slug} nombreNegocio={demo.nombreNegocio} logoUrl={demo.logoUrl} />
          </Reveal>

          <Reveal delay={120}>
            <div className="mx-auto mt-14 max-w-[46ch] text-center">
              <h2 className="text-[1.375rem] font-semibold tracking-tight text-ink">
                ¿Qué le pareció cómo respondió?
              </h2>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-mute">
                Esto puede estar atendiendo el WhatsApp real de su negocio en pocos días.
              </p>
              <div className="mt-6 flex justify-center">
                <Button href={waLink(mensajeCTA)} variant="primary" size="lg">
                  <WhatsappLogo size={17} weight="fill" />
                  Lo quiero para mi negocio
                </Button>
              </div>
              <p className="mt-8 text-[0.75rem] text-ink-faint">
                Esta es una demostración de venta de Hoshizora. Las respuestas las genera una
                inteligencia artificial con la información de su negocio. Aquí no se guarda
                ninguna cita ni dato real.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
