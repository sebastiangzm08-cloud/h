"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";

/* ==========================================================================
   Demostración en bucle del analizador, en tres actos:
   1. se escribe el problema de un negocio con citas (clínica, veterinaria...)
   2. la constelación conecta el mensaje, el agente y la agenda
   3. aparece cómo lo resolvería el Agente IA

   Hoy lo único real es el Agente IA de WhatsApp, así que TODOS los
   escenarios terminan en él: no se recomienda nada que no exista. Los textos
   viven en `lib/copy/es.ts` y `lib/copy/en.ts` (campo `analizador`).
   ========================================================================== */

/** Lienzo de la constelación. Los nodos se posicionan dentro de este viewBox. */
const VB = { w: 300, h: 180 };

/** Tres disposiciones de los 3 nodos; cada escenario usa una distinta. */
const DISPOSICIONES: { x: number; y: number }[][] = [
  [
    { x: 52, y: 52 },
    { x: 152, y: 128 },
    { x: 248, y: 58 },
  ],
  [
    { x: 55, y: 125 },
    { x: 150, y: 48 },
    { x: 248, y: 118 },
  ],
  [
    { x: 50, y: 58 },
    { x: 150, y: 132 },
    { x: 250, y: 52 },
  ],
];

type Fase = "escribiendo" | "detectando" | "resultado";

/* Tiempos del bucle, en milisegundos. */
const MS_POR_LETRA = 26;
const MS_PAUSA_TRAS_ESCRIBIR = 650;
const MS_DETECTANDO = 3200;
const MS_RESULTADO = 4200;

/** Elige otro escenario al azar, nunca el que se acaba de mostrar. */
function otroAlAzar(actual: number, total: number) {
  if (total < 2) return actual;
  let n = actual;
  while (n === actual) n = Math.floor(Math.random() * total);
  return n;
}

export function AnalyzerLive({ idioma = "es" }: { idioma?: Idioma }) {
  const t = getCopy(idioma).analizador;
  const escenarios = t.escenarios;
  /* Arranca siempre en 0 para que el HTML del servidor y el del navegador
     coincidan; el azar entra recién después de montar. */
  const [idx, setIdx] = useState(0);
  const [fase, setFase] = useState<Fase>("escribiendo");
  const [letras, setLetras] = useState(0);

  const escBase = escenarios[idx];
  const posiciones = DISPOSICIONES[idx % DISPOSICIONES.length];
  const esc = {
    ...escBase,
    nodos: escBase.nodos.map((nombre, i) => ({ nombre, ...posiciones[i] })),
  };
  const activo = fase !== "escribiendo";

  /* Cada visita empieza por un rubro distinto. */
  useEffect(() => {
    const id = setTimeout(
      () => setIdx(Math.floor(Math.random() * escenarios.length)),
      0
    );
    return () => clearTimeout(id);
  }, [escenarios.length]);

  /* Acto 1: tipeo del problema. */
  useEffect(() => {
    if (fase !== "escribiendo") return;
    if (letras < esc.cita.length) {
      const t = setTimeout(() => setLetras((n) => n + 1), MS_POR_LETRA);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setFase("detectando"), MS_PAUSA_TRAS_ESCRIBIR);
    return () => clearTimeout(t);
  }, [fase, letras, esc.cita.length]);

  /* Acto 2: detección. */
  useEffect(() => {
    if (fase !== "detectando") return;
    const t = setTimeout(() => setFase("resultado"), MS_DETECTANDO);
    return () => clearTimeout(t);
  }, [fase]);

  /* Acto 3: resultado y salto al siguiente rubro. */
  useEffect(() => {
    if (fase !== "resultado") return;
    const t = setTimeout(() => {
      setIdx((actual) => otroAlAzar(actual, escenarios.length));
      setLetras(0);
      setFase("escribiendo");
    }, MS_RESULTADO);
    return () => clearTimeout(t);
  }, [fase, escenarios.length]);

  return (
    <div
      aria-hidden="true"
      className="relative flex w-full flex-col justify-center"
    >
      {/* Cabecera */}
      <div className="relative flex items-center justify-between">
        <span className="eyebrow flex items-center gap-1.5 text-noche-texto">
          <Sparkle size={12} weight="fill" />
          {t.cabecera}
        </span>

        <motion.span
          key={esc.rubro}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-full border border-noche-texto px-2.5 py-1 font-mono text-[0.625rem] tracking-wide text-noche-texto uppercase"
        >
          {esc.rubro}
        </motion.span>
      </div>

      {/* Acto 2: la constelación.
          Altura fija a propósito: sin ella el SVG toma su proporción natural
          (viewBox 300×180) y estira el hero fuera de pantalla. */}
      <div className="relative h-[150px] shrink-0 py-3">
        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full overflow-visible"
        >
          {/* Capa apagada: la constelación siempre está, solo que sin encender */}
          {esc.nodos.slice(0, -1).map((n, i) => {
            const m = esc.nodos[i + 1];
            return (
              <line
                key={`base-l-${i}`}
                x1={n.x}
                y1={n.y}
                x2={m.x}
                y2={m.y}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="2 5"
                className="text-noche-texto"
              />
            );
          })}
          {esc.nodos.map((n, i) => (
            <circle
              key={`base-n-${i}`}
              cx={n.x}
              cy={n.y}
              r="2.5"
              className="fill-noche stroke-noche-texto"
            />
          ))}

          {/* Capa encendida */}
          {activo && (
            <g key={`activo-${idx}`}>
              {esc.nodos.slice(0, -1).map((n, i) => {
                const m = esc.nodos[i + 1];
                return (
                  <motion.path
                    key={`on-l-${i}`}
                    d={`M ${n.x} ${n.y} L ${m.x} ${m.y}`}
                    stroke="currentColor"
                    strokeWidth="1.25"
                    fill="none"
                    className="text-acento"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.3 + i * 0.55,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}

              {esc.nodos.map((n, i) => (
                <g key={`on-n-${i}`}>
                  <motion.circle
                    cx={n.x}
                    cy={n.y}
                    r="9"
                    className="fill-none stroke-noche-texto"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: [0, 1, 0.35] }}
                    transition={{ duration: 0.9, delay: i * 0.55 }}
                    style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                  />
                  <motion.circle
                    cx={n.x}
                    cy={n.y}
                    r="3.25"
                    className="fill-acento-claro"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.55,
                      ease: "backOut",
                    }}
                    style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                  />
                  {/* Ojo: no animar `y` acá. En <text> de SVG, framer-motion
                      lo trata como translate y se suma al atributo, tirando
                      la etiqueta fuera del lienzo. Solo opacidad. */}
                  <motion.text
                    x={n.x}
                    y={n.y + 20}
                    textAnchor="middle"
                    className="fill-noche-texto font-mono"
                    style={{ fontSize: 9, letterSpacing: "0.04em" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.45, delay: 0.15 + i * 0.55 }}
                  >
                    {n.nombre}
                  </motion.text>
                </g>
              ))}

              {/* El dato viajando por el flujo ya conectado */}
              <circle
                r="2.75"
                cx={0}
                cy={0}
                className="pulso-flujo fill-noche-texto"
                style={
                  {
                    opacity: 0,
                    "--n0x": `${esc.nodos[0].x}px`,
                    "--n0y": `${esc.nodos[0].y}px`,
                    "--n1x": `${esc.nodos[1].x}px`,
                    "--n1y": `${esc.nodos[1].y}px`,
                    "--n2x": `${esc.nodos[2].x}px`,
                    "--n2y": `${esc.nodos[2].y}px`,
                  } as React.CSSProperties
                }
              />
            </g>
          )}
        </svg>
      </div>

      {/* Actos 1 y 3: la tarjeta */}
      <div className="relative min-h-[132px] rounded-xl border border-noche-texto p-5">
        {fase === "resultado" ? (
            <motion.div
              key={`resultado-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            >
              <p className="eyebrow mb-2 text-noche-texto">{t.recomendacion}</p>
              <p className="text-[0.9375rem] leading-snug font-medium text-noche-texto">
                {t.nombreAgente}
              </p>
              <p className="mt-1.5 text-[0.8125rem] leading-snug text-noche-texto">
                {esc.resultado}
              </p>
              <p className="mt-3 text-[0.75rem] text-noche-texto">
                {t.incluido}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`problema-${idx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <motion.p
                animate={{ opacity: fase === "detectando" ? 0.4 : 1 }}
                transition={{ duration: 0.4 }}
                className="text-[0.8125rem] leading-relaxed text-noche-texto italic"
              >
                &ldquo;{esc.cita.slice(0, letras)}
                {fase === "escribiendo" && (
                  <motion.span
                    animate={{ opacity: [1, 1, 0, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[0.1em] bg-noche-texto"
                  />
                )}
                {letras >= esc.cita.length && "”"}
              </motion.p>

              {fase === "detectando" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="mt-4 flex items-center gap-2 border-t border-noche-texto pt-4"
                >
                  <span className="breathe h-1.5 w-1.5 rounded-full bg-noche-texto" />
                  <span className="font-mono text-[0.6875rem] tracking-wide text-noche-texto uppercase">
                    {t.leyendo}
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}
      </div>

      {/* Progreso del bucle */}
      <div className="relative mt-4 flex gap-1.5">
        {escenarios.map((e, i) => (
          <span
            key={e.rubro}
            className={`flex-1 self-center rounded-full transition-colors duration-500 ${
              i === idx ? "h-[3px] bg-noche-texto" : "h-px bg-noche-texto"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
