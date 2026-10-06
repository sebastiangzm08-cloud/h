/* ==========================================================================
   Llamada al modelo de una demo: UNA sola por turno, con salida JSON
   estructurada. Vive aparte para que la ruta quede legible y para poder
   probar la pantalla con un modelo simulado sin tocar la ruta.

   Mismo modelo y misma lógica de reintento que /api/asistente-ia — ver el
   comentario de ese archivo sobre por qué hace falta absorber el 503.
   ========================================================================== */
import { GoogleGenAI, Type, type Content } from "@google/genai";

const GEMINI_MODEL = "gemini-3.6-flash";
const REINTENTOS = 2;
const ESPERA_MS = 900;

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    respuesta: { type: Type.STRING },
    escalar: { type: Type.BOOLEAN },
    motivo_escalamiento: { type: Type.STRING },
    cita_estado: { type: Type.STRING, enum: ["ninguna", "propuesta", "confirmada"] },
    cita_servicio: { type: Type.STRING },
    cita_horario: { type: Type.STRING },
  },
  required: [
    "respuesta",
    "escalar",
    "motivo_escalamiento",
    "cita_estado",
    "cita_servicio",
    "cita_horario",
  ],
  propertyOrdering: [
    "respuesta",
    "escalar",
    "motivo_escalamiento",
    "cita_estado",
    "cita_servicio",
    "cita_horario",
  ],
};

/** Devuelve el texto crudo (JSON) del modelo. Lanza si la llamada falla. */
export async function generarSalidaCruda({
  apiKey,
  sistema,
  contents,
}: {
  apiKey: string;
  sistema: string;
  contents: Content[];
}): Promise<string | undefined> {
  const ai = new GoogleGenAI({ apiKey });
  for (let intento = 0; intento <= REINTENTOS; intento++) {
    try {
      const r = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction: sistema,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      });
      return r.text;
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
