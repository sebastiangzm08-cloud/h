"use server";

/* ==========================================================================
   Guardar el formulario "¿cómo está tu negocio?".

   Escribe todo en `clientes.perfil_negocio` (jsonb) y además rellena los
   campos sueltos que ya usan otras pantallas y n8n (`descripcion_corta`,
   `tono_base`, `que_nunca_decir`). Marca `onboarding_completo = true`.

   El cliente puede editar su propia fila de `clientes` (política RLS
   `clientes_editar`), así que no hace falta el cliente admin.
   ========================================================================== */
import { revalidatePath } from "next/cache";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { getPerfil } from "./datos";
import type { PerfilNegocio } from "./tipos";

export type ResultadoPerfil =
  | { ok: true; mensaje: string }
  | { ok: false; error: string };

function recortar(v: FormDataEntryValue | null, max = 1200): string {
  return String(v ?? "").trim().slice(0, max);
}

export async function guardarPerfilNegocio(
  _prev: ResultadoPerfil | null,
  form: FormData
): Promise<ResultadoPerfil> {
  const perfil = await getPerfil();
  if (!perfil.clienteId) {
    return { ok: false, error: "Tu cuenta no está ligada a un negocio." };
  }

  const p: PerfilNegocio = {
    queVendes: recortar(form.get("queVendes")),
    quienCompra: recortar(form.get("quienCompra")),
    queTeDiferencia: recortar(form.get("queTeDiferencia")),
    voz: recortar(form.get("voz"), 40) || "cercano",
    trato: form.get("trato") === "usted" ? "usted" : "vos",
    queNuncaDecir: recortar(form.get("queNuncaDecir")),
    promosActivas: recortar(form.get("promosActivas")),
    ejemplosTexto: recortar(form.get("ejemplosTexto"), 2000),
    links: recortar(form.get("links"), 500),
  };

  if (!p.queVendes) {
    return { ok: false, error: "Contanos al menos qué vendés." };
  }

  const supabase = await supabaseServidor();
  const { error } = await supabase
    .from("clientes")
    .update({
      perfil_negocio: p,
      onboarding_completo: true,
      // Copias sueltas para las pantallas y n8n que ya las leen.
      descripcion_corta: p.queVendes.slice(0, 300),
      tono_base: `${p.voz}, trato de ${p.trato}`,
      que_nunca_decir: p.queNuncaDecir || null,
    })
    .eq("id", perfil.clienteId);

  if (error) {
    return { ok: false, error: "No se pudo guardar. Probá de nuevo." };
  }

  revalidatePath("/panel");
  revalidatePath("/panel/perfil");

  return { ok: true, mensaje: "Guardado. La IA ya escribe con esta info." };
}
