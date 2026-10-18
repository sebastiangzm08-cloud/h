/* ==========================================================================
   Mensajes automáticos del agente que dispara el reloj de n8n (cada 30 min).
   No es una ruta del panel: se protege con `N8N_WEBHOOK_SECRET` en la
   cabecera `x-hoshizora-secreto`, igual que `/api/medios/guardar`.

   Lista explícita de tareas: un nombre que no está acá da 404.
   Cuerpo opcional: { "simular": true } → decide pero no manda nada.
   ========================================================================== */
import { NextResponse } from "next/server";
import { correrReactivaciones, correrResenas, correrSeguimientos } from "@/lib/panel/automatizaciones";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const TAREAS: Record<string, (o: { simular?: boolean; forzar?: boolean }) => Promise<unknown>> = {
  seguimiento: correrSeguimientos,
  resenas: correrResenas,
  reactivar: correrReactivaciones,
};

export async function POST(req: Request, { params }: { params: Promise<{ nombre: string }> }) {
  const secreto = process.env.N8N_WEBHOOK_SECRET;
  if (!secreto) return NextResponse.json({ ok: false, error: "Falta N8N_WEBHOOK_SECRET en el servidor." }, { status: 503 });
  if (req.headers.get("x-hoshizora-secreto") !== secreto) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  const { nombre } = await params;
  const tarea = TAREAS[nombre];
  if (!tarea) return NextResponse.json({ ok: false, error: "Tarea desconocida." }, { status: 404 });

  const cuerpo = (await req.json().catch(() => ({}))) as { simular?: unknown; forzar?: unknown };
  // "forzar" (saltarse el horario) solo vale junto con "simular": para probar sin mandar nada.
  const resultado = await tarea({ simular: cuerpo.simular === true, forzar: cuerpo.forzar === true });
  return NextResponse.json({ ok: true, ...(resultado as object) });
}
