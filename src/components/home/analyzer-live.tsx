"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import { catalogo, planPorNivel } from "@/lib/content";

/* ==========================================================================
   Demostración en bucle del analizador, en tres actos:
   1. se escribe el problema de un negocio real
   2. la constelación detecta y conecta sus herramientas
   3. aparece la recomendación con precio y plazo del catálogo

   Rota entre rubros distintos: ahí se prueba, sin decirlo, que el método
   sirve para cualquier negocio. Nombre, precio y plazo se leen del
   catálogo en src/lib/content.ts: no hay que tocarlos acá.
   ========================================================================== */

type Nodo = { nombre: string; x: number; y: number };

type Escenario = {
  rubro: string;
  cita: string;
  nodos: Nodo[];
  /** Id del catálogo: de ahí salen nombre, precio y plazo. */
  automatizacionId: string;
};

/** Lienzo de la constelación. Los nodos se posicionan dentro de este viewBox. */
const VB = { w: 300, h: 180 };

const escenarios: Escenario[] = [
  {
    rubro: "Panadería",
    cita: "Agendamos los pedidos grandes por WhatsApp a mano y no llevamos ningún control.",
    nodos: [
      { nombre: "WhatsApp", x: 52, y: 52 },
      { nombre: "Calendario", x: 152, y: 128 },
      { nombre: "Excel", x: 248, y: 58 },
    ],
    automatizacionId: "whatsapp-agenda",
  },
  {
    rubro: "Clínica",
    cita: "Confirmamos las citas una por una por teléfono, todos los días.",
    nodos: [
      { nombre: "Calendario", x: 55, y: 125 },
      { nombre: "WhatsApp", x: 150, y: 48 },
      { nombre: "Sheets", x: 248, y: 118 },
    ],
    automatizacionId: "whatsapp-agenda",
  },
  {
    rubro: "Taller",
    cita: "Las facturas de proveedores las pasamos a mano al Excel.",
    nodos: [
      { nombre: "Correo", x: 50, y: 58 },
      { nombre: "Drive", x: 150, y: 132 },
      { nombre: "Excel", x: 250, y: 52 },
    ],
    automatizacionId: "lectura-facturas",
  },
  {
    rubro: "Inmobiliaria",
    cita: "Los números del mes los sacamos armando cinco Excel a mano.",
    nodos: [
      { nombre: "Sheets", x: 48, y: 120 },
      { nombre: "Drive", x: 155, y: 55 },
      { nombre: "Correo", x: 252, y: 125 },
    ],
    automatizacionId: "panel-alertas",
  },
  {
    rubro: "Tienda en línea",
    cita: "Perseguimos los cobros atrasados uno por uno y facturamos a mano cuando por fin pagan.",
    nodos: [
      { nombre: "WhatsApp", x: 50, y: 50 },
      { nombre: "Banco", x: 148, y: 135 },
      { nombre: "Factura", x: 250, y: 70 },
    ],
    automatizacionId: "whatsapp-cobro",
  },
  {
    rubro: "Constructora",
    cita: "Subimos fotos de los proyectos a redes cuando alguien se acuerda de hacerlo.",
    nodos: [
      { nombre: "Drive", x: 58, y: 130 },
      { nombre: "Redes", x: 150, y: 60 },
      { nombre: "WhatsApp", x: 245, y: 120 },
    ],
    automatizacionId: "publicador-contenido",
  },
];

type Fase = "escribiendo" | "detectando" | "resultado";

/* Tiempos del bucle, en milisegundos. */
const MS_POR_LETRA = 26;
const MS_PAUSA_TRAS_ESCRIBIR = 650;
const MS_DETECTANDO = 3200;
const MS_RESULTADO = 4200;

/** Elige otro escenario al azar, nunca el que se acaba de mostrar. */
function otroAlAzar(actual: number) {
  if (escenarios.length < 2) return actual;
  let n = actual;
  while (n === actual) n = Math.floor(Math.random() * escenarios.length);
  return n;
}

export function AnalyzerLive() {
  /* Arranca siempre en 0 para que el HTML del servidor y el del navegador
     coincidan; el azar entra recién después de montar. */
  const [idx, setIdx] = useState(0);
  const [fase, setFase] = useState<Fase>("escribiendo");
  const [letras, setLetras] = useState(0);

  const esc = escenarios[idx];
  const recomendada = catalogo.find((c) => c.id === esc.automatizacionId);
  const activo = fase !== "escribiendo";

  /* Cada visita empieza por un rubro distinto. */
  useEffect(() => {
    setIdx(Math.floor(Math.random() * escenarios.length));
  }, []);

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
      setIdx(otroAlAzar);
      setLetras(0);
      setFase("escribiendo");
    }, MS_RESULTADO);
    return () => clearTimeout(t);
  }, [fase]);

  return (
    <div
      aria-hidden="true"
      className="relative flex w-full flex-col justify-center"
    >
      {/* Cabecera */}
      <div className="relative flex items-center justify-between">
        <span className="eyebrow flex items-center gap-1.5 text-noche-texto/50">
          <Sparkle size={12} weight="fill" />
          Analizador con IA
        </span>

        <motion.span
          key={esc.rubro}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-full border border-noche-texto/15 px-2.5 py-1 font-mono text-[0.625rem] tracking-wide text-noche-texto/60 uppercase"
        >
          {esc.rubro}
        </motion.span>
      </div>

      {/* Acto 2: la constelación.
          Altura fija a propósito: sin ella el SVG toma su proporción natural
          (viewBox 300×180) y estira el hero fuera de pantalla. */}
      <div className="relative h-[188px] shrink-0 py-3 sm:h-[200px]">
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
                className="text-noche-texto/10"
              />
            );
          })}
          {esc.nodos.map((n, i) => (
            <circle
              key={`base-n-${i}`}
              cx={n.x}
              cy={n.y}
              r="2.5"
              className="fill-noche-texto/20"
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
                    className="text-acento/70"
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
                    className="fill-noche-texto/10"
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
                    className="fill-noche-texto/70 font-mono"
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
      <div className="relative min-h-[164px] rounded-xl border border-noche-texto/12 bg-noche-texto/[0.035] p-5">
        {fase === "resultado" ? (
            <motion.div
              key={`resultado-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            >
              <p className="eyebrow mb-2 text-noche-texto/55">Recomendación</p>
              <p className="text-[0.9375rem] leading-snug font-medium text-noche-texto">
                {recomendada?.nombre ?? ""}
              </p>
              <p className="mt-1.5 text-[0.8125rem] text-noche-texto/55">
                {recomendada ? `Incluido en ${planPorNivel[recomendada.nivel]}` : ""} · {recomendada?.plazo}
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
                className="text-[0.8125rem] leading-relaxed text-noche-texto/75 italic"
              >
                &ldquo;{esc.cita.slice(0, letras)}
                {fase === "escribiendo" && (
                  <motion.span
                    animate={{ opacity: [1, 1, 0, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[0.1em] bg-noche-texto/80"
                  />
                )}
                {letras >= esc.cita.length && "”"}
              </motion.p>

              {fase === "detectando" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="mt-4 flex items-center gap-2 border-t border-noche-texto/10 pt-4"
                >
                  <span className="breathe h-1.5 w-1.5 rounded-full bg-noche-texto" />
                  <span className="font-mono text-[0.6875rem] tracking-wide text-noche-texto/60 uppercase">
                    Detectando herramientas
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
            className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
              i === idx ? "bg-noche-texto/60" : "bg-noche-texto/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
