/* ==========================================================================
   Formato de fechas del entorno del agente — SIN ningún import de Supabase
   ni de `next/headers`. Vive aparte de `agente.ts` a propósito: ese archivo
   trae `supabaseServidor()` colgado, y un componente cliente que importe
   aunque sea una sola función de ahí arrastra todo ese árbol al bundle del
   navegador y rompe el build ("You're importing next/headers in a Client
   Component"). Estas tres son puras, así que las puede usar cualquiera.
   ========================================================================== */

/* Costa Rica fijo, sin horario de verano — igual que el resto del proyecto
   (n8n, `agendarCitaManual`). SIN esto, `toLocaleTimeString`/`getDay()`
   usan la zona horaria del SERVIDOR (normalmente UTC en el VPS), no la de
   Costa Rica: una cita guardada correctamente a las 8 a.m. se mostraba acá
   como "2:00 p.m." — encontrado probando en vivo con citas reales, la hora
   SÍ se guardaba bien, solo se leía mal. */
const ZONA_CR = "America/Costa_Rica";

export function hora(iso: string) {
  return new Date(iso)
    .toLocaleTimeString("es-CR", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: ZONA_CR })
    .replace(/\s?a\.?\s?m\.?/i, " a.m.")
    .replace(/\s?p\.?\s?m\.?/i, " p.m.");
}

export function relativa(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? "ayer" : `hace ${d} días`;
}

const DIA_EN_A_ES: Record<string, string> = {
  Sun: "Dom", Mon: "Lun", Tue: "Mar", Wed: "Mié", Thu: "Jue", Fri: "Vie", Sat: "Sáb",
};

export function fechaCorta(iso: string) {
  const d = new Date(iso);
  // `en-US` porque su abreviatura de 3 letras es estable para mapear ("Mon",
  // "Tue"…); el nombre en español final sale del diccionario de arriba.
  const diaEn = new Intl.DateTimeFormat("en-US", { timeZone: ZONA_CR, weekday: "short" }).format(d);
  const diaNum = new Intl.DateTimeFormat("en-US", { timeZone: ZONA_CR, day: "numeric" }).format(d);
  return `${DIA_EN_A_ES[diaEn] ?? diaEn} ${diaNum} · ${hora(iso)}`;
}

export const VERTICALES_WHATSAPP = [
  { valor: "HEALTH", texto: "Salud" },
  { valor: "BEAUTY", texto: "Belleza" },
  { valor: "PROF_SERVICES", texto: "Servicios profesionales" },
  { valor: "RESTAURANT", texto: "Restaurante" },
  { valor: "RETAIL", texto: "Comercio / tienda" },
  { valor: "EDU", texto: "Educación" },
  { valor: "AUTO", texto: "Automotriz" },
  { valor: "APPAREL", texto: "Ropa" },
  { valor: "ENTERTAIN", texto: "Entretenimiento" },
  { valor: "EVENT_PLAN", texto: "Eventos" },
  { valor: "FINANCE", texto: "Finanzas" },
  { valor: "GROCERY", texto: "Abarrotes" },
  { valor: "HOTEL", texto: "Hotel" },
  { valor: "TRAVEL", texto: "Viajes" },
  { valor: "OTHER", texto: "Otro" },
] as const;

export type PerfilWhatsapp =
  | { estado: "sin_conectar" }
  | { estado: "error"; detalle: string }
  | {
      estado: "ok";
      about: string;
      descripcion: string;
      direccion: string;
      correo: string;
      sitio: string;
      vertical: string;
      fotoUrl: string;
    };
