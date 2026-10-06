/* ==========================================================================
   "Herramientas en uso" de la demo.

   Es la MISMA lógica determinista que corre en producción en n8n
   (`n8n-backups/herramientas/bloque.js`): se DEDUCE comparando lo que la
   respuesta REALMENTE dice con los servicios cargados; jamás de lo que el
   modelo diga de sí mismo. Si algo falla, queda vacío.

   Diferencia con producción: allá los servicios vienen estructurados
   (clave + monto) y acá la demo los guarda como texto libre ("uno por línea"),
   así que `parsearServicios` los separa primero.
   ========================================================================== */
import type { Herramienta } from "./tipos";

export type ServicioParseado = { clave: string; monto: number | null };

/* Espacios que es-CR usa dentro de un monto: normal, duro, fino y fino angosto. */
const ESPACIOS = "\\u00a0\\u202f\\u2009 ";
const RE_CON_SIMBOLO = new RegExp(`(?:₡|¢|\\$|CRC|USD)\\s*(\\d[\\d.,${ESPACIOS}]*\\d|\\d)`, "i");
const RE_SIN_SIMBOLO = new RegExp(
  `(\\d[\\d.,${ESPACIOS}]{2,}\\d)\\s*(?:colones|dolares|dólares)?\\s*$`,
  "i"
);
const RE_MONTO_PARTIDO = new RegExp(`(\\d{1,3})[${ESPACIOS}](\\d{3})(?!\\d)`, "g");

export function sinTildes(t: unknown): string {
  return String(t == null ? "" : t)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Separa el texto libre de `servicios` en ítems. "Uno por línea"; si todo vino
 * en una sola línea se parte por coma, punto y coma o viñeta (sin cortar un
 * "25,000").
 */
export function parsearServicios(texto: string): ServicioParseado[] {
  const lineas = String(texto ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const items = lineas.length > 1 ? lineas : (lineas[0] ?? "").split(/[;•·|]|,(?!\d{3}\b)/);

  const resultado: ServicioParseado[] = [];
  for (const crudo of items) {
    const item = crudo.trim().replace(/^[-–—*•\s]+/, "");
    if (!item) continue;

    let monto: number | null = null;
    let resto = item;
    const hallado = item.match(RE_CON_SIMBOLO) ?? item.match(RE_SIN_SIMBOLO);
    if (hallado) {
      const n = Number(hallado[1].replace(/[^\d]/g, ""));
      if (n > 0) monto = n;
      resto = item.replace(hallado[0], " ");
    }
    const clave = resto
      .replace(/\([^)]*\)/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[\s\-–—:·.,]+$/g, "")
      .trim();
    if (clave.length >= 3) resultado.push({ clave, monto });
  }
  return resultado;
}

/** Hasta `max` nombres de servicio, para las sugerencias de la pantalla. */
export function nombresDeServicios(texto: string, max = 3): string[] {
  return parsearServicios(texto)
    .map((s) => s.clave)
    .slice(0, max);
}

export function deducirHerramientas({
  respuesta,
  servicios,
  citaConfirmada,
  intentoAgendar,
}: {
  respuesta: string;
  servicios: ServicioParseado[];
  citaConfirmada: boolean;
  intentoAgendar: boolean;
}): Herramienta[] {
  try {
    const texto = sinTildes(respuesta);
    const herr = new Set<Herramienta>();

    if (servicios.some((s) => s.clave && texto.includes(sinTildes(s.clave)))) herr.add("servicios");

    const montos = servicios.map((s) => Number(s.monto)).filter((m) => m > 0);
    /* es-CR escribe ₡25 000 con un espacio fino: se junta antes de leer los números. */
    const plano = String(respuesta).replace(RE_MONTO_PARTIDO, "$1$2");
    const numeros = (plano.match(/\d[\d.,]*/g) || []).map((n) => n.replace(/[.,]/g, ""));
    if (montos.some((m) => numeros.includes(String(m)))) herr.add("precios");

    if (/\b(horario|abrimos|atendemos|cerramos|abierto|abiertos)\b/.test(texto)) herr.add("horario");
    if (citaConfirmada || intentoAgendar || /\b(cita|agendar|agendada|reservar|reserva)\b/.test(texto)) {
      herr.add("agenda");
    }
    return [...herr];
  } catch {
    return [];
  }
}
