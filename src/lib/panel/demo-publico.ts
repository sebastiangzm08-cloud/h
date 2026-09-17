/* ==========================================================================
   Lectura PÚBLICA de una demo, para /demo/[slug] y su API de chat.

   A propósito NO pasa por `soyAdmin()` como el resto de admin.ts: quien pide
   esto es un prospecto sin sesión, no Sebastian. Por eso usa `supabaseAdmin()`
   (service_role) filtrado por el slug exacto — nunca expone un SELECT
   público sobre toda la tabla `demos` (eso dejaría ver el nombre de CADA
   prospecto al que le manda un link a cualquiera que lo pruebe).
   ========================================================================== */
import { supabaseAdmin } from "@/lib/supabase/servidor";

export type DemoPublica = {
  id: string;
  slug: string;
  nombreNegocio: string;
  rubro: string;
  trato: "usted" | "vos";
  estilo: string;
  emojis: "ninguno" | "pocos" | "varios";
  servicios: string;
  horario: string;
  notaExtra: string;
  mensajesTope: number;
  mensajesUsados: number;
  activo: boolean;
};

export async function getDemoPublicaPorSlug(slug: string): Promise<DemoPublica | null> {
  if (!slug) return null;

  const { data, error } = await supabaseAdmin()
    .from("demos")
    .select(
      "id, slug, nombre_negocio, rubro, trato, estilo, emojis, servicios, horario, nota_extra, mensajes_tope, mensajes_usados, activo"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    nombreNegocio: data.nombre_negocio,
    rubro: data.rubro,
    trato: data.trato === "vos" ? "vos" : "usted",
    estilo: data.estilo,
    emojis:
      data.emojis === "ninguno" || data.emojis === "varios" ? data.emojis : "pocos",
    servicios: data.servicios,
    horario: data.horario,
    notaExtra: data.nota_extra,
    mensajesTope: data.mensajes_tope,
    mensajesUsados: data.mensajes_usados,
    activo: data.activo,
  };
}
