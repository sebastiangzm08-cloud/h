"use client";

import { motion } from "framer-motion";
import { sintomas, horasPerdidasEstimadas } from "@/lib/content";

/* Los primeros 3 síntomas son cuantificables (suman horasPerdidasEstimadas);
   los últimos 2 no se traducen en horas — se pagan en clientes perdidos, no
   en tiempo — así que van en un bloque aparte, sin número, para no forzar
   una cifra falsa. Ver la nota en content.ts. */
const bloqueHoras = sintomas.filter((s) => s.horas !== null);
const bloqueFriccion = sintomas.filter((s) => s.horas === null);

export function Symptoms() {
  return (
    <section
      data-tema="oscuro"
      className="relative overflow-hidden border-b border-noche-texto/10 bg-noche"
    >
      {/* Mismo resplandor ambiental del hero — esta sección era una de
          las que se sentían "muertas" por vivir sobre fondo plano. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 -left-52 h-[480px] w-[560px] rounded-full bg-acento/10 blur-[140px]"
      />

      <div className="relative mx-auto max-w-5xl px-5 py-24 sm:px-8 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="max-w-[42ch]"
        >
          <p className="eyebrow mb-4 text-noche-texto/55">
            El síntoma es el mismo en todas las industrias
          </p>
          <h2 className="text-[2rem] leading-[1.05] font-semibold tracking-tight text-noche-texto sm:text-[2.375rem]">
            No importa tu sector: así se está fugando el tiempo de tu equipo.
          </h2>
        </motion.div>

        {/* Bloque 1 — los 3 síntomas medibles, con horas al mes. */}
        <div className="mt-14 flex flex-col sm:mt-16">
          {bloqueHoras.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.55,
                delay: i * 0.08,
                ease: [0.25, 1, 0.5, 1],
              }}
              className="grid grid-cols-1 items-start gap-2 border-t border-noche-texto/10 py-5 first:border-t-0 sm:grid-cols-[5.5rem_1fr_auto] sm:gap-8 sm:py-6"
            >
              <span className="font-mono text-[0.75rem] tracking-wide text-noche-texto/40 sm:pt-1">
                {s.momento}
              </span>

              <div>
                <p className="text-[1.0625rem] font-medium tracking-tight text-noche-texto">
                  {s.titulo}
                </p>
                <p className="mt-1.5 max-w-[46ch] text-[0.9375rem] leading-relaxed text-noche-texto/55">
                  {s.texto}
                </p>
                <p className="mt-2.5 text-[0.8125rem] text-noche-texto/40">
                  {s.cuenta}
                </p>
              </div>

              <div className="flex flex-row items-baseline gap-1.5 sm:flex-col sm:items-end sm:gap-0 sm:pt-1 sm:text-right">
                <span className="tnum text-[1.75rem] font-semibold tracking-tight text-acento-claro sm:text-[2.25rem]">
                  {s.horas}h
                </span>
                <span className="text-[0.6875rem] text-noche-texto/40">
                  al mes
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Totalizador del bloque 1 — el "48h" con el acento de marca,
            protagonista visual de la sección. */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="mt-8 flex flex-col items-start gap-2 border-t border-noche-texto/15 pt-8"
        >
          <p className="tnum text-[2.5rem] leading-none font-semibold tracking-tight text-acento-claro sm:text-[3rem]">
            ~{horasPerdidasEstimadas} horas al mes
          </p>
          <p className="max-w-[42ch] text-[0.875rem] leading-relaxed text-noche-texto/50">
            Eso es más de una semana laboral completa que tu equipo podría
            invertir en vender y atender mejor.
          </p>
        </motion.div>

        {/* Bloque 2 — fricción y pérdida de clientes, sin cifra de horas. */}
        <div className="mt-16 grid grid-cols-1 gap-6 border-t border-noche-texto/15 pt-10 sm:mt-20 sm:grid-cols-2 sm:gap-8">
          {bloqueFriccion.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.55,
                delay: i * 0.08,
                ease: [0.25, 1, 0.5, 1],
              }}
            >
              <span className="font-mono text-[0.75rem] tracking-wide text-noche-texto/40">
                {s.momento}
              </span>
              <p className="mt-2 text-[1.0625rem] font-medium tracking-tight text-noche-texto">
                {s.titulo}
              </p>
              <p className="mt-1.5 max-w-[42ch] text-[0.9375rem] leading-relaxed text-noche-texto/55">
                {s.texto}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
