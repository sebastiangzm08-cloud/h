import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { getContenido } from "@/lib/contenido";
import type { Idioma } from "@/lib/i18n";

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

/* Mensajes de error al visitante, en su idioma. */
const MENSAJES: Record<
  Idioma,
  {
    sinLlave: string;
    cuerpo: string;
    corto: string;
    largo: string;
    vacio: string;
    ilegible: string;
    falla: string;
  }
> = {
  es: {
    sinLlave:
      "Falta configurar GEMINI_API_KEY en el servidor (archivo .env.local).",
    cuerpo: "Cuerpo de la solicitud inválido.",
    corto: "Contanos un poco más sobre tu negocio, al menos una frase.",
    largo: "Ese texto es demasiado largo, resumilo un poco.",
    vacio: "No se recibió respuesta de Gemini. Probá de nuevo.",
    ilegible: "La respuesta no se pudo interpretar. Probá de nuevo.",
    falla: "No se pudo generar la recomendación en este momento.",
  },
  en: {
    sinLlave: "The advisor isn't configured on the server (missing GEMINI_API_KEY).",
    cuerpo: "Invalid request body.",
    corto: "Tell us a bit more about your business, at least a sentence.",
    largo: "That text is too long, please shorten it a little.",
    vacio: "No answer came back. Please try again.",
    ilegible: "The answer couldn't be read. Please try again.",
    falla: "We couldn't generate an answer right now.",
  },
};

/* Respuesta ESTRUCTURADA, no un párrafo de texto libre. Hoy el asesor solo
   habla del Agente IA de WhatsApp (lo único que se vende): dice si encaja,
   qué haría por ese negocio y, si algo queda fuera, lo dice con honestidad.
   El plan no lo elige el modelo: es uno solo y lo pinta la página. */
function esquema(idioma: Idioma) {
  const es = idioma === "es";
  return {
    type: Type.OBJECT,
    properties: {
      entendido: {
        type: Type.STRING,
        description: es
          ? "Una a dos líneas, máximo 30 palabras. Muestra que entendiste el negocio y señala dónde parece perder más tiempo con sus clientes. Nada de relleno ni saludos."
          : "One or two lines, 30 words max. Show you understood the business and where it seems to lose the most time with customers. No filler, no greetings.",
      },
      encaja: {
        type: Type.STRING,
        enum: ["si", "parcial", "no"],
        description: es
          ? "'si' si el negocio atiende clientes por WhatsApp (citas, consultas de precios o servicios) y el agente resuelve lo principal. 'parcial' si el agente resuelve solo una parte de lo que cuenta. 'no' si lo que necesita no tiene que ver con atender clientes por WhatsApp."
          : "'si' if the business serves customers over WhatsApp (appointments, price or service questions) and the agent covers the main need. 'parcial' if the agent covers only part of what they describe. 'no' if what they need has nothing to do with serving customers over WhatsApp.",
      },
      usos: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: es
          ? "Entre 0 y 3 cosas CONCRETAS que el agente haría por ESTE negocio, cada una de máximo 16 palabras, tomadas solo de la lista de lo que el agente hace. Vacío si encaja es 'no'."
          : "Between 0 and 3 CONCRETE things the agent would do for THIS business, each 16 words max, taken only from the list of what the agent does. Empty if encaja is 'no'.",
      },
      nota: {
        type: Type.STRING,
        description: es
          ? "Máximo 28 palabras. Solo si encaja es 'parcial' o 'no': qué parte NO cubre el agente hoy y que otras automatizaciones vienen más adelante, sugiriendo el diagnóstico. Si encaja es 'si', déjalo vacío."
          : "28 words max. Only if encaja is 'parcial' or 'no': what the agent does NOT cover today and that other automations come later, suggesting the diagnostic. If encaja is 'si', leave it empty.",
      },
    },
    required: ["entendido", "encaja", "usos", "nota"],
  };
}

function construirPrompt(descripcion: string, idioma: Idioma) {
  const { automatizaciones, planes } = getContenido(idioma);
  const agente = automatizaciones[0];
  const plan = planes[0];

  if (idioma === "en") {
    const lista = agente.puntos.map((p) => `- ${p}`).join("\n");
    return `You are the advisor on the website of Hoshizora, an agency in Costa Rica that sells ONE thing today: the AI Agent for WhatsApp (plan "${plan.nombre}"). Many readers know nothing about automation, so avoid jargon. Write in plain, natural US English.

A visitor described their business like this:
"""
${descripcion}
"""

What the AI Agent really does (this is the ONLY list you may draw from):
${lista}

What it does NOT do today: it works only on WhatsApp. It does not post on social media, find new customers (prospecting), handle invoices or payments, answer email, take phone calls, or manage inventory. Other automations may come later, but do not promise any.

Rules: never invent features, integrations, prices, results or numbers. Do not mention prices or fees at all. No superlatives or exaggerated promises. Be specific to this business, not generic. If the business needs something the agent does not do, say so honestly (encaja "parcial" or "no") and suggest the free diagnostic. Reply in English.`;
  }

  const lista = agente.puntos.map((p) => `- ${p}`).join("\n");
  return `Sos el asesor del sitio de Hoshizora, una agencia de Costa Rica que hoy vende UNA sola cosa: el Agente IA de WhatsApp (plan "${plan.nombre}"). Muchos de quienes leen esto no saben nada de automatización — no des por sentado que conocen jerga técnica. Escribí en español de Costa Rica, con voseo.

Un visitante de la web describió así su negocio:
"""
${descripcion}
"""

Lo que el Agente IA de verdad hace (esta es la ÚNICA lista de la que podés sacar usos):
${lista}

Lo que NO hace hoy: trabaja solo por WhatsApp. No publica en redes sociales, no busca clientes nuevos (prospección), no hace facturas ni cobros, no contesta correos, no atiende llamadas ni maneja inventario. Más adelante puede haber otras automatizaciones, pero no prometas ninguna.

Reglas: no inventes funciones, integraciones, precios, resultados ni cifras. No menciones precios ni costos. Nada de superlativos ni promesas exageradas. Sé específico para este negocio, no genérico. Si el negocio necesita algo que el agente no hace, decilo con honestidad (encaja "parcial" o "no") y sugerí el diagnóstico gratuito.`;
}

const ENCAJES = ["si", "parcial", "no"] as const;

function recortar(texto: unknown, max: number) {
  return typeof texto === "string" ? texto.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  let body: { descripcion?: string; idioma?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: MENSAJES.es.cuerpo }, { status: 400 });
  }

  /* El idioma lo manda la página (/en pide "en"); cualquier otro valor cae en
     español, que es lo que hacía el endpoint antes. */
  const idioma: Idioma = body.idioma === "en" ? "en" : "es";
  const m = MENSAJES[idioma];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: m.sinLlave }, { status: 500 });
  }

  const descripcion = (body.descripcion ?? "").trim();

  if (descripcion.length < MIN_LARGO) {
    return NextResponse.json({ error: m.corto }, { status: 400 });
  }
  if (descripcion.length > MAX_LARGO) {
    return NextResponse.json({ error: m.largo }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const respuesta = await generarConReintentos(ai, {
      model: GEMINI_MODEL,
      contents: construirPrompt(descripcion, idioma),
      config: {
        responseMimeType: "application/json",
        responseSchema: esquema(idioma),
      },
    });

    const texto = respuesta.text;
    if (!texto) {
      return NextResponse.json({ error: m.vacio }, { status: 502 });
    }

    let datos: {
      entendido?: unknown;
      encaja?: unknown;
      usos?: unknown;
      nota?: unknown;
    };
    try {
      datos = JSON.parse(texto);
    } catch {
      return NextResponse.json({ error: m.ilegible }, { status: 502 });
    }

    // Nunca confiar en que el modelo devolvió exactamente lo pedido: se
    // valida y se recorta antes de mandarlo.
    const encaja = ENCAJES.find((e) => e === datos.encaja) ?? "parcial";
    const usos = Array.isArray(datos.usos)
      ? datos.usos
          .map((u) => recortar(u, 200))
          .filter((u) => u.length > 0)
          .slice(0, 3)
      : [];

    return NextResponse.json({
      entendido: recortar(datos.entendido, 400),
      encaja,
      usos: encaja === "no" ? [] : usos,
      nota: encaja === "si" ? "" : recortar(datos.nota, 400),
    });
  } catch (err) {
    console.error("Error al llamar a Gemini:", err);
    return NextResponse.json({ error: m.falla }, { status: 502 });
  }
}
