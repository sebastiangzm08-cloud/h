/**
 * Motivo gráfico de marca: nodos conectados por líneas finas.
 * Reutilizado como logo, textura de fondo y diagramas de flujo de producto.
 * Puramente decorativo: aria-hidden.
 */
export function ConstellationMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M6 24L15 9L26 13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M15 9L21 22"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="6" cy="24" r="2" fill="currentColor" />
      <circle cx="15" cy="9" r="2.25" fill="currentColor" />
      <circle cx="26" cy="13" r="1.75" fill="currentColor" />
      <circle cx="21" cy="22" r="1.75" fill="currentColor" />
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
