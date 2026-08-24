import { PageHeader } from "@/components/page-header";

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

          <div className="mt-4 rounded-xl border border-line bg-surface p-5">
            <p className="text-[0.875rem] leading-relaxed text-ink-mute">
              Documento de referencia para el prototipo. Antes de publicar
              el sitio, hacé que un profesional revise esta sección junto
              con la normativa de protección de datos y facturación
              electrónica aplicable en Costa Rica.
            </p>
          </div>

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
