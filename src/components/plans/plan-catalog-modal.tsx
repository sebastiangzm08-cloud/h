"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowUpRight, X, Check } from "@phosphor-icons/react/dist/ssr";
import { automatizaciones } from "@/lib/content";

/**
 * Modal que muestra LA automatización que incluye un plan. Hoy cada plan
 * trae una sola (ver `automatizaciones` en content.ts). Se dispara desde
 * el link "Ver la automatización que incluye" de cada tarjeta de plan.
 */
export function PlanCatalogModal({
  planNombre,
  onClose,
}: {
  planNombre: string;
  onClose: () => void;
}) {
  const item = automatizaciones.find((a) => a.plan === planNombre);

  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!montado) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Automatización incluida en ${planNombre}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-paper">
        <div className="flex items-start justify-between gap-4 border-b border-line p-6 sm:p-7">
          <div>
            <p className="eyebrow mb-1.5">Incluido en {planNombre}</p>
            <h3 className="text-[1.375rem] font-semibold tracking-tight text-ink">
              {item ? item.nombre : "Se diseña a medida"}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink-mute transition-colors hover:border-ink hover:text-ink"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 sm:p-7">
          {!item ? (
            <p className="text-[0.9375rem] leading-relaxed text-ink-mute">
              Este plan no tiene un catálogo fijo: se arma según lo que tu
              operación necesite. Lo definimos en el diagnóstico.
            </p>
          ) : (
            <>
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
                href="/que-automatizamos"
                className="mt-6 inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
              >
                Ver todas las automatizaciones
                <ArrowUpRight size={15} />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
