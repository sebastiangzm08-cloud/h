"use client";

/* ==========================================================================
   Búsqueda del panel: salto rápido a cualquier sección. No busca dentro de
   los datos (todavía) — filtra los destinos del menú y te lleva ahí.
   ========================================================================== */
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icono } from "@/components/panel/iconos";
import { cn } from "@/lib/utils";

export type Destino = { href: string; label: string; grupo?: string };

/** Quita acentos y pasa a minúscula, para comparar sin tropezar con tildes. */
function normal(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function BuscadorPanel({ destinos }: { destinos: Destino[] }) {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const resultados = useMemo(() => {
    const q = normal(texto.trim());
    if (!q) return destinos.slice(0, 8);
    return destinos
      .filter((d) => normal(d.label).includes(q) || normal(d.grupo ?? "").includes(q))
      .slice(0, 8);
  }, [texto, destinos]);

  function ir(d: Destino | undefined) {
    if (!d) return;
    setAbierto(false);
    setTexto("");
    inputRef.current?.blur();
    router.push(d.href);
  }

  return (
    <div className="relative flex max-w-[400px] flex-1">
      <div className="flex w-full items-center gap-2.5 rounded-full border border-line bg-surface-2 px-3 py-2 transition-colors duration-200 focus-within:border-line-strong">
        <Icono nombre="buscar" className="h-[15px] w-[15px] flex-none text-ink-faint" />
        <input
          ref={inputRef}
          type="search"
          value={texto}
          placeholder="Ir a…  (facturación, conexiones, clientes)"
          aria-label="Buscar en el panel"
          className="min-w-0 flex-1 bg-transparent text-[13px] text-ink-soft outline-none placeholder:text-ink-faint"
          onFocus={() => setAbierto(true)}
          onBlur={() => setTimeout(() => setAbierto(false), 120)}
          onChange={(e) => {
            setTexto(e.target.value);
            setAbierto(true);
            setActivo(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActivo((i) => Math.min(i + 1, resultados.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActivo((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              ir(resultados[activo]);
            } else if (e.key === "Escape") {
              setAbierto(false);
              inputRef.current?.blur();
            }
          }}
        />
      </div>

      {abierto && resultados.length > 0 ? (
        <ul className="absolute top-[calc(100%+6px)] left-0 z-30 w-full max-w-[400px] overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]">
          {resultados.map((d, i) => (
            <li key={d.href}>
              <button
                type="button"
                // onMouseDown, no onClick: se dispara antes del blur del input.
                onMouseDown={(e) => {
                  e.preventDefault();
                  ir(d);
                }}
                onMouseEnter={() => setActivo(i)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-[13px] transition-colors",
                  i === activo ? "bg-white/6 text-ink" : "text-ink-mute"
                )}
              >
                <span>{d.label}</span>
                {d.grupo ? (
                  <span className="font-mono text-[10px] tracking-wide text-ink-faint uppercase">
                    {d.grupo}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
