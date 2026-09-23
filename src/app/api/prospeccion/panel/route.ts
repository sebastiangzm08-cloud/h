import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/servidor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ==========================================================================
   Datos para el Artifact "Panel de prospección" (pedido por Sebastián,
   2026-09-22): un resumen en vivo de correos enviados, respuestas y estado
   general, sin tener que entrar a Supabase ni correr un script cada vez.

   Reusa `prospeccion_ajustes.secreto` — el MISMO token que ya protege los
   enlaces de Aprobar/Descartar/Baja (`prospeccion_accion`) — en vez de
   inventar un secreto nuevo. Es de solo lectura (nunca escribe nada), así
   que un GET con el secreto correcto alcanza; nada que mutar, nada que
   proteger con más que eso.

   CORS abierto a propósito: el Artifact corre en el iframe sandboxeado de
   claude.ai (origen que cambia), y el secreto ya es lo que protege los
   datos — no el origen de la petición.
   ========================================================================== */

function conCors(json: unknown, status = 200) {
  return NextResponse.json(json, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}

export async function OPTIONS() {
  return conCors({});
}

export async function GET(req: NextRequest) {
  const secreto = req.nextUrl.searchParams.get("secreto") ?? "";
  if (!secreto) {
    return conCors({ ok: false, error: "Falta el secreto." }, 401);
  }

  const admin = supabaseAdmin();

  const { data: ajustes, error: eAjustes } = await admin
    .from("prospeccion_ajustes")
    .select("secreto")
    .eq("id", 1)
    .maybeSingle();
  if (eAjustes || !ajustes || ajustes.secreto !== secreto) {
    return conCors({ ok: false, error: "Secreto incorrecto." }, 401);
  }

  const [{ data: resumen, error: eResumen }, { data: envios, error: eEnvios }, { data: respuestas, error: eRespuestas }] =
    await Promise.all([
      admin.rpc("prospeccion_resumen"),
      admin
        .from("prospeccion_envios")
        .select("id, paso, asunto, estado, enviado_en, message_id, prospeccion_prospectos(nombre, pais, nicho, correo)")
        .eq("estado", "enviado")
        .order("enviado_en", { ascending: false })
        .limit(40),
      admin
        .from("prospeccion_respuestas")
        .select("id, clasificacion, resumen, recibido_en, prospeccion_prospectos(nombre, pais, correo)")
        .order("recibido_en", { ascending: false })
        .limit(20),
    ]);

  if (eResumen || eEnvios || eRespuestas) {
    return conCors(
      { ok: false, error: (eResumen || eEnvios || eRespuestas)?.message ?? "Error leyendo la base." },
      500
    );
  }

  return conCors({
    ok: true,
    actualizado_en: new Date().toISOString(),
    resumen,
    envios: (envios ?? []).map((e) => {
      // El embed de Supabase para una relación a-uno lo tipa como arreglo
      // (no puede distinguirlo sin un tipo de base de datos generado) pero
      // en runtime es un solo objeto — de ahí el `[0]` en vez de acceder
      // directo a la propiedad.
      const p = Array.isArray(e.prospeccion_prospectos)
        ? e.prospeccion_prospectos[0]
        : e.prospeccion_prospectos;
      return {
        id: e.id,
        paso: e.paso,
        asunto: e.asunto,
        enviado_en: e.enviado_en,
        nombre: p?.nombre ?? "",
        pais: p?.pais ?? "",
        nicho: p?.nicho ?? "",
        correo: p?.correo ?? "",
      };
    }),
    respuestas: (respuestas ?? []).map((r) => {
      const p = Array.isArray(r.prospeccion_prospectos)
        ? r.prospeccion_prospectos[0]
        : r.prospeccion_prospectos;
      return {
        id: r.id,
        clasificacion: r.clasificacion,
        resumen: r.resumen,
        recibido_en: r.recibido_en,
        nombre: p?.nombre ?? "",
        pais: p?.pais ?? "",
        correo: p?.correo ?? "",
      };
    }),
  });
}
