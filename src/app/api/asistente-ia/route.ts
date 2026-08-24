import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { catalogo, procesos } from "@/lib/content";

export const runtime = "nodejs";

/**
 * Modelo de Gemini a usar. "flash" = rápido y barato, con capa gratuita
 * generosa en Google AI Studio. Google retira versiones de flash con
 * frecuencia; si esto empieza a fallar con 404, el mensaje de error de
 * la API dice directamente cuál es el reemplazo vigente. Cambiala solo
 * acá, en ningún otro lado más.
 */
const GEMINI_MODEL = "gemini-3.6-flash";

const MIN_LARGO = 10;
const MAX_LARGO = 1000;

function construirContexto() {
  const listaProcesos = procesos
    .map((p) => `- ${p.nombre}: ${p.resumen}`)
    .join("\n");

  const listaCatalogo = catalogo
    .map((a) => {
      const precio = a.precio
        ? `desde ₡${a.precio.toLocaleString("es-CR")}`
        : "a cotizar";
      return `- ${a.nombre} (proceso: ${a.proceso}, nivel ${a.nivel}, ${a.plazo}, ${precio})`;
    })
    .join("\n");

  return { listaProcesos, listaCatalogo };
}

function construirPrompt(descripcion: string) {
  const { listaProcesos, listaCatalogo } = construirContexto();

  return `Sos el asistente de automatización de Hoshizora Studio, una agencia de Costa Rica que automatiza procesos de negocio conectando las herramientas que el cliente ya usa (WhatsApp, Excel, un CRM, etc.), sin migrarlo a sistemas nuevos. Trabajás con cualquier tipo de negocio, no solo con un sector.

Un visitante de la web describió así su negocio y sus herramientas:
"""
${descripcion}
"""

Los seis procesos que la agencia automatiza son:
${listaProcesos}

El catálogo real de automatizaciones, con precio y plazo reales, es:
${listaCatalogo}

Con esa información, respondé en español de Costa Rica (tratamiento de "vos"), en un tono directo y concreto, sin emojis ni relleno:

1. Un párrafo breve (2 a 3 líneas) que muestre que entendiste su negocio y señale dónde parece estar perdiendo más tiempo.
2. Entre 2 y 3 automatizaciones concretas recomendadas. Priorizá las que ya existen en el catálogo de arriba y citá su precio "desde" y su plazo tal cual aparecen ahí. Si ninguna encaja bien, proponé una idea puntual y aclará que esa se cotiza aparte.
3. Un cierre breve invitando a agendar el diagnóstico gratuito de 30 minutos.

No inventes precios que no estén en la lista. No prometas resultados exagerados ni uses superlativos vacíos. Sé específico, no genérico.`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Falta configurar GEMINI_API_KEY en el servidor (archivo .env.local).",
      },
      { status: 500 }
    );
  }

  let body: { descripcion?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de la solicitud inválido." }, { status: 400 });
  }

  const descripcion = (body.descripcion ?? "").trim();

  if (descripcion.length < MIN_LARGO) {
    return NextResponse.json(
      { error: "Contanos un poco más sobre tu negocio, al menos una frase." },
      { status: 400 }
    );
  }
  if (descripcion.length > MAX_LARGO) {
    return NextResponse.json(
      { error: "Ese texto es demasiado largo, resumilo un poco." },
      { status: 400 }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const respuesta = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: construirPrompt(descripcion),
    });

    const texto = respuesta.text;
    if (!texto) {
      return NextResponse.json(
        { error: "No se recibió respuesta de Gemini. Probá de nuevo." },
        { status: 502 }
      );
    }

    return NextResponse.json({ texto });
  } catch (err) {
    console.error("Error al llamar a Gemini:", err);
    return NextResponse.json(
      { error: "No se pudo generar la recomendación en este momento." },
      { status: 502 }
    );
  }
}
