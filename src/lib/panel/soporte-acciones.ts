"use server";

/* ==========================================================================
   Consultas de soporte — lado del cliente.

   El cliente puede crear una consulta y responder en las suyas. Las reglas
   RLS ya lo permiten (`mensajes_crear`, `lineas_crear` con autor='cliente'),
   así que va con el cliente normal de servidor — sin service_role.
   ========================================================================== */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin, supabaseServidor } from "@/lib/supabase/servidor";
import { getPerfil } from "./datos";

export type ResultadoConsulta =
  | { ok: true; mensaje: string }
  | { ok: false; error: string };

export async function crearConsulta(
  _prev: ResultadoConsulta | null,
  form: FormData
): Promise<ResultadoConsulta> {
  const perfil = await getPerfil();
  if (!perfil.clienteId) {
    return { ok: false, error: "Tu cuenta no está ligada a un negocio." };
  }

  const asunto = String(form.get("asunto") ?? "").trim().slice(0, 120);
  const texto = String(form.get("texto") ?? "").trim().slice(0, 4000);
  if (!asunto || !texto) {
    return { ok: false, error: "Poné un asunto y contanos qué necesitás." };
  }

  const supabase = await supabaseServidor();
  const { data: m, error: eM } = await supabase
    .from("mensajes")
    .insert({ cliente_id: perfil.clienteId, asunto, estado: "sin_responder" })
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
  redirect(`/panel/soporte/${m.id}`);
}

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
