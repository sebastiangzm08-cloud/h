import { NextRequest, NextResponse } from "next/server";
import type { Content } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/servidor";
import { getDemoPublicaPorSlug } from "@/lib/panel/demo-publico";
import { armarPromptDemo } from "@/lib/panel/demo-prompt";
import { generarSalidaCruda } from "@/lib/demo/modelo";
import { deducirHerramientas, parsearServicios } from "@/lib/demo/herramientas";
import { armarCita, escaladaDeterminista, leerSalidaModelo } from "@/lib/demo/turno";
import type { Escalada, RespuestaDemo } from "@/lib/demo/tipos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LARGO_MENSAJE = 500;
// Tope duro extra por historial: ni con `mensajesTope` mal configurado se
// manda un prompt gigante a Gemini (costo/abuso).
const MAX_TURNOS_HISTORIAL = 60;
// Cuántos mensajes recientes de la persona se miran para confirmar un horario.
const MENSAJES_PARA_HORARIO = 6;

type TurnoHistorial = { autor: "prospecto" | "agente"; texto: string };

function responder(cuerpo: RespuestaDemo, status = 200) {
  return NextResponse.json(cuerpo, { status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return responder({ ok: false, error: "Falta configurar GEMINI_API_KEY en el servidor." }, 500);
  }

  const demo = await getDemoPublicaPorSlug(slug);
  if (!demo || !demo.activo) {
    return responder(
      { ok: false, error: "Esta demo ya no está disponible.", codigo: "no_disponible" },
      404
    );
  }
  if (demo.mensajesUsados >= demo.mensajesTope) {
    return responder({
      ok: false,
      error:
        "Esta demo llegó a su límite de mensajes de prueba. Escríbanos y seguimos la conversación de verdad.",
      codigo: "limite",
    });
  }

  let body: { historial?: TurnoHistorial[]; mensaje?: string };
  try {
    body = await req.json();
  } catch {
    return responder({ ok: false, error: "Cuerpo inválido." }, 400);
  }

  const mensaje = (body.mensaje ?? "").trim();
  if (!mensaje) {
    return responder({ ok: false, error: "Escriba algo primero." }, 400);
  }
  if (mensaje.length > MAX_LARGO_MENSAJE) {
    return responder({ ok: false, error: "Ese mensaje es demasiado largo." }, 400);
  }

  const historial = (Array.isArray(body.historial) ? body.historial : [])
    .slice(-MAX_TURNOS_HISTORIAL)
    .filter((h) => h && typeof h.texto === "string" && h.texto.trim());

  const contents: Content[] = [
    ...historial.map((h) => ({
      role: h.autor === "agente" ? "model" : "user",
      parts: [{ text: h.texto }],
    })),
    { role: "user", parts: [{ text: mensaje }] },
  ];

  const inicio = Date.now();
  try {
    const cruda = await generarSalidaCruda({
      apiKey,
      sistema: armarPromptDemo(demo),
      contents,
    });

    const salida = leerSalidaModelo(cruda);
    if (!salida) {
      return responder({ ok: false, error: "No se recibió respuesta. Pruebe de nuevo." }, 502);
    }
    const tiempoMs = Date.now() - inicio;

    /* Lo de la persona: para confirmar horarios solo cuentan sus mensajes. */
    const deLaPersona = [
      ...historial.filter((h) => h.autor === "prospecto").map((h) => h.texto),
      mensaje,
    ].slice(-MENSAJES_PARA_HORARIO);

    const cita = armarCita(salida, deLaPersona);

    let escalada: Escalada | null = null;
    if (salida.escalar) {
      escalada = { motivo: salida.motivoEscalamiento || "El agente pasó este caso a una persona." };
    } else {
      escalada = escaladaDeterminista(mensaje);
    }

    const herramientas = deducirHerramientas({
      respuesta: salida.respuesta,
      servicios: parsearServicios(demo.servicios),
      citaConfirmada: cita?.estado === "confirmada",
      intentoAgendar: cita !== null,
    });

    // Cuenta el turno YA gastado (no importa si el admin baja el tope
    // después: nunca se resta, solo se suma cuando de verdad se contestó).
    const usados = demo.mensajesUsados + 1;
    await supabaseAdmin().from("demos").update({ mensajes_usados: usados }).eq("id", demo.id);

    return responder({
      ok: true,
      respuesta: salida.respuesta,
      mensajesRestantes: Math.max(0, demo.mensajesTope - usados),
      escalada,
      cita,
      herramientas,
      tiempoMs,
    });
  } catch (err) {
    console.error("Error al llamar a Gemini (demo):", err);
    return responder({ ok: false, error: "No se pudo generar la respuesta en este momento." }, 502);
  }
}
