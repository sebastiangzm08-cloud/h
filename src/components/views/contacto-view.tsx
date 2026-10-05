import { EnvelopeSimple, MapPin, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { site, waLink } from "@/config/site";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";

export function ContactoView({ idioma }: { idioma: Idioma }) {
  const t = getCopy(idioma).contacto;

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.titulo} lead={t.lead} />

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <ContactForm idioma={idioma} />
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={80}>
                <div className="flex flex-col divide-y divide-line border-t border-line">
                  <a
                    href={`mailto:${site.contacto.email}`}
                    className="flex items-center gap-4 py-5 transition-colors hover:text-ink"
                  >
                    <EnvelopeSimple size={18} aria-hidden="true" className="text-ink-faint" />
                    <div>
                      <p className="eyebrow">{t.correo}</p>
                      <p className="mt-0.5 text-[0.9375rem] text-ink-soft">
                        {site.contacto.email}
                      </p>
                    </div>
                  </a>
                  <a
                    href={waLink(t.mensajeWa)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 py-5 transition-colors hover:text-ink"
                  >
                    <WhatsappLogo size={18} aria-hidden="true" className="text-ink-faint" />
                    <div>
                      <p className="eyebrow">{t.whatsapp}</p>
                      <p className="mt-0.5 text-[0.9375rem] text-ink-soft">
                        {site.contacto.whatsappVisible}
                      </p>
                    </div>
                  </a>
                  <div className="flex items-center gap-4 py-5">
                    <MapPin size={18} aria-hidden="true" className="text-ink-faint" />
                    <div>
                      <p className="eyebrow">{t.ubicacion}</p>
                      <p className="mt-0.5 text-[0.9375rem] text-ink-soft">
                        {site.contacto.ubicacion}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
                  <p className="text-[0.875rem] leading-relaxed text-ink-mute">
                    {t.respuesta}
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
