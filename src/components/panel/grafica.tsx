/* ==========================================================================
   Gráfica de área de la actividad. Se dibuja en el servidor: sale entera en
   el primer render, sin esperar JavaScript ni un observador de scroll.

   Sin librería. Son catorce puntos y una escala — traer 40 kB de charting
   para esto sería peor.
   ========================================================================== */
import type { PuntoUso } from "@/lib/panel/tipos";

const CAJA = { ancho: 690, alto: 224 };
const AREA = { x0: 44, x1: 660, y0: 16, y1: 184 };

/** Redondea el tope hacia arriba a algo legible: 41 → 45, 96 → 100. */
function topeLegible(max: number) {
  if (max <= 10) return 10;
  const magnitud = Math.pow(10, Math.floor(Math.log10(max)));
  const paso = magnitud / 2;
  return Math.ceil(max / paso) * paso;
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "set", "oct", "nov", "dic"];

function etiquetaFecha(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

export function GraficaUso({
  puntos,
  etiquetaFinal,
}: {
  puntos: PuntoUso[];
  /** Ej: "hoy · 31". Va pegada al último punto. */
  etiquetaFinal: string;
}) {
  if (puntos.length < 2) return null;

  const tope = topeLegible(Math.max(...puntos.map((p) => p.valor)));
  const paso = (AREA.x1 - AREA.x0) / (puntos.length - 1);
  const alturaUtil = AREA.y1 - AREA.y0;

  const coords = puntos.map((p, i) => ({
    x: AREA.x0 + i * paso,
    y: AREA.y1 - (p.valor / tope) * alturaUtil,
  }));

  const linea = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const area = `M${AREA.x0},${AREA.y1} L${linea.split(" ").join(" L")} L${AREA.x1},${AREA.y1} Z`;
  const ultimo = coords[coords.length - 1];

  /* Tres líneas de referencia: 0, mitad y tope. Más que eso es ruido. */
  const guias = [0, tope / 2, tope].map((v) => ({
    valor: v,
    y: AREA.y1 - (v / tope) * alturaUtil,
  }));

  return (
    <div className="[&_text]:font-mono [&_text]:text-[10px] [&_text]:fill-[var(--color-ink-faint)] [&_text]:tabular-nums">
      <svg
        viewBox={`0 0 ${CAJA.ancho} ${CAJA.alto}`}
        className="block h-auto w-full"
        role="img"
        aria-label={`Acciones automatizadas por día en los últimos ${puntos.length} días. Último dato: ${etiquetaFinal}.`}
      >
        <defs>
          <linearGradient id="relleno-uso" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.10" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {guias.map((g) => (
          <g key={g.valor}>
            <line
              x1={AREA.x0}
              y1={g.y}
              x2={AREA.x1 + 8}
              y2={g.y}
              stroke={g.valor === 0 ? "var(--color-line-strong)" : "var(--color-line)"}
              strokeWidth="1"
            />
            <text x={AREA.x0 - 10} y={g.y + 4} textAnchor="end">
              {g.valor}
            </text>
          </g>
        ))}

        <path d={area} fill="url(#relleno-uso)" />
        <polyline
          points={linea}
          fill="none"
          stroke="var(--color-ink-soft)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx={ultimo.x} cy={ultimo.y} r="7" fill="#ffffff" fillOpacity="0.12" />
        <circle cx={ultimo.x} cy={ultimo.y} r="3.5" fill="#ffffff" />

        <text x={AREA.x0} y="206" textAnchor="start">
          {etiquetaFecha(puntos[0].fecha)}
        </text>
        <text x={(AREA.x0 + AREA.x1) / 2} y="206" textAnchor="middle">
          {etiquetaFecha(puntos[Math.floor(puntos.length / 2)].fecha)}
        </text>
        <text x={AREA.x1 + 8} y="206" textAnchor="end">
          {etiquetaFinal}
        </text>
      </svg>
    </div>
  );
}
