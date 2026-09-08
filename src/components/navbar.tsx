"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { ConstellationMark } from "./constellation";
import { Button } from "./ui/button";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

const links = [
  { href: "/que-automatizamos", label: "Qué automatizamos" },
  { href: "/planes", label: "Planes" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function Navbar() {
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
          href="/"
          className="flex items-center gap-2.5"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <ConstellationMark
            className={cn(
              "h-6 w-6 transition-colors duration-300",
              enOscuro ? "text-noche-texto" : "text-ink"
            )}
          />
          <span
            className={cn(
              "text-[0.95rem] font-semibold tracking-tight transition-colors duration-300",
              enOscuro ? "text-noche-texto" : "text-ink"
            )}
          >
            {site.nombre}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
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
          <Link
            href="/acceso"
            className={cn(
              "text-[0.875rem] tracking-tight transition-colors duration-300",
              enOscuro
                ? "text-noche-texto/70 hover:text-noche-texto"
                : "text-ink-mute hover:text-ink"
            )}
          >
            Panel de socios
          </Link>
          <Button
            href="/diagnostico"
            variant={enOscuro ? "inverse" : "primary"}
            size="md"
          >
            Agenda tu diagnóstico
          </Button>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex h-10 w-10 items-center justify-center transition-colors duration-300 md:hidden",
            enOscuro ? "text-noche-texto" : "text-ink"
          )}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-paper px-5 pb-6 md:hidden">
          <nav className="flex flex-col divide-y divide-line">
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
            <Button href="/diagnostico" variant="primary" size="md" className="w-full">
              Agenda tu diagnóstico
            </Button>
            <Link
              href="/acceso"
              onClick={() => setOpen(false)}
              className="py-1 text-center text-[0.9rem] text-ink-mute transition-colors hover:text-ink"
            >
              Panel de socios
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
