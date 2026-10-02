/* ==========================================================================
   Textos que las acciones rápidas ponen en la caja de escribir.

   Funciones puras, sin imports de servidor (las usan componentes cliente).
   El mensaje sale con el trato (usted / vos) que el cliente eligió en
   "Cómo responde", para que suene igual que el resto de las respuestas. Es
   solo un punto de partida: la persona lo edita antes de enviarlo.
   ========================================================================== */
import type { DiaLibre, ServicioChat } from "@/lib/panel/conversaciones";

type Trato = "usted" | "vos";

/** 25000 → "₡25.000". A mano, para que salga igual en servidor y navegador. */
export function colonesTexto(n: number) {
  return "₡" + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** "₡25.000", "sin costo" o "" si no hay precio cargado. */
export function precioTexto(monto: number | null) {
  if (monto == null) return "";
  return monto === 0 ? "sin costo" : colonesTexto(monto);
}

/** "40 min", "1 h", "1 h 30 min" */
export function duracionTexto(min: number | null) {
  if (!min || min <= 0) return "";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  return resto ? `${h} h ${resto} min` : `${h} h`;
}

/** "Limpieza dental: ₡25.000 (40 min)" */
export function lineaServicio(s: ServicioChat) {
  const precio = precioTexto(s.monto);
  const dur = duracionTexto(s.duracionMin);
  return `${s.clave}${precio ? `: ${precio}` : ""}${dur ? ` (${dur})` : ""}`;
}

export function textoServicios(servicios: ServicioChat[]) {
  if (servicios.length === 1) return lineaServicio(servicios[0]);
  return `Estos son nuestros servicios:\n${servicios.map((s) => `• ${lineaServicio(s)}`).join("\n")}`;
}

/** Lo que se le escribe a la persona con los horarios que se tocaron. */
export function textoHorarios(
  servicio: string,
  elegidos: { dia: DiaLibre; horas: string[] }[],
  trato: Trato
) {
  const lista = elegidos
    .filter((e) => e.horas.length > 0)
    .map((e) => `• ${e.dia.etiqueta}: ${e.horas.join(", ")}`)
    .join("\n");
  const pregunta = trato === "vos" ? "¿Cuál te queda mejor?" : "¿Cuál le queda mejor?";
  return `Tenemos espacio para ${servicio}:\n${lista}\n${pregunta}`;
}

/** "María Jiménez" → "MJ". Sin nombre → "··". */
export function iniciales(nombre: string) {
  const p = nombre.trim().split(/\s+/).filter((x) => /^\p{L}/u.test(x));
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "··";
}

/** "30 sep 2026", en hora de Costa Rica. */
export function fechaTexto(iso: string) {
  const partes = new Intl.DateTimeFormat("es-CR", {
    timeZone: "America/Costa_Rica",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatToParts(new Date(iso));
  const dato = (tipo: string) => (partes.find((p) => p.type === tipo)?.value ?? "").replace(/\.$/, "");
  return `${dato("day")} ${dato("month")} ${dato("year")}`;
}
