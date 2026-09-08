/* ==========================================================================
   La forma de `asignaciones.config` para la automatización de Redes, y cómo
   leerla con valores por defecto. Sin `"use server"` a propósito: acá viven
   el tipo y un helper síncrono; la acción que escribe está en
   `config-acciones.ts`.
   ========================================================================== */
export type ConfigRedes = {
  tono: string;
  hashtags: boolean;
  emojis: boolean;
  textoPorRed: boolean;
  largo: "corto" | "medio" | "largo";
};

export const CONFIG_REDES_VACIA: ConfigRedes = {
  tono: "",
  hashtags: true,
  emojis: true,
  textoPorRed: true,
  largo: "medio",
};

/** Lee el jsonb crudo y rellena lo que falte con los valores por defecto. */
export function leerConfigRedes(raw: unknown): ConfigRedes {
  const c = (raw ?? {}) as Record<string, unknown>;
  return {
    tono: typeof c.tono === "string" ? c.tono : "",
    hashtags: c.hashtags !== false,
    emojis: c.emojis !== false,
    textoPorRed: c.textoPorRed !== false,
    largo: (["corto", "medio", "largo"].includes(String(c.largo))
      ? c.largo
      : "medio") as ConfigRedes["largo"],
  };
}
