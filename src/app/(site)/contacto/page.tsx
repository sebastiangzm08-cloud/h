import type { Metadata } from "next";
import { EnvelopeSimple, WhatsappLogo, MapPin } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { site, waLink } from "@/config/site";

export const metadata: Metadata = {
  title: `Contacto — ${site.nombre}`,
  description: "Escribinos por correo, WhatsApp o dejanos un mensaje.",
};

export default function ContactoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contacto"
        title="Contanos qué te está quitando tiempo"
        lead="Si ya sabés qué querés automatizar, mejor agendá directo el diagnóstico. Si todavía no estás seguro, este es el camino."
      />

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <ContactForm />
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={80}>
                <div className="flex flex-col divide-y divide-line border-t border-line">
                  <a
                    href={`mailto:${site.contacto.email}`}
                    className="flex items-center gap-4 py-5"
                  >
                    <EnvelopeSimple size={18} className="text-ink-faint" />
                    <div>
                      <p className="eyebrow">Correo</p>
                      <p className="mt-0.5 text-[0.9375rem] text-ink-soft">
                        {site.contacto.email}
                      </p>
                    </div>
                  </a>
                  <a
                    href={waLink("Hola, tengo una consulta sobre automatización.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 py-5"
                  >
                    <WhatsappLogo size={18} className="text-ink-faint" />
                    <div>
                      <p className="eyebrow">WhatsApp</p>
                      <p className="mt-0.5 text-[0.9375rem] text-ink-soft">
                        {site.contacto.whatsappVisible}
                      </p>
                    </div>
                  </a>
                  <div className="flex items-center gap-4 py-5">
                    <MapPin size={18} className="text-ink-faint" />
                    <div>
                      <p className="eyebrow">Ubicación</p>
                      <p className="mt-0.5 text-[0.9375rem] text-ink-soft">
                        {site.contacto.ubicacion}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
                  <p className="text-[0.875rem] leading-relaxed text-ink-mute">
                    Tiempo de respuesta habitual: dentro de un día hábil por
                    correo, y el mismo día por WhatsApp en horario laboral.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
