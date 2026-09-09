import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { automatizaciones, planes } from "@/lib/content";

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

/* Gemini devuelve 503 "high demand" con bastante frecuencia en la práctica
   (lo confirmamos en pruebas reales: ~1 de cada 3 intentos) — no es un
   caso raro, hay que absorberlo acá para que el visitante casi nunca lo
   vea. Solo se reintenta el 503 (temporal); cualquier otro error falla
   directo, porque reintentar no lo va a arreglar. */
const REINTENTOS = 2;
const ESPERA_MS = 900;

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
  // Inalcanzable: el bucle siempre retorna o lanza antes de salir.
  throw new Error("No se pudo generar la recomendación.");
}

/* Respuesta ESTRUCTURADA, no un párrafo de texto libre. Con un negocio
   real como input, un visitante que no sabe nada de automatización tiene
   que poder leer esto en cinco segundos: qué le pasa, qué le conviene,
   cuánto sale por mes. Nada de precios de compra puntual acá — esos
   asustan y además el negocio real está en la mensualidad del plan. */
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    entendido: {
      type: Type.STRING,
      description:
        "Una a dos líneas, máximo 30 palabras. Muestra que entendiste el negocio y señala dónde parece perder más tiempo. Nada de relleno ni saludos.",
    },
    automatizacionIds: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Como máximo 2 ids EXACTOS del campo id de la lista de automatizaciones (nunca inventados). Las 1 o 2 más relevantes, no una lista larga.",
    },
    planId: {
      type: Type.STRING,
      enum: ["starter", "growth", "scale"],
      description:
        "El id del plan mensual (de la lista de planes) que mejor le queda, según cuántas automatizaciones necesita en total su negocio.",
    },
    porQuePlan: {
      type: Type.STRING,
      description:
        "Máximo 18 palabras explicando por qué ese plan y no otro. Concreto, sin adjetivos vacíos.",
    },
  },
  required: ["entendido", "automatizacionIds", "planId", "porQuePlan"],
};

function construirContexto() {
  const listaCatalogo = automatizaciones
    .map((a) => `- id: ${a.slug} — ${a.nombre} (plan ${a.plan}). ${a.gancho} ${a.descripcion}`)
    .join("\n");

  const listaPlanes = planes
    .map((p) => `- id: ${p.id} — ${p.nombre}: ${p.para}. ${p.incluye[0]}.`)
    .join("\n");

  return { listaCatalogo, listaPlanes };
}

function construirPrompt(descripcion: string) {
  const { listaCatalogo, listaPlanes } = construirContexto();

  return `Sos el asistente de automatización de Hoshizora, una agencia de Costa Rica que automatiza procesos de negocio conectando las herramientas que el cliente ya usa (WhatsApp, Excel, un CRM, etc.), sin migrarlo a sistemas nuevos. Trabajás con cualquier tipo de negocio, no solo con un sector. Muchos de quienes leen esto no saben nada de automatización — no des por sentado que conocen jerga técnica.

Un visitante de la web describió así su negocio y sus herramientas:
"""
${descripcion}
"""

Hoy la agencia tiene TRES automatizaciones disponibles, una por plan (elegí como máximo 2, las más relevantes; si ninguna calza, decilo y sugerí el diagnóstico):
${listaCatalogo}

Los planes mensuales reales (elegí el que mejor le quede):
${listaPlanes}

Reglas: no inventes ids que no estén en las listas de arriba. No menciones precios de construcción puntual — el negocio del cliente es la mensualidad del plan. No prometas resultados exagerados ni uses superlativos vacíos. Sé específico, no genérico, y priorizá que alguien sin conocimiento técnico entienda todo de un vistazo.`;
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
    const respuesta = await generarConReintentos(ai, {
      model: GEMINI_MODEL,
      contents: construirPrompt(descripcion),
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const texto = respuesta.text;
    if (!texto) {
      return NextResponse.json(
        { error: "No se recibió respuesta de Gemini. Probá de nuevo." },
        { status: 502 }
      );
    }

    let datos: {
      entendido?: string;
      automatizacionIds?: string[];
      planId?: string;
      porQuePlan?: string;
    };
    try {
      datos = JSON.parse(texto);
    } catch {
      return NextResponse.json(
        { error: "La respuesta no se pudo interpretar. Probá de nuevo." },
        { status: 502 }
      );
    }

    // Nunca confiar en que el modelo devolvió solo ids reales: se filtra
    // contra las automatizaciones y los planes de verdad antes de mandarlo.
    const idsValidos = new Set(automatizaciones.map((a) => a.slug));
    const idsElegidos = (datos.automatizacionIds ?? [])
      .filter((id) => idsValidos.has(id))
      .slice(0, 2);

    const planValido = planes.some((p) => p.id === datos.planId);

    return NextResponse.json({
      entendido: datos.entendido ?? "",
      automatizacionIds: idsElegidos,
      // "starter" como respaldo honesto: es el plan de entrada, nunca el
      // que menos le conviene a alguien que recién está probando.
      planId: planValido ? datos.planId : "starter",
      porQuePlan: datos.porQuePlan ?? "",
    });
  } catch (err) {
    console.error("Error al llamar a Gemini:", err);
    return NextResponse.json(
      { error: "No se pudo generar la recomendación en este momento." },
      { status: 502 }
    );
  }
}
