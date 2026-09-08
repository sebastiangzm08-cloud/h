"use server";

/* ==========================================================================
   Configuración de la automatización de Redes, editable por el cliente.

   Escribe `asignaciones.config` (jsonb). La política RLS `asignaciones_config`
   deja al cliente actualizar SU asignación, así que va con el cliente normal
   de servidor. La acción solo manda `config` — ningún otro campo.

   El tipo y el helper de lectura viven en `redes-config.ts` (un archivo
   `"use server"` solo puede exportar funciones async).
   ========================================================================== */
import { revalidatePath } from "next/cache";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { getPerfil } from "./datos";
import type { ConfigRedes } from "./redes-config";

export type ResultadoConfig =
  | { ok: true; mensaje: string }
  | { ok: false; error: string };

export async function guardarConfigRedes(
  _prev: ResultadoConfig | null,
  form: FormData
): Promise<ResultadoConfig> {
  const perfil = await getPerfil();
  if (!perfil.clienteId) {
    return { ok: false, error: "Tu cuenta no está ligada a un negocio." };
  }

  const asignacionId = String(form.get("asignacionId") ?? "");
  if (!asignacionId) return { ok: false, error: "Falta la automatización." };

  const supabase = await supabaseServidor();
  const { data: asg } = await supabase
    .from("asignaciones")
    .select("id")
    .eq("id", asignacionId)
    .eq("cliente_id", perfil.clienteId)
    .maybeSingle();
  if (!asg) return { ok: false, error: "Esa automatización no es tuya." };

  const config: ConfigRedes = {
    tono: String(form.get("tono") ?? "").trim().slice(0, 600),
    hashtags: form.get("hashtags") === "on",
    emojis: form.get("emojis") === "on",
    textoPorRed: form.get("textoPorRed") === "on",
    largo: (["corto", "medio", "largo"].includes(String(form.get("largo")))
      ? form.get("largo")
      : "medio") as ConfigRedes["largo"],
  };

  const { error } = await supabase
    .from("asignaciones")
    .update({ config })
    .eq("id", asignacionId);
  if (error) return { ok: false, error: "No se pudo guardar. Probá de nuevo." };

  revalidatePath("/panel/automatizaciones/redes-sociales");
  return { ok: true, mensaje: "Guardado. La IA ya escribe con esta configuración." };
}
