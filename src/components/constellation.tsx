import { cn } from "@/lib/utils";

/** Vértices de la estrella en el orden en que la traza el path (pentagrama:
    un pentágono conectando cada segundo vértice, como se dibuja una estrella
    de un solo trazo). El índice es el orden de llegada, usado para escalonar
    la animación de construcción de los nodos. */
const puntos = [
  { x: 16, y: 3, orden: 0 },
  { x: 23.6, y: 26.5, orden: 1 },
  { x: 3.6, y: 12, orden: 2 },
  { x: 28.4, y: 12, orden: 3 },
  { x: 8.4, y: 26.5, orden: 4 },
];

const DURACION_TRAZO = 1.1;

/**
 * Motivo gráfico de marca: una estrella de cinco puntas dibujada como
 * constelación (pentagrama de un solo trazo, con un nodo en cada punta).
 * Reutilizado como logo, favicon e imágenes de preview. Puramente
 * decorativo: aria-hidden.
 *
 * `animate`: la dibuja de un trazo y va "prendiendo" cada punta en el orden
 * en que la línea la alcanza — pensado para un momento puntual (el logo al
 * cargar la página, la ilustración del 404), no para verse en bucle.
 */
export function ConstellationMark({
  className,
  animate = false,
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M16 3L23.6 26.5L3.6 12L28.4 12L8.4 26.5Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength={100}
        className={cn(animate && "trazo-construye")}
        style={
          animate ? { animationDuration: `${DURACION_TRAZO}s` } : undefined
        }
      />
      {puntos.map((p) => (
        <circle
          key={p.orden}
          cx={p.x}
          cy={p.y}
          r="2.5"
          fill="currentColor"
          className={cn(animate && "punto-construye")}
          style={
            animate
              ? { animationDelay: `${(p.orden / puntos.length) * DURACION_TRAZO}s` }
              : undefined
          }
        />
      ))}
    </svg>
  );
}

/** Campo de estrellas disperso para fondos oscuros. Estático, sin animar. */
export function ConstellationField({ className }: { className?: string }) {
  const nodes = [
    [40, 60], [140, 30], [230, 90], [320, 40], [80, 140],
    [200, 160], [360, 130], [270, 200], [120, 220], [30, 180],
  ];
  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [1, 4], [4, 5], [5, 6], [6, 7], [5, 8], [8, 9], [4, 9], [2, 5],
  ];
  return (
    <svg
      viewBox="0 0 400 260"
      fill="none"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.2 : 1.4} fill="currentColor" fillOpacity="0.85" />
      ))}
    </svg>
  );
}
