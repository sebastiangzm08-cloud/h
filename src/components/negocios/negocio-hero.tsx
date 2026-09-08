"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * Portada de la página de negocio.
 *
 * El revelado usa blur además de opacidad y desplazamiento: el titular
 * entra desenfocado y se afila. Es más caro de ver que un fade normal y
 * hace que la primera impresión no se sienta a plantilla — que es justo
 * lo que tiene que lograr esta página.
 */

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

const contenedor: Variants = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.11 } },
};

const pieza: Variants = {
  oculto: { opacity: 0, y: 18, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: EASE_OUT_QUART },
  },
};

export function NegocioHero({
  nombre,
  nota,
  planSugerido,
}: {
  nombre: string;
  nota: string;
  planSugerido: string;
}) {
  const sinMovimiento = useReducedMotion();

  return (
    <section
      data-tema="oscuro"
      className="relative overflow-hidden border-b border-noche-texto/10 bg-noche"
    >
      {/* Atmósfera. Decorativa, no captura clics. El resplandor respira
          muy lento — suficiente para que el negro no se sienta plano,
          no tanto como para distraer de la lectura. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-64 left-1/2 h-[620px] w-[1100px] -translate-x-1/2 rounded-full bg-acento/20 blur-[160px]"
        animate={sinMovimiento ? undefined : { opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-52 -bottom-52 h-[440px] w-[560px] rounded-full bg-acento/10 blur-[140px]"
      />

      <motion.div
        variants={contenedor}
        initial="oculto"
        animate="visible"
        className="relative mx-auto max-w-7xl px-5 pt-20 pb-24 sm:px-8 sm:pt-24 sm:pb-28"
      >
        <motion.p variants={pieza} className="eyebrow text-noche-texto/45">
          Automatización para
        </motion.p>

        <motion.h1
          variants={pieza}
          className="mt-6 max-w-[16ch] text-[2.75rem] leading-[0.98] font-semibold tracking-[-0.035em] text-noche-texto sm:text-[3.75rem] lg:text-[4.5rem]"
        >
          {nombre}
        </motion.h1>

        <motion.p
          variants={pieza}
          className="mt-7 max-w-[52ch] text-[1.0625rem] leading-relaxed text-noche-texto/60"
        >
          {nota}
        </motion.p>

        <motion.div
          variants={pieza}
          className="mt-10 inline-flex items-center gap-2.5 rounded-full border border-acento/30 bg-acento/[0.07] px-4 py-2"
        >
          <span className="relative flex h-1.5 w-1.5">
            {!sinMovimiento && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-acento opacity-60" />
            )}
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-acento" />
          </span>
          <span className="text-[0.8125rem] tracking-tight text-noche-texto/80">
            {planSugerido}
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
