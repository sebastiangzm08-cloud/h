/* ==========================================================================
   Tema claro/oscuro del panel — "cada quien elige el suyo" (Sebastián,
   2026-09-14). Vive en localStorage porque es una preferencia del
   NAVEGADOR de quien mira, no un dato del negocio — no hace falta
   guardarla en Supabase ni sincronizarla entre dispositivos.
   ========================================================================== */
export type Tema = "claro" | "oscuro" | "automatico";

export const TEMA_STORAGE_KEY = "hoshizora-tema";

export function esTema(v: unknown): v is Tema {
  return v === "claro" || v === "oscuro" || v === "automatico";
}

/* Corre ANTES de que React hidrate (se inyecta como <script> plano, ver
   `TemaSelector`) — el servidor no sabe qué eligió este navegador, así que
   sin esto habría un parpadeo del tema por defecto (oscuro) antes de saltar
   al que la persona ya había elegido. Se aplica sobre `.panel-scope`, el
   mismo nodo que ya define los tokens de color — nunca sobre `<html>`. */
export const SCRIPT_APLICAR_TEMA = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  TEMA_STORAGE_KEY
)});var el=document.querySelector('.panel-scope');if(el&&(t==='claro'||t==='automatico'||t==='oscuro'))el.setAttribute('data-tema',t);}catch(e){}})();`;
