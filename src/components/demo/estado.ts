/* ==========================================================================
   Estado de la sesión de la demo y lo que se puede MEDIR de ella.

   Todo lo que muestra el panel sale de acá: lo que la persona escribió, lo que
   el agente respondió, cuánto tardó de verdad. Ningún dato de relleno.
   ========================================================================== */
import type { Escalada, Herramienta } from "@/lib/demo/tipos";

export const ID_SALUDO = "saludo";

export type MensajeDemo = {
  id: string;
  autor: "prospecto" | "agente";
  texto: string;
  /** Hora ya formateada para mostrar. */
  hora: string;
  leido?: boolean;
  /** El mensaje no llegó a enviarse (error de red o del servidor). */
  fallo?: boolean;
  /** Solo agente: lo que consultó, deducido de lo que dijo. */
  herramientas?: Herramienta[];
  /** Solo agente: el caso pasó a una persona. */
  escalada?: Escalada;
  /** Solo agente: lo que tardó la persona en ver la respuesta (medido). */
  ms?: number;
};

export type CitaFila = {
  id: string;
  estado: "propuesta" | "confirmada";
  servicio: string;
  horario: string;
  hora: string;
};

export type SubVista = "conversaciones" | "agenda" | "resultados";

export type Novedades = Record<SubVista, number>;

export const SIN_NOVEDADES: Novedades = { conversaciones: 0, agenda: 0, resultados: 0 };

export function horaAhora() {
  return new Date().toLocaleTimeString("es-CR", { hour: "numeric", minute: "2-digit" });
}

export function segundosTexto(ms: number) {
  return `${(ms / 1000).toLocaleString("es-CR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} s`;
}

export type Metricas = {
  respondidos: number;
  tiempos: number[];
  promedioMs: number | null;
  masRapidaMs: number | null;
  masLentaMs: number | null;
  aPersona: number;
  citasConfirmadas: number;
  citasPorConfirmar: number;
  herramientas: Record<Herramienta, number>;
};

/** Resume la sesión. Los mensajes del saludo de bienvenida no cuentan. */
export function calcularMetricas(mensajes: MensajeDemo[], citas: CitaFila[]): Metricas {
  const agente = mensajes.filter((m) => m.autor === "agente" && m.id !== ID_SALUDO);
  const tiempos = agente.map((m) => m.ms).filter((n): n is number => typeof n === "number");
  const herramientas: Record<Herramienta, number> = { servicios: 0, precios: 0, horario: 0, agenda: 0 };
  for (const m of agente) for (const h of m.herramientas ?? []) herramientas[h] += 1;

  return {
    respondidos: agente.length,
    tiempos,
    promedioMs: tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : null,
    masRapidaMs: tiempos.length ? Math.min(...tiempos) : null,
    masLentaMs: tiempos.length ? Math.max(...tiempos) : null,
    aPersona: agente.filter((m) => m.escalada).length,
    citasConfirmadas: citas.filter((c) => c.estado === "confirmada").length,
    citasPorConfirmar: citas.filter((c) => c.estado === "propuesta").length,
    herramientas,
  };
}

/** Cada ficha de la lista de conversaciones sale de esto. */
export function resumirConversacion(mensajes: MensajeDemo[], citas: CitaFila[]) {
  const hilo = mensajes.filter((m) => m.id !== ID_SALUDO && !m.fallo);
  if (hilo.length === 0) return null;
  const ultimo = hilo[hilo.length - 1];
  const espera = hilo.some((m) => m.escalada);
  const herramientas: Record<string, number> = {};
  for (const m of hilo) for (const h of m.herramientas ?? []) herramientas[h] = (herramientas[h] ?? 0) + 1;
  return {
    hilo,
    ultimo,
    estado: espera ? ("espera" as const) : ("agente" as const),
    herramientas,
    conCita: citas.some((c) => c.estado === "confirmada"),
  };
}
