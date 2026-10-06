import type { Metadata } from "next";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { DemoEstudio } from "@/components/demo/demo-estudio";
import { getDemoPublicaPorSlug } from "@/lib/panel/demo-publico";
import { nombresDeServicios } from "@/lib/demo/herramientas";
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
  const ctaHref = waLink(mensajeCTA);

  /* Frases para arrancar. Solo se nombra un servicio si de verdad está cargado. */
  const [primerServicio] = nombresDeServicios(demo.servicios, 1);
  const sugerencias = [
    "¿Qué servicios ofrecen?",
    primerServicio ? `¿Cuánto cuesta ${primerServicio}?` : "¿Cuáles son los precios?",
    "Quisiera agendar una cita",
    "Necesito hablar con una persona",
  ];

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
      t: "Y usted lo ve todo en su panel",
      d: "Cada conversación, cita y cifra queda a la vista. Si le convence, lo dejamos funcionando con su número en pocos días.",
    },
  ];

  return (
    <>
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-7xl px-5 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-7">
          <p className="eyebrow mb-3 sm:mb-4">Demo personalizada</p>
          <h1 className="max-w-[34ch] text-[1.75rem] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-ink sm:text-[2.25rem] sm:leading-[1.04]">
            Así atendería el Agente de WhatsApp a {demo.nombreNegocio}
          </h1>
          <p className="mt-3 max-w-[62ch] text-[0.9375rem] leading-relaxed text-ink-mute sm:mt-4 sm:text-base">
            <span className="sm:hidden">Escríbale como si fuera un cliente y mire cómo se llena el panel.</span>
            <span className="hidden sm:inline">
              Escríbale como si fuera uno de sus pacientes o clientes y mire cómo se llena el panel con lo que
              usted escribe. Las respuestas se generan en el momento, no es un guion grabado.
            </span>
          </p>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-28">
          <DemoEstudio
            slug={demo.slug}
            nombreNegocio={demo.nombreNegocio}
            trato={demo.trato}
            logoUrl={demo.logoUrl}
            restantesIniciales={Math.max(0, demo.mensajesTope - demo.mensajesUsados)}
            tope={demo.mensajesTope}
            sugerencias={sugerencias}
            ctaHref={ctaHref}
          />

          <Reveal delay={80}>
            <div className="mt-14 grid grid-cols-1 gap-8 border-t border-line pt-10 sm:grid-cols-3 sm:gap-6">
              {pasos.map((p) => (
                <div key={p.n}>
                  <span className="font-mono text-[0.75rem] tracking-wide text-acento">{p.n}</span>
                  <p className="mt-2 text-[0.9375rem] font-medium tracking-tight text-ink">{p.t}</p>
                  <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-mute">{p.d}</p>
                </div>
              ))}
            </div>
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
                <Button href={ctaHref} variant="primary" size="lg">
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
