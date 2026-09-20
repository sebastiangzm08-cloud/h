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

  const pasos = [
    {
      n: "1",
      t: "Con tus precios y tu horario reales",
      d: "Le pasamos lo que cobrás y cuándo atendés. Nunca inventa un número que no le dimos.",
    },
    {
      n: "2",
      t: "Responde en vivo, no un guion",
      d: "Cada respuesta la genera la IA en el momento — probalo con lo que se te ocurra.",
    },
    {
      n: "3",
      t: "Así atendería tu WhatsApp real",
      d: "Si te convence, lo activamos con tu número en pocos días.",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Demo personalizada"
        title={`Así atendería el Agente de WhatsApp a ${demo.nombreNegocio}`}
        lead="Escribile como si fueras un cliente tuyo. Las respuestas son reales, generadas en el momento con los datos que nos diste — no es un guion grabado."
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
