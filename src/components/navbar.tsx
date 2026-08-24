"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled
          ? "border-line bg-paper/85 backdrop-blur-md"
          : "border-transparent bg-paper"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <ConstellationMark className="h-6 w-6 text-ink" />
          <span className="text-[0.95rem] font-semibold tracking-tight">
            {site.nombre}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-[0.875rem] tracking-tight transition-colors",
                pathname === l.href
                  ? "text-ink"
                  : "text-ink-mute hover:text-ink"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button href="/login" variant="ghost" size="md">
            Portal de cliente
          </Button>
          <Button href="/diagnostico" variant="primary" size="md">
            Agenda tu diagnóstico
          </Button>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center text-ink md:hidden"
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
                className="py-3.5 text-[0.95rem] text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            <Button href="/login" variant="secondary" size="md" className="w-full">
              Portal de cliente
            </Button>
            <Button href="/diagnostico" variant="primary" size="md" className="w-full">
              Agenda tu diagnóstico
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
