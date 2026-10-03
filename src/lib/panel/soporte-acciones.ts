"use server";

/* ==========================================================================
   Consultas de soporte — lado del cliente.

   El cliente responde en sus consultas (crear una nueva ya NO está acá: va
   por `/api/panel/crearConsulta`, ver `panel-acciones.ts`). Las reglas
   RLS ya lo permiten (`mensajes_crear`, `lineas_crear` con autor='cliente'),
   así que va con el cliente normal de servidor — sin service_role.
   ========================================================================== */
import { revalidatePath } from "next/cache";
import { supabaseAdmin, supabaseServidor } from "@/lib/supabase/servidor";
import { getPerfil } from "./datos";

export type ResultadoConsulta =
  | { ok: true; mensaje: string }
  | { ok: false; error: string };

export async function responderConsulta(
  _prev: ResultadoConsulta | null,
  form: FormData
): Promise<ResultadoConsulta> {
  const perfil = await getPerfil();
  if (!perfil.clienteId) return { ok: false, error: "No autorizado." };

  const mensajeId = String(form.get("mensajeId") ?? "");
  const texto = String(form.get("texto") ?? "").trim().slice(0, 4000);
  if (!mensajeId || !texto) return { ok: false, error: "Escribí algo primero." };

  const supabase = await supabaseServidor();

  // Comprobar que el hilo es de este cliente antes de nada.
  const { data: hilo } = await supabase
    .from("mensajes")
    .select("id")
    .eq("id", mensajeId)
    .eq("cliente_id", perfil.clienteId)
    .maybeSingle();
  if (!hilo) return { ok: false, error: "Esa consulta no es tuya." };

  const { error } = await supabase.from("mensajes_lineas").insert({
    mensaje_id: mensajeId,
    autor: "cliente",
    texto,
  });
  if (error) return { ok: false, error: "No se pudo enviar. Probá de nuevo." };

  // Vuelve a "sin responder" para que el admin sepa que le toca. El cliente
  // no puede tocar `mensajes` por RLS, así que este bump va con service_role
  // (ya se verificó arriba que el hilo es suyo).
  await supabaseAdmin()
    .from("mensajes")
    .update({ estado: "sin_responder" })
    .eq("id", mensajeId)
    .neq("estado", "sin_responder");

  revalidatePath(`/panel/soporte/${mensajeId}`);
  revalidatePath("/panel/admin/mensajes");
  return { ok: true, mensaje: "Enviado." };
}
