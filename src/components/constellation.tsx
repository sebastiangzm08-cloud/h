/* La animación arranca en el nodo grande del centro (15,9) y de ahí salen las
   tres líneas hacia afuera, a la vez y a velocidad constante, así que llegan
   una tras otra según su distancia: derecha → abajo derecha → abajo izquierda.
   Cada nodo del extremo se enciende poco antes de que llegue su línea. Todo
   dura ~1,1 s y se ve UNA vez. */
const SEG_POR_UNIDAD = 0.0267; // segundos por unidad de largo del trazo
const SALE_EN = 0.18; // el nodo central ya está creciendo cuando salen las líneas
const EASE_LINEA = "cubic-bezier(0.4, 0, 0.2, 1)";

const RAMAS = [
  { d: "M15 9L26 13", largo: 11.7, nodo: { cx: 26, cy: 13, r: 1.75 } },
  { d: "M15 9L21 22", largo: 14.32, nodo: { cx: 21, cy: 22, r: 1.75 } },
  { d: "M15 9L6 24", largo: 17.49, nodo: { cx: 6, cy: 24, r: 2 } },
] as const;

/**
 * Motivo gráfico de marca: nodos conectados por líneas finas — un nodo central
 * con tres líneas hacia otros tres nodos. Reutilizado como logo, favicon,
 * textura de fondo y diagramas de flujo de producto. Puramente decorativo:
 * aria-hidden.
 *
 * `animate`: la dibuja desde el nodo central hacia afuera. Pensado para un
 * momento puntual (el logo al cargar la página, la ilustración del 404), no
 * para verse en bucle. Sin `animate` es el dibujo estático de siempre.
 */
export function ConstellationMark({
  className,
  animate = false,
}: {
  className?: string;
  animate?: boolean;
}) {
  if (!animate) {
    return (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
        <path d="M6 24L15 9L26 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M15 9L21 22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="6" cy="24" r="2" fill="currentColor" />
        <circle cx="15" cy="9" r="2.25" fill="currentColor" />
        <circle cx="26" cy="13" r="1.75" fill="currentColor" />
        <circle cx="21" cy="22" r="1.75" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      {RAMAS.map((r) => (
        <path
          key={r.d}
          d={r.d}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          pathLength={100}
          className="trazo-construye"
          style={{
            animationDuration: `${(r.largo * SEG_POR_UNIDAD).toFixed(3)}s`,
            animationDelay: `${SALE_EN}s`,
            animationTimingFunction: EASE_LINEA,
          }}
        />
      ))}
      <circle cx="15" cy="9" r="2.25" fill="currentColor" className="punto-construye" />
      {RAMAS.map((r) => (
        <circle
          key={r.d}
          cx={r.nodo.cx}
          cy={r.nodo.cy}
          r={r.nodo.r}
          fill="currentColor"
          className="punto-construye"
          style={{
            animationDelay: `${(SALE_EN + r.largo * SEG_POR_UNIDAD * 0.85).toFixed(3)}s`,
          }}
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
