"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * El contraste entre el proceso manual y el automatizado, lado a lado.
 *
 * La idea que sostiene todo el componente: cada columna tiene una espina
 * vertical, y esa espina DICE algo.
 *   · La del proceso manual está cortada en tramos — los huecos son
 *     literalmente los puntos donde hoy se pierde algo (un cobro que nadie
 *     recordó, un mensaje que nadie mandó).
 *   · La del proceso automatizado es continua, se dibuja sola al entrar en
 *     viewport, y un pulso de luz la recorre sin parar: el flujo no se
 *     detiene aunque el dueño esté durmiendo.
 *
 * No es decoración: es la tesis de la página hecha forma.
 *
 * Todo el movimiento va por transform y opacity. Respeta prefers-reduced-motion.
 */

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

/* Orquestación: los pasos entran en cascada, no cada uno por su cuenta. */
const columna: Variants = {
  oculto: {},
  visible: {
    transition: { staggerChildren: 0.075, delayChildren: 0.15 },
  },
};

const paso: Variants = {
  oculto: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: EASE_OUT_QUART },
  },
};

const espina: Variants = {
  oculto: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 1.1, ease: EASE_OUT_QUART, delay: 0.1 },
  },
};

function Columna({
  eyebrow,
  titulo,
  pasos,
  acento,
}: {
  eyebrow: string;
  titulo: string;
  pasos: string[];
  /** true = la columna automatizada: espina continua, acento y pulso. */
  acento: boolean;
}) {
  const sinMovimiento = useReducedMotion();

  return (
    <motion.div
      variants={columna}
      initial="oculto"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="relative"
    >
      <div className="mb-7">
        <p
          className={
            acento ? "eyebrow text-acento" : "eyebrow"
          }
        >
          {eyebrow}
        </p>
        <h3
          className={`mt-2 text-[1.25rem] leading-snug font-semibold tracking-tight sm:text-[1.375rem] ${
            acento ? "text-ink" : "text-ink-mute"
          }`}
        >
          {titulo}
        </h3>
      </div>

      <div className="relative pl-9">
        {/* --- La espina ------------------------------------------------ */}
        <div className="absolute top-1.5 bottom-1.5 left-[7px] w-px overflow-hidden">
          {acento ? (
            <>
              <motion.div
                variants={espina}
                style={{ originY: 0 }}
                className="h-full w-full bg-gradient-to-b from-acento/70 via-acento/40 to-acento/10"
              />
              {/* Pulso: recorre la espina en bucle. El wrapper mide el alto
                  completo, así el translate en % se traduce a la altura real
                  de la columna sin tener que medirla en JS. */}
              {!sinMovimiento && (
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-transparent via-acento to-transparent"
                  initial={{ y: "-120%" }}
                  animate={{ y: ["-120%", "320%"] }}
                  transition={{
                    duration: 3.4,
                    ease: "linear",
                    repeat: Infinity,
                    repeatDelay: 1.1,
                    delay: 1.2,
                  }}
                />
              )}
            </>
          ) : (
            /* Discontinua a propósito: los huecos son las fugas de hoy. */
            <motion.div
              variants={espina}
              style={{
                originY: 0,
                backgroundImage:
                  "repeating-linear-gradient(to bottom, var(--color-line-strong) 0 6px, transparent 6px 14px)",
              }}
              className="h-full w-full"
            />
          )}
        </div>

        <ol className="flex flex-col gap-5">
          {pasos.map((texto, i) => (
            <motion.li key={texto} variants={paso} className="relative">
              {/* Nodo */}
              <span
                className={`absolute top-[7px] -left-9 flex h-[15px] w-[15px] items-center justify-center rounded-full border ${
                  acento
                    ? "border-acento/50 bg-paper"
                    : "border-line-strong bg-paper"
                }`}
              >
                <span
                  className={`h-[5px] w-[5px] rounded-full ${
                    acento ? "bg-acento" : "bg-ink-faint"
                  }`}
                />
              </span>

              <p
                className={`text-[0.9375rem] leading-relaxed ${
                  acento ? "text-ink-soft" : "text-ink-mute"
                }`}
              >
                <span className="mr-2 font-mono text-[0.6875rem] text-ink-faint tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {texto}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </motion.div>
  );
}

export function FlujoContraste({
  comoTrabajaHoy,
  automatizacionCompleta,
  dolor,
}: {
  comoTrabajaHoy: string[];
  automatizacionCompleta: string[];
  dolor: string;
}) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-16">
        <Columna
          eyebrow="Hoy"
          titulo="Todo depende de que alguien se acuerde"
          pasos={comoTrabajaHoy}
          acento={false}
        />
        <Columna
          eyebrow="Automatizado"
          titulo="El proceso corre solo, de punta a punta"
          pasos={automatizacionCompleta}
          acento
        />
      </div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: EASE_OUT_QUART }}
        className="mt-14 border-t border-line pt-8 text-[1.0625rem] leading-relaxed text-ink-mute sm:mt-16"
      >
        {dolor}
      </motion.p>
    </div>
  );
}
