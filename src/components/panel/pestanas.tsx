"use client";

/* ==========================================================================
   Pestañas del detalle de una automatización.

   El contenido de cada pestaña se arma en el servidor y baja ya renderizado
   como prop: acá solo se decide cuál se ve. El resaltado se DESLIZA entre
   pestañas con `layoutId`, igual que el menú lateral — misma gramática de
   movimiento en todo el panel.
   ========================================================================== */
import { useId, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

export type Pestana = { id: string; label: string; contenido: ReactNode };

const RESORTE = { type: "spring", stiffness: 420, damping: 38, mass: 0.6 } as const;

export function Pestanas({
  pestanas,
  inicial,
}: {
  pestanas: Pestana[];
  inicial?: string;
}) {
  const grupo = useId();
  const [activa, setActiva] = useState(inicial ?? pestanas[0]?.id);
  const actual = pestanas.find((p) => p.id === activa) ?? pestanas[0];

  return (
    <div className="flex flex-col gap-5">
      <div
        role="tablist"
        aria-label="Secciones de la automatización"
        className="flex flex-wrap gap-1 border-b border-line pb-px"
      >
        {pestanas.map((p) => {
          const sel = p.id === actual.id;
          return (
            <button
              key={p.id}
              role="tab"
              aria-selected={sel}
              onClick={() => setActiva(p.id)}
              className="relative rounded-t-lg px-3 py-2 text-[13px] transition-colors duration-150"
            >
              {sel ? (
                <motion.span
                  layoutId={`pest-activa-${grupo}`}
                  transition={RESORTE}
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-ink"
                />
              ) : null}
              <span className={sel ? "font-medium text-ink" : "text-ink-mute hover:text-ink-soft"}>
                {p.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sin AnimatePresence a propósito: se re-monta el panel con `key` y
          entra con su propia animación. Nada que "salga", así que no hay
          forma de que un modo espera se quede colgado. */}
      <motion.div
        key={actual.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
      >
        {actual.contenido}
      </motion.div>
    </div>
  );
}
