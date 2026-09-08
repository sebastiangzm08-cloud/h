"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Los pasos de una automatización, explorables.
 *
 * Se arma solo la primera vez (el riel se traza y las estrellas entran en
 * secuencia) y después avanza paso a paso explicando qué ocurre en cada uno.
 * En cuanto el visitante toca o pasa el mouse por una estrella, el recorrido
 * automático se detiene y el control queda de su lado.
 *
 * Todo con transform y opacity. Se remonta con `key` desde afuera.
 */

const MS_POR_PASO = 2600;

/** Estrella de cuatro puntas: la única que se lee limpia a 10px. */
function Estrella({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 1.4c.62 6.62 3.96 9.96 10.6 10.6-6.64.64-9.98 3.98-10.6 10.6-.62-6.62-3.96-9.96-10.6-10.6C8.04 11.36 11.38 8.02 12 1.4Z" />
    </svg>
  );
}

export function FlowStrip({
  pasos,
  detalles,
  sufijoLayout = "",
}: {
  pasos: string[];
  detalles?: string[];
  /** Separa los layoutId cuando el componente se monta más de una vez
      (por ejemplo la copia de móvil y la de escritorio). */
  sufijoLayout?: string;
}) {
  const n = pasos.length;
  const [activo, setActivo] = useState(0);
  const [manual, setManual] = useState(false);
  const armadoRef = useRef(false);

  const margen = 50 / n; // centro de la primera y última estrella, en %
  const trazado = 100 - margen * 2;
  const porNodo = 0.26;
  const finDelTrazo = 0.1 + porNodo * (n - 1) + 0.25;
  const avance = n > 1 ? activo / (n - 1) : 0;

  /* Recorrido automático, hasta que el visitante interviene. */
  useEffect(() => {
    if (manual || n < 2) return;
    const arranque = armadoRef.current ? 0 : finDelTrazo * 1000;
    armadoRef.current = true;
    const t = setTimeout(
      () => setActivo((i) => (i + 1) % n),
      MS_POR_PASO + arranque
    );
    return () => clearTimeout(t);
  }, [activo, manual, n, finDelTrazo]);

  if (n < 2) return null;

  const tomarControl = (i: number) => {
    setManual(true);
    setActivo(i);
  };

  const detalleActivo = detalles?.[activo];

  return (
    <div>
      <div className="relative pt-1">
        {/* Riel apagado */}
        <div
          className="absolute top-[11px] h-px bg-line"
          style={{ left: `${margen}%`, right: `${margen}%` }}
        />

        {/* Riel encendido, trazándose al aparecer */}
        <motion.div
          className="absolute top-[11px] h-px origin-left bg-line-strong"
          style={{ left: `${margen}%`, width: `${trazado}%` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: porNodo * (n - 1),
            ease: "easeInOut",
            delay: 0.1,
          }}
        />

        {/* Avance: el riel se llena hasta el paso activo */}
        <motion.div
          className="absolute top-[11px] h-px origin-left bg-gradient-to-r from-acento to-acento-claro"
          style={{ left: `${margen}%`, width: `${trazado}%` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: avance }}
          transition={{ type: "spring", stiffness: 160, damping: 26 }}
        />

        {/* Luz en la punta del avance */}
        <motion.div
          className="pointer-events-none absolute top-[11px] h-[4px] w-[30px] -translate-y-[1.5px] rounded-full bg-acento/50 blur-[4px]"
          style={{ left: `${margen}%` }}
          animate={{ x: `calc(${avance} * ${trazado} * 1%)` }}
          transition={{ type: "spring", stiffness: 160, damping: 26 }}
        />

        <div className="relative flex">
          {pasos.map((paso, i) => {
            const esActivo = i === activo;
            const yaPaso = i < activo;
            return (
              <button
                key={paso}
                type="button"
                onMouseEnter={() => tomarControl(i)}
                onFocus={() => tomarControl(i)}
                onClick={() => tomarControl(i)}
                aria-pressed={esActivo}
                className="group flex flex-1 cursor-pointer flex-col items-center text-center"
              >
                <motion.span
                  className="relative flex h-[23px] w-[23px] items-center justify-center"
                  initial={{ scale: 0, rotate: -60 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 18,
                    delay: 0.1 + i * porNodo,
                  }}
                >
                  {/* Resplandor del paso activo, viajando entre estrellas */}
                  {esActivo && (
                    <motion.span
                      layoutId={`flujo-resplandor-${sufijoLayout}`}
                      className="absolute h-[26px] w-[26px] rounded-full bg-acento/25 blur-[5px]"
                      transition={{
                        type: "spring",
                        stiffness: 320,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Corta el riel para que la estrella se lea limpia */}
                  <span className="absolute h-[15px] w-[15px] rounded-full bg-surface" />

                  {/* Titileo permanente del paso activo */}
                  <motion.span
                    className="relative flex items-center justify-center"
                    animate={
                      esActivo
                        ? { scale: [1, 1.14, 1], opacity: [1, 0.82, 1] }
                        : { scale: 1, opacity: 1 }
                    }
                    transition={
                      esActivo
                        ? { duration: 2.1, repeat: Infinity, ease: "easeInOut" }
                        : { duration: 0.3 }
                    }
                  >
                    <Estrella
                      className={cn(
                        "transition-colors duration-300",
                        esActivo
                          ? "h-[17px] w-[17px] text-acento"
                          : yaPaso
                            ? "h-[12px] w-[12px] text-acento/70"
                            : "h-[11px] w-[11px] text-line-strong group-hover:text-ink-mute"
                      )}
                    />
                  </motion.span>
                </motion.span>

                <motion.span
                  className={cn(
                    "mt-3 max-w-[13ch] text-[0.6875rem] leading-snug transition-colors duration-300",
                    esActivo
                      ? "font-medium text-ink"
                      : "text-ink-faint group-hover:text-ink-mute"
                  )}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.18 + i * porNodo }}
                >
                  {paso}
                </motion.span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Qué pasa en el paso activo */}
      {detalleActivo && (
        <div className="mt-6 min-h-[76px] rounded-xl border border-line bg-paper/70 p-4 sm:min-h-[64px]">
          <motion.p
            key={activo}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className="text-[0.875rem] leading-relaxed text-ink-mute"
          >
            <span className="font-mono text-[0.75rem] text-ink-faint">
              {String(activo + 1).padStart(2, "0")}
            </span>{" "}
            {detalleActivo}
          </motion.p>
        </div>
      )}
    </div>
  );
}
