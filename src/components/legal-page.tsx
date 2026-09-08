import { PageHeader } from "@/components/page-header";

/* Antes de publicar el sitio en serio, hacé que un profesional revise
   estas páginas legales junto con la normativa de protección de datos
   y facturación electrónica aplicable en Costa Rica. Nota para el
   equipo, no para el visitante — por eso no se renderiza en la página. */
export function LegalPage({
  eyebrow,
  title,
  actualizado,
  secciones,
}: {
  eyebrow: string;
  title: string;
  actualizado: string;
  secciones: { titulo: string; parrafos: string[] }[];
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} />
      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-5 pb-24 sm:px-8 sm:pb-32">
          <p className="text-[0.8125rem] text-ink-faint">
            Última actualización: {actualizado}
          </p>

          <div className="mt-12 flex flex-col gap-10">
            {secciones.map((s) => (
              <div key={s.titulo}>
                <h2 className="text-[1.125rem] font-medium tracking-tight text-ink">
                  {s.titulo}
                </h2>
                <div className="mt-3 flex flex-col gap-3">
                  {s.parrafos.map((p, i) => (
                    <p
                      key={i}
                      className="text-[0.9375rem] leading-relaxed text-ink-mute"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
