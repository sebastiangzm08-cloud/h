import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, type Content } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/servidor";
import { getDemoPublicaPorSlug } from "@/lib/panel/demo-publico";
import { armarPromptDemo } from "@/lib/panel/demo-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Mismo modelo y misma lógica de reintento que /api/asistente-ia — ver el
   comentario de ese archivo sobre por qué hace falta absorber el 503. */
const GEMINI_MODEL = "gemini-3.6-flash";
const REINTENTOS = 2;
const ESPERA_MS = 900;
const MAX_LARGO_MENSAJE = 500;
// Tope duro extra por historial: ni con `mensajesTope` mal configurado se
// manda un prompt gigante a Gemini (costo/abuso).
const MAX_TURNOS_HISTORIAL = 60;

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generarConReintentos(
  ai: InstanceType<typeof GoogleGenAI>,
  params: Parameters<GoogleGenAI["models"]["generateContent"]>[0]
) {
  for (let intento = 0; intento <= REINTENTOS; intento++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      const esSaturacion =
        err instanceof Error &&
        "status" in err &&
        (err as { status?: number }).status === 503;
      if (!esSaturacion || intento === REINTENTOS) throw err;
      await esperar(ESPERA_MS * (intento + 1));
    }
  }
  throw new Error("No se pudo generar la respuesta.");
}

type TurnoHistorial = { autor: "prospecto" | "agente"; texto: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Falta configurar GEMINI_API_KEY en el servidor." },
      { status: 500 }
    );
  }

  const demo = await getDemoPublicaPorSlug(slug);
  if (!demo || !demo.activo) {
    return NextResponse.json(
      { ok: false, error: "Esta demo ya no está disponible." },
      { status: 404 }
    );
  }
  if (demo.mensajesUsados >= demo.mensajesTope) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Esta demo llegó a su límite de mensajes de prueba. Escribinos y seguimos la conversación de verdad.",
      },
      { status: 200 }
    );
  }

  let body: { historial?: TurnoHistorial[]; mensaje?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido." }, { status: 400 });
  }

  const mensaje = (body.mensaje ?? "").trim();
  if (!mensaje) {
    return NextResponse.json({ ok: false, error: "Escribí algo primero." }, { status: 400 });
  }
  if (mensaje.length > MAX_LARGO_MENSAJE) {
    return NextResponse.json(
      { ok: false, error: "Ese mensaje es demasiado largo." },
      { status: 400 }
    );
  }

  const historial = (Array.isArray(body.historial) ? body.historial : []).slice(
    -MAX_TURNOS_HISTORIAL
  );

  const contents: Content[] = [
    ...historial
      .filter((h) => h && typeof h.texto === "string" && h.texto.trim())
      .map((h) => ({
        role: h.autor === "agente" ? "model" : "user",
        parts: [{ text: h.texto }],
      })),
    { role: "user", parts: [{ text: mensaje }] },
  ];

  try {
    const ai = new GoogleGenAI({ apiKey });
    const respuesta = await generarConReintentos(ai, {
      model: GEMINI_MODEL,
      contents,
      config: { systemInstruction: armarPromptDemo(demo) },
    });

    const texto = respuesta.text?.trim();
    if (!texto) {
      return NextResponse.json(
        { ok: false, error: "No se recibió respuesta. Probá de nuevo." },
        { status: 502 }
      );
    }

    // Cuenta el turno YA gastado (no importa si el admin baja el tope
    // después: nunca se resta, solo se suma cuando de verdad se contestó).
    const usados = demo.mensajesUsados + 1;
    await supabaseAdmin().from("demos").update({ mensajes_usados: usados }).eq("id", demo.id);

    return NextResponse.json({
      ok: true,
      respuesta: texto,
      mensajesRestantes: Math.max(0, demo.mensajesTope - usados),
    });
  } catch (err) {
    console.error("Error al llamar a Gemini (demo):", err);
    return NextResponse.json(
      { ok: false, error: "No se pudo generar la respuesta en este momento." },
      { status: 502 }
    );
  }
}
