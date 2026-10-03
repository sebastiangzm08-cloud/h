/* ==========================================================================
   Acciones genéricas del CLIENTE (fuera del entorno del Agente).

   NO SON Server Actions, por el mismo motivo que `admin-acciones.ts` y
   `agente-acciones.ts`: los Server Actions perdían la cookie de sesión en el
   POST (ver `project_proxy_refresca_sesion` en la memoria del proyecto). Un
   Route Handler normal sí la conserva. Las llama `/api/panel/[nombre]` por
   POST — el cableado HTTP vive ahí, acá solo el negocio.

   Cada una vuelve a comprobar sesión con `exigirCliente()` (cookie, `_token`
   del formulario como red de seguridad): es un endpoint POST público.
   ========================================================================== */
import { revalidatePath } from "next/cache";
import { supabaseConToken, supabaseServidor } from "@/lib/supabase/servidor";
import { exigirCliente } from "./agente-acciones";
import { getPerfil } from "./datos";

export type ResultadoPanel =
  /** `destino`: a dónde lleva el navegador cuando la acción salió bien. */
  | { ok: true; mensaje: string; destino?: string }
  | { ok: false; error: string };

export async function crearConsulta(
  _prev: ResultadoPanel | null,
  form: FormData
): Promise<ResultadoPanel> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const asunto = String(form.get("asunto") ?? "").trim().slice(0, 120);
  const texto = String(form.get("texto") ?? "").trim().slice(0, 4000);
  if (!asunto || !texto) {
    return { ok: false, error: "Poné un asunto y contanos qué necesitás." };
  }

  /* Las reglas RLS ya permiten al cliente crear su consulta y su primera
     línea (`mensajes_crear`, `lineas_crear` con autor='cliente'). Va con el
     cliente de la cookie; solo si la cookie no llegó y el `_token` del
     formulario sí validó, con ese token. Nunca con service_role. */
  const token = form.get("_token");
  const porCookie = Boolean((await getPerfil()).clienteId);
  const supabase =
    !porCookie && typeof token === "string" && token.length > 20
      ? supabaseConToken(token)
      : await supabaseServidor();

  const { data: m, error: eM } = await supabase
    .from("mensajes")
    .insert({ cliente_id: auth.clienteId, asunto, estado: "sin_responder" })
    .select("id")
    .single();
  if (eM || !m) return { ok: false, error: "No se pudo crear la consulta." };

  const { error: eL } = await supabase.from("mensajes_lineas").insert({
    mensaje_id: m.id,
    autor: "cliente",
    texto,
  });
  if (eL) {
    // Deshacer el hilo vacío.
    await supabase.from("mensajes").delete().eq("id", m.id);
    return { ok: false, error: "No se pudo enviar tu mensaje." };
  }

  revalidatePath("/panel/soporte");
  revalidatePath("/panel/admin/mensajes");
  return { ok: true, mensaje: "Consulta enviada.", destino: `/panel/soporte/${m.id}` };
}
