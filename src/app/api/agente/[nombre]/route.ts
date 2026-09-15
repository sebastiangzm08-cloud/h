/* ==========================================================================
   Punto de entrada de TODAS las acciones del entorno del Agente de WhatsApp.
   Mismo patrón que `/api/admin/[nombre]`: lista explícita de acciones
   permitidas, nunca `import * as` — llamar a un nombre que no está acá da
   404, nunca ejecuta código al azar.
   ========================================================================== */
import { NextResponse } from "next/server";
import {
  agendarCitaManual,
  agregarConocimiento,
  alternarConocimiento,
  cancelarCita,
  cancelarRecordatorio,
  crearRecordatorio,
  descartarCorreccion,
  devolverAgente,
  devolverAgenteCorreo,
  eliminarConocimiento,
  ensenarCorreccion,
  enviarMensajeManual,
  enviarMensajeManualCorreo,
  guardarAgenda,
  iniciarCorreoNuevo,
  guardarConfigAgente,
  guardarPerfilWhatsapp,
  marcarCitaCumplida,
  subirFotoWhatsapp,
  tomarControl,
  tomarControlCorreo,
  type ResultadoAccion,
} from "@/lib/panel/agente-acciones";

type FnAccion = (
  prev: ResultadoAccion | null,
  form: FormData
) => Promise<ResultadoAccion>;

const ACCIONES: Record<string, FnAccion> = {
  enviarMensajeManual,
  tomarControl,
  devolverAgente,
  enviarMensajeManualCorreo,
  tomarControlCorreo,
  devolverAgenteCorreo,
  iniciarCorreoNuevo,
  ensenarCorreccion,
  descartarCorreccion,
  cancelarCita,
  marcarCitaCumplida,
  agendarCitaManual,
  guardarConfigAgente,
  guardarAgenda,
  guardarPerfilWhatsapp,
  subirFotoWhatsapp,
  agregarConocimiento,
  eliminarConocimiento,
  alternarConocimiento,
  crearRecordatorio,
  cancelarRecordatorio,
};

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ nombre: string }> }
) {
  const { nombre } = await params;
  const fn = ACCIONES[nombre];

  if (!fn) {
    return NextResponse.json({ ok: false, error: "Acción desconocida." }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "No se pudo leer el formulario." }, { status: 400 });
  }

  const resultado = await fn(null, form);
  return NextResponse.json(resultado, { headers: { "cache-control": "no-store" } });
}
