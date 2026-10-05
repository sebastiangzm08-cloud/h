import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";

/* Cinta de lo que el Agente IA hace todos los días. Antes mostraba una lista de
   herramientas con las que "se conecta"; se cambió porque no todas existen:
   solo se nombra lo que el agente de verdad hace. */
export function ToolsMarquee({ idioma = "es" }: { idioma?: Idioma }) {
  const t = getCopy(idioma).cinta;
  const items = t.items;
  return (
    <section
      data-tema="oscuro"
      aria-label={t.titulo}
      className="border-t border-noche-texto/10 bg-noche pt-8 pb-10"
    >
      <p className="eyebrow mx-auto mb-6 max-w-7xl px-5 text-noche-texto/55 sm:px-8">
        {t.titulo}
      </p>
      {/* La lista real va para lectores de pantalla; la cinta animada es
          decorativa y se oculta para ellos (si no, leerían todo dos veces). */}
      <ul className="sr-only">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
      <div aria-hidden="true" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-noche to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-noche to-transparent sm:w-32" />
        <div className="marquee-track flex w-max items-center gap-12">
          {[...items, ...items].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-12 text-[1.05rem] font-medium tracking-tight whitespace-nowrap text-noche-texto/55"
            >
              {item}
              <span className="h-1 w-1 rounded-full bg-acento/60" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
