import Link from "next/link";
import { ConstellationMark } from "./constellation";
import { site } from "@/config/site";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";

export function Footer({ idioma = "es" }: { idioma?: Idioma }) {
  const t = getCopy(idioma);
  const f = t.footer;
  /* En inglés los textos legales NO se traducen (son contratos): los enlaces
     van a la versión en español y se avisa. */
  const legalEnEspanol = idioma === "en";

  return (
    <footer data-tema="oscuro" className="tema-noche border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-5">
          <div className="col-span-2">
            <Link href={t.nav.inicio} className="flex items-center gap-3">
              <ConstellationMark className="h-9 w-9 text-ink" />
              <span className="text-[1.25rem] font-semibold tracking-tight">
                {site.nombre}
              </span>
            </Link>
            <p className="mt-4 max-w-[32ch] text-[0.875rem] leading-relaxed text-ink-mute">
              {f.claim}.
            </p>
            <p className="eyebrow mt-6">{f.ubicacion}</p>
          </div>

          {f.columnas.map((col) => (
            <div key={col.titulo}>
              <p className="eyebrow mb-4">{col.titulo}</p>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => {
                  const esLegal = l.href.startsWith("/legal/");
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        {...(legalEnEspanol && esLegal
                          ? { lang: "es", hrefLang: "es" }
                          : {})}
                        className="text-[0.875rem] text-ink-mute transition-colors hover:text-ink focus-visible:text-ink"
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {legalEnEspanol && col.links.some((l) => l.href.startsWith("/legal/")) && (
                <p className="mt-4 max-w-[26ch] text-[0.75rem] leading-relaxed text-ink-faint">
                  {f.notaLegal}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.8125rem] text-ink-faint">
            © {new Date().getFullYear()} {site.nombre}. {f.derechos}
          </p>
          <p className="text-[0.8125rem] text-ink-faint">
            {site.contacto.email} · {site.contacto.whatsappVisible}
          </p>
        </div>
      </div>
    </footer>
  );
}
