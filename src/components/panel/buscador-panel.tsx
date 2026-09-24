"use client";

/* ==========================================================================
   Búsqueda del panel: salto rápido a cualquier sección. No busca dentro de
   los datos (todavía) — filtra los destinos del menú y te lleva ahí.
   ========================================================================== */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
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

export function BuscadorPanel({
  destinos,
  placeholder = "Ir a una sección…",
}: {
  destinos: Destino[];
  placeholder?: string;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Ctrl+K / ⌘+K enfoca la búsqueda desde cualquier pantalla. La tecla que
     se muestra depende del sistema: en el servidor no se sabe (queda vacía) y
     en el navegador se lee con `useSyncExternalStore`, que es la forma de
     leer algo externo sin dar un HTML de servidor distinto al del navegador. */
  const atajo = useSyncExternalStore(
    () => () => {},
    () => (/mac|iphone|ipad/i.test(navigator.userAgent) ? "⌘K" : "Ctrl K"),
    () => ""
  );

  useEffect(() => {
    function alTeclear(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, []);

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
    <div className="relative flex min-w-0 max-w-[400px] flex-1">
      <div className="flex w-full items-center gap-2.5 rounded-full border border-line bg-surface-2 px-3.5 py-3 transition-colors duration-200 focus-within:border-line-strong sm:px-3 sm:py-2">
        <Icono nombre="buscar" className="h-[15px] w-[15px] flex-none text-ink-faint" />
        <input
          ref={inputRef}
          type="search"
          value={texto}
          placeholder={placeholder}
          aria-label="Buscar en el panel"
          aria-keyshortcuts="Control+K Meta+K"
          className="min-w-0 flex-1 bg-transparent text-[16px] text-ink-soft outline-none placeholder:text-ink-faint sm:text-[13px]"
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
        {atajo ? (
          <kbd className="hidden flex-none rounded-md border border-line-strong bg-surface-3 px-1.5 py-px font-mono text-[10px] text-ink-faint sm:block">
            {atajo}
          </kbd>
        ) : null}
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
