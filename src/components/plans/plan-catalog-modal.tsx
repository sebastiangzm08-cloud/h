"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowUpRight, X, Check } from "@phosphor-icons/react/dist/ssr";
import type { AutomatizacionPublica } from "@/lib/content";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";

/**
 * Modal que muestra LA automatización que incluye el plan (hoy, el Agente IA
 * de WhatsApp). Se dispara desde el enlace "Ver qué hace el agente" de la
 * tarjeta del plan. Cierra con Escape o clic afuera; el foco entra al botón de
 * cerrar y vuelve al enlace que lo abrió.
 */
export function PlanCatalogModal({
  planNombre,
  automatizacion: item,
  idioma = "es",
  onClose,
}: {
  planNombre: string;
  automatizacion: AutomatizacionPublica;
  idioma?: Idioma;
  onClose: () => void;
}) {
  const t = getCopy(idioma).plan.modal;
  const hrefTodo = idioma === "en" ? "/en/what-we-automate" : "/que-automatizamos";
  const botonCerrar = useRef<HTMLButtonElement>(null);

  /* `onClose` llega como función nueva en cada render del padre: se guarda
     en una ref para que el efecto de foco/teclado corra UNA vez al abrir. */
  const alCerrar = useRef(onClose);
  useEffect(() => {
    alCerrar.current = onClose;
  });

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && alCerrar.current();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    botonCerrar.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previo?.focus?.();
    };
  }, []);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.aria(planNombre)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-paper">
        <div className="flex items-start justify-between gap-4 border-b border-line p-6 sm:p-7">
          <div>
            <p className="eyebrow mb-1.5">{t.etiqueta(planNombre)}</p>
            <h3 className="text-[1.375rem] font-semibold tracking-tight text-ink">
              {item.nombre}
            </h3>
          </div>
          <button
            ref={botonCerrar}
            onClick={onClose}
            aria-label={t.cerrar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink-mute transition-colors hover:border-ink hover:text-ink"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 sm:p-7">
          <p className="text-[0.9375rem] leading-relaxed text-ink-mute">
            {item.descripcion}
          </p>
          <ul className="mt-5 flex flex-col gap-2.5">
            {item.puntos.map((p) => (
              <li
                key={p}
                className="flex items-start gap-2.5 text-[0.875rem] leading-snug text-ink-soft"
              >
                <Check
                  size={15}
                  weight="bold"
                  className="mt-0.5 shrink-0 text-ink-faint"
                />
                {p}
              </li>
            ))}
          </ul>
          <Link
            href={hrefTodo}
            className="mt-6 inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            {t.verTodo}
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
