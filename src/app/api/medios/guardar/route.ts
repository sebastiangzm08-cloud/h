/* ==========================================================================
   n8n avisa acá apenas entra un mensaje con archivo (foto, video, sticker,
   nota de voz o documento), para guardarlo antes de que Meta lo borre a los
   7 días. Ver `lib/panel/medios.ts`.

   No es una ruta del panel: no hay sesión. Se protege con el secreto
   compartido `N8N_WEBHOOK_SECRET` en la cabecera `x-hoshizora-secreto`.

   Cuerpo: { "wa_id": "wamid…" }  → guarda el archivo de ese mensaje.
           { "pendientes": true } → barre los que quedaron sin guardar.
   ========================================================================== */
import { NextResponse } from "next/server";
import { guardarArchivoPorWaId, guardarArchivosPendientes } from "@/lib/panel/medios";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secreto = process.env.N8N_WEBHOOK_SECRET;
  if (!secreto) {
    return NextResponse.json({ ok: false, error: "Falta N8N_WEBHOOK_SECRET en el servidor." }, { status: 503 });
  }
  if (req.headers.get("x-hoshizora-secreto") !== secreto) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  const cuerpo = (await req.json().catch(() => ({}))) as { wa_id?: unknown; pendientes?: unknown };

  if (cuerpo.pendientes === true) {
    return NextResponse.json({ ok: true, ...(await guardarArchivosPendientes()) });
  }
  if (typeof cuerpo.wa_id !== "string" || !cuerpo.wa_id) {
    return NextResponse.json({ ok: false, error: "Falta wa_id." }, { status: 400 });
  }

  const resultado = await guardarArchivoPorWaId(cuerpo.wa_id);
  return NextResponse.json(resultado, { status: resultado.ok ? 200 : 422 });
}
