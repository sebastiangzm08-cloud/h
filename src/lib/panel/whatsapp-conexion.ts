/* ==========================================================================
   La conexión de WhatsApp de un cliente (token + número), leída con
   service_role. Vive aparte para que la usen tanto las acciones del agente
   (`agente-acciones.ts`) como los archivos de las conversaciones
   (`medios.ts`) sin que un archivo tenga que importar al otro.
   ========================================================================== */
import { supabaseAdmin } from "@/lib/supabase/servidor";

export type ConexionWhatsapp = { token: string; endpoint: string; phoneNumberId: string };

/** Manda un texto libre por la API de Meta (solo vale dentro de las 24 h desde el último mensaje de la persona). */
export async function enviarTextoWhatsapp(
  conexion: ConexionWhatsapp,
  telefono: string,
  texto: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${conexion.endpoint}/${conexion.phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${conexion.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: telefono.replace("+", ""),
        type: "text",
        text: { preview_url: false, body: texto },
      }),
    });
    if (!res.ok) return { ok: false, error: `Meta respondió ${res.status}: ${(await res.text()).slice(0, 200)}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** El `detalle` de la conexión de WhatsApp de un cliente, ya validado. */
export async function detalleWhatsapp(clienteId: string): Promise<ConexionWhatsapp | null> {
  const sb = supabaseAdmin();
  const { data: conexion } = await sb
    .from("conexiones")
    .select("detalle")
    .eq("cliente_id", clienteId)
    .eq("servicio", "whatsapp")
    .maybeSingle();

  const detalle = (conexion?.detalle ?? {}) as {
    token?: string;
    endpoint?: string;
    phone_number_id?: string;
  };
  if (!detalle.token || !detalle.phone_number_id) return null;

  return {
    token: detalle.token,
    endpoint: detalle.endpoint || "https://graph.facebook.com/v21.0",
    phoneNumberId: detalle.phone_number_id,
  };
}
