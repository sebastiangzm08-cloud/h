"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { ConstellationMark } from "./constellation";
import { Button } from "./ui/button";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import { getCopy } from "@/lib/copy";
import {
  guardarPreferenciaIdioma,
  rutaEquivalente,
  type Idioma,
} from "@/lib/i18n";

/* Selector ES | EN. Cada idioma es un layout raíz distinto, así que se usa un
   <a> normal (carga completa) y no <Link>: evita una petición RSC que igual
   terminaría en recarga. Marca el idioma actual con aria-current. */
function SelectorIdioma({
  idioma,
  pathname,
  oscuro,
  className,
}: {
  idioma: Idioma;
  pathname: string;
  oscuro: boolean;
  className?: string;
}) {
  const t = getCopy(idioma);
  return (
    <div
      role="group"
      aria-label={t.nav.selectorIdioma}
      className={cn(
        "inline-flex items-center rounded-full border p-0.5 transition-colors duration-300",
        oscuro ? "border-noche-texto/20" : "border-line-strong",
        className
      )}
    >
      {(["es", "en"] as const).map((l) => {
        const actual = l === idioma;
        const base =
          "flex h-8 min-w-9 items-center justify-center rounded-full px-2.5 font-mono text-[0.6875rem] font-medium tracking-[0.1em] transition-colors duration-200";
        if (actual) {
          return (
            <span
              key={l}
              aria-current="true"
              lang={l}
              className={cn(
                base,
                oscuro ? "bg-noche-texto text-noche" : "bg-ink text-paper"
              )}
            >
              {l.toUpperCase()}
            </span>
          );
        }
        return (
          <a
            key={l}
            href={rutaEquivalente(pathname, l)}
            hrefLang={l}
            lang={l}
            aria-label={t.nav.cambiarA[l]}
            onClick={() => guardarPreferenciaIdioma(l)}
            className={cn(
              base,
              oscuro
                ? "text-noche-texto/70 hover:text-noche-texto"
                : "text-ink-mute hover:text-ink"
            )}
          >
            {l.toUpperCase()}
          </a>
        );
      })}
    </div>
  );
}

export function Navbar({ idioma = "es" }: { idioma?: Idioma }) {
  const t = getCopy(idioma);
  const links = t.nav.links;
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  /* Arranca ya en oscuro si el sitio lo está: evita el parpadeo blanco
     entre el primer render y la primera medición. */
  const [oscuro, setOscuro] = useState(site.tema === "oscuro");

  /**
   * La barra se pinta según la sección que tiene detrás: mira qué elemento
   * hay justo debajo de su borde inferior y busca el `data-tema` más cercano.
   * Las secciones oscuras se marcan con data-tema="oscuro".
   */
  /* Con el sitio en tema oscuro TODO es oscuro, incluidas las secciones que
     no llevan data-tema. Sin esto la barra las lee como claras y se queda
     blanca sobre fondo negro. */
  const sitioOscuro = site.tema === "oscuro";

  const medirFondo = useCallback(() => {
    setScrolled(window.scrollY > 8);
    if (sitioOscuro) {
      setOscuro(true);
      return;
    }
    /* Ojo: hay que usar el borde inferior real, no la altura. Arriba puede
       haber un aviso que corre la barra hacia abajo, y midiendo por altura
       el punto cae dentro de la propia barra. */
    const borde = headerRef.current?.getBoundingClientRect().bottom ?? 64;
    const el = document.elementFromPoint(window.innerWidth / 2, borde + 4);
    const contenedor = el?.closest("[data-tema]");
    setOscuro(contenedor?.getAttribute("data-tema") === "oscuro");
  }, [sitioOscuro]);

  useEffect(() => {
    let pendiente = false;
    const alHacerScroll = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        medirFondo();
        pendiente = false;
      });
    };

    // La primera medición va en un frame aparte: así no toca estado dentro
    // del cuerpo del efecto y encima mide después del layout.
    const primera = requestAnimationFrame(medirFondo);
    window.addEventListener("scroll", alHacerScroll, { passive: true });
    window.addEventListener("resize", alHacerScroll);
    return () => {
      cancelAnimationFrame(primera);
      window.removeEventListener("scroll", alHacerScroll);
      window.removeEventListener("resize", alHacerScroll);
    };
  }, [medirFondo, pathname]);

  /* El menú móvil se cierra con el `onClick` de cada enlace (abajo), no con
     un efecto sobre `pathname`: evita el render en cascada. */

  /* Con el menú móvil abierto el panel tapa la sección: se fuerza claro. */
  const enOscuro = oscuro && !open;

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        enOscuro
          ? scrolled
            ? "border-noche-texto/10 bg-noche/90 backdrop-blur-md"
            : "border-transparent bg-noche"
          : scrolled
            ? "border-line bg-paper/85 backdrop-blur-md"
            : "border-transparent bg-paper"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href={t.nav.inicio}
          aria-label={t.nav.irInicio}
          className="flex items-center gap-3"
          onClick={(e) => {
            if (pathname === t.nav.inicio) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <ConstellationMark
            animate
            className={cn(
              "h-9 w-9 transition-colors duration-300",
              enOscuro ? "text-noche-texto" : "text-ink"
            )}
          />
          <span
            className={cn(
              "text-[1.25rem] font-semibold tracking-tight transition-colors duration-300",
              enOscuro ? "text-noche-texto" : "text-ink"
            )}
          >
            {site.nombre}
          </span>
        </Link>

        <nav
          aria-label={t.nav.menuPrincipal}
          className="hidden items-center gap-8 md:flex"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-[0.875rem] tracking-tight transition-colors duration-300",
                enOscuro
                  ? "text-noche-texto/70 hover:text-noche-texto"
                  : pathname === l.href
                    ? "text-ink"
                    : "text-ink-mute hover:text-ink"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          {t.nav.panel && (
            <Link
              href={t.nav.panelHref}
              className={cn(
                "text-[0.875rem] tracking-tight transition-colors duration-300",
                enOscuro
                  ? "text-noche-texto/70 hover:text-noche-texto"
                  : "text-ink-mute hover:text-ink"
              )}
            >
              {t.nav.panel}
            </Link>
          )}
          <SelectorIdioma idioma={idioma} pathname={pathname} oscuro={enOscuro} />
          <Button
            href={t.nav.cta.href}
            variant={enOscuro ? "inverse" : "primary"}
            size="md"
          >
            {t.nav.cta.label}
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <SelectorIdioma idioma={idioma} pathname={pathname} oscuro={enOscuro} />
          <button
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "flex h-10 w-10 items-center justify-center transition-colors duration-300",
              enOscuro ? "text-noche-texto" : "text-ink"
            )}
            aria-label={open ? t.nav.cerrarMenu : t.nav.abrirMenu}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-paper px-5 pb-6 md:hidden">
          <nav
            aria-label={t.nav.menuPrincipal}
            className="flex flex-col divide-y divide-line"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3.5 text-[0.95rem] text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            <Button href={t.nav.cta.href} variant="primary" size="md" className="w-full">
              {t.nav.cta.label}
            </Button>
            {t.nav.panel && (
              <Link
                href={t.nav.panelHref}
                onClick={() => setOpen(false)}
                className="py-1 text-center text-[0.9rem] text-ink-mute transition-colors hover:text-ink"
              >
                {t.nav.panel}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
