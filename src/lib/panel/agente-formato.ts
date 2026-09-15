/* ==========================================================================
   Formato de fechas del entorno del agente — SIN ningún import de Supabase
   ni de `next/headers`. Vive aparte de `agente.ts` a propósito: ese archivo
   trae `supabaseServidor()` colgado, y un componente cliente que importe
   aunque sea una sola función de ahí arrastra todo ese árbol al bundle del
   navegador y rompe el build ("You're importing next/headers in a Client
   Component"). Estas tres son puras, así que las puede usar cualquiera.
   ========================================================================== */

export function hora(iso: string) {
  return new Date(iso)
    .toLocaleTimeString("es-CR", { hour: "numeric", minute: "2-digit", hour12: true })
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

export function fechaCorta(iso: string) {
  const d = new Date(iso);
  const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return `${dias[d.getDay()]} ${d.getDate()} · ${hora(iso)}`;
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
