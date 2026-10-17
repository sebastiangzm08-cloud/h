/* ==========================================================================
   La conexión de WhatsApp de un cliente (token + número), leída con
   service_role. Vive aparte para que la usen tanto las acciones del agente
   (`agente-acciones.ts`) como los archivos de las conversaciones
   (`medios.ts`) sin que un archivo tenga que importar al otro.
   ========================================================================== */
import { supabaseAdmin } from "@/lib/supabase/servidor";

export type ConexionWhatsapp = { token: string; endpoint: string; phoneNumberId: string };

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
