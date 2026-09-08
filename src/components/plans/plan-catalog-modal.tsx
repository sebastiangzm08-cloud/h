"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, X } from "@phosphor-icons/react/dist/ssr";
import { catalogo, planPorNivel } from "@/lib/content";
import { CatalogLink } from "@/components/catalog-link";

/**
 * Modal que muestra únicamente las automatizaciones incluidas en un plan.
 * Reemplaza al catálogo general que antes vivía siempre visible en
 * /planes — ahora el catálogo solo se ve filtrado por plan, disparado
 * desde el link "Ver qué automatizaciones podés elegir" de cada tarjeta.
 */
export function PlanCatalogModal({
  planNombre,
  onClose,
}: {
  planNombre: string;
  onClose: () => void;
}) {
  const items = catalogo.filter((c) => planPorNivel[c.nivel] === planNombre);

  /* Se monta después del primer render: document.body no existe en SSR,
     y createPortal necesita un nodo real del DOM. */
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

  /* Portal a document.body: si el modal quedara anidado dentro de la
     tarjeta del plan, el `transform` que le aplica Framer Motion (el
     <Reveal> que la envuelve) convertiría este `fixed inset-0` en
     relativo a la tarjeta en vez de a toda la ventana. */
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Automatizaciones incluidas en ${planNombre}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-paper">
        <div className="flex items-start justify-between gap-4 border-b border-line p-6 sm:p-7">
          <div>
            <p className="eyebrow mb-1.5">Incluido en {planNombre}</p>
            <h3 className="text-[1.375rem] font-semibold tracking-tight text-ink">
              Elegí tu automatización
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
          {items.length === 0 ? (
            <p className="text-[0.9375rem] text-ink-mute">
              Este plan se diseña a medida — no tiene un catálogo fijo.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map((a) => (
                <CatalogLink
                  key={a.id}
                  automatizacion={a}
                  className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-5 transition-colors hover:border-ink-mute"
                >
                  <div>
                    <div className="flex items-center justify-end">
                      <ArrowUpRight
                        size={14}
                        className="text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </div>
                    <p className="-mt-4 text-[0.9375rem] font-medium leading-snug tracking-tight text-ink">
                      {a.nombre}
                    </p>
                    <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-mute line-clamp-3">
                      {a.descripcion}
                    </p>
                  </div>
                  <div className="mt-4 border-t border-line pt-3 text-[0.75rem] text-ink-faint">
                    {a.disponible ? a.plazo : "Contratar"}
                  </div>
                </CatalogLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
