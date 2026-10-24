/* ==========================================================================
   Mensajes automáticos del Agente de WhatsApp que NO responden a nadie: los
   dispara un reloj de n8n cada 30 minutos (`/api/automatizaciones/[nombre]`).
   Solo servidor.

   1. Seguimiento a quien no agendó (2026-10-17)
      Alguien preguntó, el agente le contestó y la persona no volvió a
      escribir ni agendó. Antes de que se cierre la ventana de 24 h de
      WhatsApp (dentro de ella el mensaje es GRATIS en Meta) el agente le
      escribe UNA vez. Gemini decide si vale la pena: si la persona se
      despidió o dijo que no, no se manda nada.

   Se enciende por cliente en "Cómo responde" (config.seguimiento.activo).
   Lo que se decidió para cada conversación queda en wa_contactos.datos
   .seguimiento, así nunca se manda dos veces ni se le vuelve a preguntar a
   Gemini por la misma conversación.

   2. Reseña en Google al día siguiente de la cita (config.resenas)
   3. Reactivar pacientes cuando ya les toca volver (config.reactivar)
      Fuera de la ventana de 24 h WhatsApp solo deja escribir con PLANTILLAS
      aprobadas por Meta (se cobran: utilidad ~₡6, marketing ~₡38). Si la
      persona escribió en las últimas 24 h se manda texto libre (gratis).
      Las plantillas se crean solas en la WABA del cliente al encender la
      función (`asegurarPlantillasAutomaticas`).
   ========================================================================== */
import { GoogleGenAI, Type } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/servidor";
import { detalleWhatsapp, enviarTextoWhatsapp, type ConexionWhatsapp } from "./whatsapp-conexion";

const MODELO = "gemini-3.6-flash";
const HORA = 60 * 60 * 1000;
/** Se escribe entre las 20 y las 23 h desde el último mensaje de la persona: antes de que cierre la ventana gratis de 24 h. */
const DESDE_H = 20;
const HASTA_H = 23;

type Fila = Record<string, unknown>;

export type ResultadoSeguimiento = {
  revisadas: number;
  enviados: { cliente: string; telefono: string; mensaje: string }[];
  descartadas: { telefono: string; motivo: string }[];
  errores: string[];
};

const NOMBRE_ARCHIVO: Record<string, string> = {
  imagen: "una foto",
  video: "un video",
  sticker: "un sticker",
  documento: "un documento",
};

function contenido(m: Fila): string {
  const base = String(m.texto || m.transcripcion || "");
  const archivo = NOMBRE_ARCHIVO[String(m.tipo)];
  if (!archivo) return base;
  return `[Envió ${archivo}${base ? ` con el texto: "${base}"` : ""}]`;
}

async function decidirSeguimiento(
  ai: GoogleGenAI,
  cfg: Fila,
  historial: Fila[]
): Promise<{ enviar: boolean; mensaje: string; motivo: string }> {
  const trato = cfg.trato === "vos" ? "de vos (vos, tenés, podés; nunca usted)" : "de usted";
  const marca = typeof cfg.marca === "string" && cfg.marca ? cfg.marca : "el negocio";
  const charla = historial
    .map((m) => `${m.autor === "contacto" ? "Persona" : m.autor === "agente" ? "Vos" : "El dueño"}: ${contenido(m)}`)
    .join("\n");

  /* Las reglas de venta del negocio (si las tiene): sin ellas, Gemini inventaba
     cosas como "una demostración de 10 minutos" que el negocio no ofrece. */
  const venta = Array.isArray(cfg.venta) ? (cfg.venta as unknown[]).filter((v) => typeof v === "string") : [];

  const prompt = [
    `Atendés el WhatsApp de ${marca}. La persona dejó de contestar hace casi un día y NO agendó.`,
    "Decidí si vale la pena mandarle UN solo mensaje de seguimiento.",
    "NO lo mandés si: se despidió, dijo que no le interesa, ya quedó todo resuelto, pidió que no le escriban, o la conversación no tenía que ver con el negocio.",
    "SÍ mandalo si: mostró interés (preguntó precio, servicios, horarios) y quedó a medias.",
    `Si lo mandás: tratala ${trato}. Sin saludar como si fuera la primera vez, recordá UN beneficio concreto ligado a lo que la persona contó (qué gana, no qué pierde) y proponé el siguiente paso. El mensaje lleva UNA SOLA pregunta, al final, y tiene que ser de sí o no (por ejemplo "¿Te lo dejamos funcionando esta semana?"). Prohibido cualquier otra pregunta: nada de preguntar quién atiende, cuántos mensajes recibe ni ningún dato de su negocio, aunque haya quedado pendiente. Un solo mensaje de 2 a 4 líneas, cálido y sin presión. Español de Costa Rica.`,
    "Nunca ofrezcás demostraciones, llamadas, descuentos, regalos ni nada que no aparezca en la conversación o en las reglas de abajo. Nunca inventés precios, horarios ni datos.",
    ...(venta.length ? ["", "# CÓMO VENDE ESTE NEGOCIO (respetalo)", ...venta.map((v) => `- ${v}`)] : []),
    "",
    "# LA CONVERSACIÓN",
    charla,
  ].join("\n");

  const r = await ai.models.generateContent({
    model: MODELO,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          enviar: { type: Type.BOOLEAN },
          mensaje: { type: Type.STRING },
          motivo: { type: Type.STRING },
        },
        required: ["enviar", "mensaje", "motivo"],
      },
      temperature: 0.6,
    },
  });
  const datos = JSON.parse(r.text ?? "{}") as { enviar?: boolean; mensaje?: string; motivo?: string };
  return {
    enviar: datos.enviar === true && Boolean(datos.mensaje?.trim()),
    mensaje: (datos.mensaje ?? "").trim(),
    motivo: (datos.motivo ?? "").trim(),
  };
}

export async function correrSeguimientos(opciones: { simular?: boolean } = {}): Promise<ResultadoSeguimiento> {
  const resultado: ResultadoSeguimiento = { revisadas: 0, enviados: [], descartadas: [], errores: [] };
  const admin = supabaseAdmin();
  const ahora = Date.now();
  const claveGemini = process.env.GEMINI_API_KEY;
  if (!claveGemini) {
    resultado.errores.push("Falta GEMINI_API_KEY en el servidor.");
    return resultado;
  }
  const ai = new GoogleGenAI({ apiKey: claveGemini });

  const { data: asignaciones } = await admin
    .from("asignaciones")
    .select("cliente_id, estado, config, catalogo_automatizaciones!inner(slug)")
    .eq("catalogo_automatizaciones.slug", "agente-whatsapp")
    .eq("estado", "activa");

  for (const asig of asignaciones ?? []) {
    const cfg = (asig.config ?? {}) as Fila;
    if ((cfg.seguimiento as Fila | undefined)?.activo !== true) continue;
    const clienteId = asig.cliente_id as string;

    /* Filtro barato primero: conversaciones del agente con movimiento hace 19–24 h. */
    const { data: convs } = await admin
      .from("wa_conversaciones")
      .select("id, contacto_id, wa_contactos(telefono, datos)")
      .eq("cliente_id", clienteId)
      .eq("estado", "agente")
      .gte("ultimo_en", new Date(ahora - 24 * HORA).toISOString())
      .lte("ultimo_en", new Date(ahora - 19 * HORA).toISOString());
    if (!convs?.length) continue;

    const conexion = await detalleWhatsapp(clienteId);
    if (!conexion) {
      resultado.errores.push(`${clienteId}: sin WhatsApp conectado`);
      continue;
    }

    for (const conv of convs) {
      resultado.revisadas++;
      const contacto = conv.wa_contactos as unknown as { telefono: string; datos: Fila | null } | null;
      const telefono = contacto?.telefono ?? "";
      const datos = (contacto?.datos ?? {}) as Fila;

      const { data: ultimos } = await admin
        .from("wa_mensajes")
        .select("autor, tipo, texto, transcripcion, creado_en")
        .eq("conversacion_id", conv.id)
        .in("autor", ["contacto", "agente", "humano"])
        .order("creado_en", { ascending: false })
        .limit(16);
      const historial = (ultimos ?? []).reverse();
      const ultimo = historial[historial.length - 1];
      const ultimoContacto = [...historial].reverse().find((m) => m.autor === "contacto");
      if (!ultimo || !ultimoContacto) continue;

      const paraEste = ultimoContacto.creado_en as string;
      const horas = (ahora - new Date(paraEste).getTime()) / HORA;
      const previo = datos.seguimiento as Fila | undefined;

      if (ultimo.autor !== "agente") continue; // la persona escribió último: le toca al agente, no a esto
      if (horas < DESDE_H || horas > HASTA_H) continue; // fuera de la franja (o ya cerró la ventana gratis)
      if (previo?.para === paraEste) continue; // ya se decidió para este mismo silencio

      const { count: citasFuturas } = await admin
        .from("wa_citas")
        .select("id", { count: "exact", head: true })
        .eq("contacto_id", conv.contacto_id)
        .neq("estado", "cancelada")
        .gte("cuando", new Date(ahora).toISOString());
      if (citasFuturas) {
        resultado.descartadas.push({ telefono, motivo: "ya tiene cita" });
        continue;
      }

      try {
        const decision = await decidirSeguimiento(ai, cfg, historial);
        let enviado = false;
        if (decision.enviar && !opciones.simular) {
          const envio = await enviarTextoWhatsapp(conexion, telefono, decision.mensaje);
          if (!envio.ok) throw new Error(envio.error);
          enviado = true;
          const ahoraIso = new Date().toISOString();
          await admin.from("wa_mensajes").insert({
            cliente_id: clienteId,
            conversacion_id: conv.id,
            autor: "agente",
            tipo: "texto",
            texto: decision.mensaje,
            herramientas: ["seguimiento"],
          });
          await admin
            .from("wa_conversaciones")
            .update({ ultimo_mensaje: decision.mensaje, ultimo_en: ahoraIso })
            .eq("id", conv.id);
        }
        if (!opciones.simular) {
          await admin
            .from("wa_contactos")
            .update({ datos: { ...datos, seguimiento: { para: paraEste, enviado, motivo: decision.motivo, en: new Date().toISOString() } } })
            .eq("id", conv.contacto_id);
        }
        if (decision.enviar) resultado.enviados.push({ cliente: clienteId, telefono, mensaje: decision.mensaje });
        else resultado.descartadas.push({ telefono, motivo: decision.motivo || "Gemini decidió no escribir" });
      } catch (e) {
        resultado.errores.push(`${telefono}: ${(e as Error).message}`);
      }
    }
  }
  return resultado;
}

/* =========================================================================
   4. Aviso de enfriamiento (2026-10-23)
   Un prospecto que mostró interés y lleva horas sin escribir se está
   enfriando. Antes de que se cierre la ventana gratis de 24 h se le avisa a
   Sebastián (por Telegram, vía n8n), con un resumen y un mensaje sugerido, para que
   escriba él (no importa quién tenga el chat: IA o persona). Una sola vez por
   silencio. Se enciende por cliente con config.alerta_enfriamiento.activo.
   ========================================================================= */

/** Se avisa entre las 14 y las 21 h desde el último mensaje de la persona: quedan al menos 3 h de ventana gratis. */
const AVISO_DESDE_H = 14;
const AVISO_HASTA_H = 21;
const URL_PANEL = "https://hoshizora.agency/panel/agente/conversaciones";

export type ResultadoEnfriamiento = {
  revisadas: number;
  avisados: { cliente: string; telefono: string; resumen: string }[];
  /** Lo que n8n manda por Telegram (uno por prospecto). */
  mensajes: { asunto: string; detalle: string }[];
  descartadas: { telefono: string; motivo: string }[];
  errores: string[];
};

async function evaluarInteres(
  ai: GoogleGenAI,
  cfg: Fila,
  historial: Fila[]
): Promise<{ interesado: boolean; nombre: string; resumen: string; sugerencia: string }> {
  const marca = typeof cfg.marca === "string" && cfg.marca ? cfg.marca : "el negocio";
  const charla = historial
    .map((m) => `${m.autor === "contacto" ? "Persona" : m.autor === "agente" ? "Agente" : "Dueño"}: ${contenido(m)}`)
    .join("\n");
  const prompt = [
    `Sos el asistente de ventas de ${marca}. Leé esta conversación de WhatsApp y decidí si la persona mostró un interés real en contratar (preguntó precio, cómo funciona, condiciones, riesgos, o dijo que lo va a pensar o investigar).`,
    "NO es interés real: texto sin sentido, spam, mensajes sueltos de plantilla sin seguir, insultos, o alguien que dijo que no le interesa.",
    "Devolvé: interesado (true/false); nombre (el que la persona dijo, o vacío); resumen (UNA línea: qué quiere o qué lo frena, para que el dueño sepa qué decirle); sugerencia (un mensaje corto de WhatsApp de 2 a 3 líneas que el dueño podría mandarle ahora, en español de Costa Rica con voseo, sin mexicanismos, cálido y sin presión, con UNA pregunta fácil al final).",
    "",
    "# LA CONVERSACIÓN",
    charla,
  ].join("\n");

  const r = await ai.models.generateContent({
    model: MODELO,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          interesado: { type: Type.BOOLEAN },
          nombre: { type: Type.STRING },
          resumen: { type: Type.STRING },
          sugerencia: { type: Type.STRING },
        },
        required: ["interesado", "nombre", "resumen", "sugerencia"],
      },
      temperature: 0.4,
    },
  });
  const d = JSON.parse(r.text ?? "{}") as { interesado?: boolean; nombre?: string; resumen?: string; sugerencia?: string };
  return {
    interesado: d.interesado === true,
    nombre: (d.nombre ?? "").trim(),
    resumen: (d.resumen ?? "").trim(),
    sugerencia: (d.sugerencia ?? "").trim(),
  };
}

export async function correrAvisosEnfriamiento(opciones: { simular?: boolean } = {}): Promise<ResultadoEnfriamiento> {
  const resultado: ResultadoEnfriamiento = { revisadas: 0, avisados: [], mensajes: [], descartadas: [], errores: [] };
  const admin = supabaseAdmin();
  const ahora = Date.now();
  const claveGemini = process.env.GEMINI_API_KEY;
  if (!claveGemini) {
    resultado.errores.push("Falta GEMINI_API_KEY en el servidor.");
    return resultado;
  }
  const ai = new GoogleGenAI({ apiKey: claveGemini });

  const { data: asignaciones } = await admin
    .from("asignaciones")
    .select("cliente_id, estado, config, catalogo_automatizaciones!inner(slug)")
    .eq("catalogo_automatizaciones.slug", "agente-whatsapp")
    .eq("estado", "activa");

  for (const asig of asignaciones ?? []) {
    const cfg = (asig.config ?? {}) as Fila;
    if ((cfg.alerta_enfriamiento as Fila | undefined)?.activo !== true) continue;
    const clienteId = asig.cliente_id as string;

    /* Filtro barato: conversaciones con movimiento en las últimas 21 h (más viejas ya cerraron la ventana). */
    const { data: convs } = await admin
      .from("wa_conversaciones")
      .select("id, contacto_id, wa_contactos(nombre, telefono, datos)")
      .eq("cliente_id", clienteId)
      .neq("estado", "cerrada")
      .gte("ultimo_en", new Date(ahora - AVISO_HASTA_H * HORA).toISOString());
    if (!convs?.length) continue;

    for (const conv of convs) {
      const contacto = conv.wa_contactos as unknown as { nombre: string | null; telefono: string; datos: Fila | null } | null;
      const telefono = contacto?.telefono ?? "";
      const datos = (contacto?.datos ?? {}) as Fila;
      if (datos.spam === true) continue;

      const { data: ultimos } = await admin
        .from("wa_mensajes")
        .select("autor, tipo, texto, transcripcion, creado_en")
        .eq("conversacion_id", conv.id)
        .in("autor", ["contacto", "agente", "humano"])
        .order("creado_en", { ascending: false })
        .limit(20);
      const historial = (ultimos ?? []).reverse();
      const ultimo = historial[historial.length - 1];
      const ultimoContacto = [...historial].reverse().find((m) => m.autor === "contacto");
      if (!ultimo || !ultimoContacto) continue;

      const paraEste = ultimoContacto.creado_en as string;
      const horas = (ahora - new Date(paraEste).getTime()) / HORA;
      const previo = datos.alerta_fria as Fila | undefined;

      if (ultimo.autor === "contacto") continue; // la persona escribió último: le toca a quien atiende, no a este aviso
      if (horas < AVISO_DESDE_H || horas > AVISO_HASTA_H) continue;
      if (previo?.para === paraEste) continue; // ya se avisó por este silencio

      resultado.revisadas++;
      const { count: citasFuturas } = await admin
        .from("wa_citas")
        .select("id", { count: "exact", head: true })
        .eq("contacto_id", conv.contacto_id)
        .neq("estado", "cancelada")
        .gte("cuando", new Date(ahora).toISOString());
      if (citasFuturas) {
        resultado.descartadas.push({ telefono, motivo: "ya tiene cita" });
        continue;
      }

      try {
        const juicio = await evaluarInteres(ai, cfg, historial);
        let avisado = false;
        if (juicio.interesado && !opciones.simular) {
          const nombre = juicio.nombre || contacto?.nombre || telefono;
          const quedan = Math.max(0, Math.round(24 - horas));
          const detalle = [
            `${nombre} (${telefono}) mostró interés y lleva ${Math.round(horas)} h sin escribir. Todavía podés escribirle libremente por unas ${quedan} h más (después WhatsApp solo deja usar plantillas).`,
            "",
            `Qué quiere o qué lo frena: ${juicio.resumen || "(sin resumen)"}`,
            "",
            "Mensaje que podrías mandarle:",
            juicio.sugerencia || "(sin sugerencia)",
            "",
            `Abrir el chat: ${URL_PANEL}?c=${conv.id}`,
          ].join("\n");
          /* El mensaje NO se manda desde acá: n8n lo recibe en `mensajes` y lo manda por
             Telegram (el mismo canal de los avisos de error, que ya funciona). */
          resultado.mensajes.push({ asunto: `Prospecto interesado se está enfriando: ${nombre}`, detalle });
          avisado = true;
        }
        if (!opciones.simular) {
          await admin
            .from("wa_contactos")
            .update({ datos: { ...datos, alerta_fria: { para: paraEste, avisado, interesado: juicio.interesado, en: new Date().toISOString() } } })
            .eq("id", conv.contacto_id);
        }
        if (juicio.interesado) resultado.avisados.push({ cliente: clienteId, telefono, resumen: juicio.resumen });
        else resultado.descartadas.push({ telefono, motivo: "sin interés real" });
      } catch (e) {
        resultado.errores.push(`${telefono}: ${(e as Error).message}`);
      }
    }
  }
  return resultado;
}

/* =========================================================================
   Reseñas y reactivación: piezas compartidas
   ========================================================================= */

const DIA = 24 * HORA;
const IDIOMA_PLANTILLAS = "es";

/** Hora y fecha en Costa Rica (UTC-6 todo el año, sin horario de verano). */
function enCR(fecha: Date) {
  const cr = new Date(fecha.getTime() - 6 * HORA);
  return { dia: cr.toISOString().slice(0, 10), hora: cr.getUTCHours() };
}

type Tratamiento = "vos" | "usted";
type ConexionConWaba = ConexionWhatsapp & { wabaId: string };

/* Las plantillas no pueden empezar ni terminar con una variable (regla de Meta). */
const PLANTILLAS: Record<string, { categoria: "UTILITY" | "MARKETING"; cuerpo: string; ejemplo: string[] }> = {
  hz_resena_vos: {
    categoria: "UTILITY",
    cuerpo: "¡Hola! Gracias por visitarnos ayer en {{1}}. Si te gustó la atención, nos ayudaría muchísimo tu reseña en Google: {{2}} ¡Muchas gracias!",
    ejemplo: ["Clínica Dental Aurora", "https://g.page/r/ejemplo/review"],
  },
  hz_resena_usted: {
    categoria: "UTILITY",
    cuerpo: "¡Hola! Gracias por visitarnos ayer en {{1}}. Si le gustó la atención, nos ayudaría muchísimo su reseña en Google: {{2}} ¡Muchas gracias!",
    ejemplo: ["Clínica Dental Aurora", "https://g.page/r/ejemplo/review"],
  },
  hz_reactivar_vos: {
    categoria: "MARKETING",
    cuerpo: "¡Hola! Te escribimos de {{1}}: ya pasaron {{2}} meses desde tu última cita de {{3}}. ¿Querés que te apartemos un espacio? Respondé este mensaje y te ayudamos. Si no querés recibir estos avisos, respondé NO.",
    ejemplo: ["Clínica Dental Aurora", "6", "Limpieza dental"],
  },
  hz_reactivar_usted: {
    categoria: "MARKETING",
    cuerpo: "¡Hola! Le escribimos de {{1}}: ya pasaron {{2}} meses desde su última cita de {{3}}. ¿Desea que le apartemos un espacio? Responda este mensaje y le ayudamos. Si no desea recibir estos avisos, responda NO.",
    ejemplo: ["Clínica Dental Aurora", "6", "Limpieza dental"],
  },
};

/** Estado de una plantilla en la WABA ("APPROVED", "PENDING", "REJECTED"…) o null si no existe. */
async function estadoPlantilla(conexion: ConexionConWaba, nombre: string): Promise<string | null> {
  const r = await fetch(
    `${conexion.endpoint}/${conexion.wabaId}/message_templates?name=${nombre}&fields=name,status,language`,
    { headers: { Authorization: `Bearer ${conexion.token}` }, cache: "no-store" }
  );
  const j = (await r.json().catch(() => ({}))) as { data?: { name: string; status: string; language: string }[] };
  return j.data?.find((t) => t.name === nombre && t.language === IDIOMA_PLANTILLAS)?.status ?? null;
}

async function conexionConWaba(clienteId: string): Promise<ConexionConWaba | null> {
  const conexion = await detalleWhatsapp(clienteId);
  if (!conexion) return null;
  const { data } = await supabaseAdmin()
    .from("conexiones")
    .select("detalle")
    .eq("cliente_id", clienteId)
    .eq("servicio", "whatsapp")
    .maybeSingle();
  const wabaId = (data?.detalle as { waba_id?: string } | null)?.waba_id;
  return wabaId ? { ...conexion, wabaId } : null;
}

/**
 * Deja creadas (o confirma) las plantillas de las funciones encendidas.
 * Idempotente. Devuelve el estado de cada una para mostrarlo en el panel.
 */
export async function asegurarPlantillasAutomaticas(
  clienteId: string,
  funciones: { resenas: boolean; reactivar: boolean }
): Promise<Record<string, string>> {
  const conexion = await conexionConWaba(clienteId);
  if (!conexion) return { error: "Falta el WABA ID en la conexión de WhatsApp." };
  const nombres = Object.keys(PLANTILLAS).filter(
    (n) => (funciones.resenas && n.startsWith("hz_resena")) || (funciones.reactivar && n.startsWith("hz_reactivar"))
  );
  const estados: Record<string, string> = {};
  for (const nombre of nombres) {
    const actual = await estadoPlantilla(conexion, nombre);
    if (actual) {
      estados[nombre] = actual;
      continue;
    }
    const p = PLANTILLAS[nombre];
    const r = await fetch(`${conexion.endpoint}/${conexion.wabaId}/message_templates`, {
      method: "POST",
      headers: { Authorization: `Bearer ${conexion.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nombre,
        category: p.categoria,
        language: IDIOMA_PLANTILLAS,
        components: [{ type: "BODY", text: p.cuerpo, example: { body_text: [p.ejemplo] } }],
      }),
    });
    const j = (await r.json().catch(() => ({}))) as { status?: string; error?: { error_user_msg?: string; message?: string } };
    estados[nombre] = r.ok ? (j.status ?? "PENDING") : `ERROR: ${j.error?.error_user_msg ?? j.error?.message ?? r.status}`;
  }
  return estados;
}

async function enviarPlantilla(
  conexion: ConexionWhatsapp,
  telefono: string,
  nombre: string,
  variables: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const r = await fetch(`${conexion.endpoint}/${conexion.phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${conexion.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: telefono.replace("+", ""),
      type: "template",
      template: {
        name: nombre,
        language: { code: IDIOMA_PLANTILLAS },
        components: [{ type: "body", parameters: variables.map((text) => ({ type: "text", text })) }],
      },
    }),
  });
  if (!r.ok) return { ok: false, error: `Meta respondió ${r.status}: ${(await r.text()).slice(0, 200)}` };
  return { ok: true };
}

/** La conversación más reciente del contacto y si la ventana gratis de 24 h sigue abierta. */
async function ventanaDelContacto(contactoId: string): Promise<{ conversacionId: string | null; abierta: boolean }> {
  const admin = supabaseAdmin();
  const { data: conv } = await admin
    .from("wa_conversaciones")
    .select("id")
    .eq("contacto_id", contactoId)
    .order("ultimo_en", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!conv) return { conversacionId: null, abierta: false };
  const { data: ultimo } = await admin
    .from("wa_mensajes")
    .select("creado_en")
    .eq("conversacion_id", conv.id)
    .eq("autor", "contacto")
    .order("creado_en", { ascending: false })
    .limit(1)
    .maybeSingle();
  const abierta = Boolean(ultimo && Date.now() - new Date(ultimo.creado_en as string).getTime() < 23 * HORA);
  return { conversacionId: conv.id as string, abierta };
}

/**
 * Manda un aviso automático: texto libre si la ventana está abierta (gratis),
 * si no, la plantilla. Lo deja escrito en la conversación para verlo en el panel.
 */
async function mandarAviso(
  clienteId: string,
  conexion: ConexionConWaba,
  contactoId: string,
  telefono: string,
  texto: string,
  plantilla: { nombre: string; variables: string[] },
  herramienta: string
): Promise<{ ok: true; via: "texto" | "plantilla" } | { ok: false; error: string }> {
  const { conversacionId, abierta } = await ventanaDelContacto(contactoId);
  let via: "texto" | "plantilla";
  if (abierta) {
    const r = await enviarTextoWhatsapp(conexion, telefono, texto);
    if (!r.ok) return r;
    via = "texto";
  } else {
    const estado = await estadoPlantilla(conexion, plantilla.nombre);
    if (estado !== "APPROVED") {
      return { ok: false, error: `la plantilla ${plantilla.nombre} todavía no está aprobada por Meta (${estado ?? "no existe"})` };
    }
    const r = await enviarPlantilla(conexion, telefono, plantilla.nombre, plantilla.variables);
    if (!r.ok) return r;
    via = "plantilla";
  }
  if (conversacionId) {
    const admin = supabaseAdmin();
    await admin.from("wa_mensajes").insert({
      cliente_id: clienteId,
      conversacion_id: conversacionId,
      autor: "agente",
      tipo: "texto",
      texto,
      herramientas: [herramienta],
    });
    await admin
      .from("wa_conversaciones")
      .update({ ultimo_mensaje: texto, ultimo_en: new Date().toISOString() })
      .eq("id", conversacionId);
  }
  return { ok: true, via };
}

type DatosNegocio = { clienteId: string; cfg: Fila; marca: string; trato: Tratamiento };

async function negociosCon(clave: "resenas" | "reactivar"): Promise<DatosNegocio[]> {
  const { data } = await supabaseAdmin()
    .from("asignaciones")
    .select("cliente_id, config, clientes(nombre_negocio), catalogo_automatizaciones!inner(slug)")
    .eq("catalogo_automatizaciones.slug", "agente-whatsapp")
    .eq("estado", "activa");
  return (data ?? [])
    .filter((a) => ((a.config as Fila | null)?.[clave] as Fila | undefined)?.activo === true)
    .map((a) => {
      const cfg = (a.config ?? {}) as Fila;
      const nombre = (a.clientes as unknown as { nombre_negocio?: string } | null)?.nombre_negocio ?? "";
      return {
        clienteId: a.cliente_id as string,
        cfg,
        marca: (typeof cfg.marca === "string" && cfg.marca) || nombre || "nuestro negocio",
        trato: cfg.trato === "vos" ? "vos" : "usted",
      };
    });
}

export type ResultadoAvisos = {
  enviados: { telefono: string; via: string; texto: string }[];
  omitidos: { telefono: string; motivo: string }[];
  errores: string[];
};

/* =========================================================================
   2. Reseña en Google al día siguiente de la cita
   ========================================================================= */

/** Entre una reseña y otra al mismo paciente: así no se le pide en cada visita. */
const DIAS_ENTRE_RESENAS = 90;

export async function correrResenas(opciones: { simular?: boolean; forzar?: boolean } = {}): Promise<ResultadoAvisos> {
  const resultado: ResultadoAvisos = { enviados: [], omitidos: [], errores: [] };
  const { dia, hora } = enCR(new Date());
  if ((hora < 9 || hora >= 18) && !(opciones.simular && opciones.forzar)) return resultado; // solo en horario decente

  /* "Ayer" en Costa Rica, en UTC: hoy 00:00 CR = hoy 06:00 Z. */
  const hoy0 = new Date(`${dia}T06:00:00Z`).getTime();
  const admin = supabaseAdmin();

  for (const negocio of await negociosCon("resenas")) {
    const url = String((negocio.cfg.resenas as Fila).url ?? "").trim();
    if (!/^https:\/\//.test(url)) {
      resultado.errores.push(`${negocio.clienteId}: falta el enlace de reseñas`);
      continue;
    }
    const conexion = await conexionConWaba(negocio.clienteId);
    if (!conexion) {
      resultado.errores.push(`${negocio.clienteId}: falta WhatsApp o WABA ID`);
      continue;
    }

    const { data: citas } = await admin
      .from("wa_citas")
      .select("id, contacto_id, wa_contactos(telefono, datos)")
      .eq("cliente_id", negocio.clienteId)
      .in("estado", ["confirmada", "cumplida"])
      .gte("cuando", new Date(hoy0 - DIA).toISOString())
      .lt("cuando", new Date(hoy0).toISOString());

    for (const cita of citas ?? []) {
      const c = cita.wa_contactos as unknown as { telefono: string; datos: Fila | null } | null;
      if (!c?.telefono) continue;
      const datos = (c.datos ?? {}) as Fila;
      const previa = datos.resena as Fila | undefined;
      if (previa?.cita_id === cita.id) continue;
      if (previa?.en && Date.now() - new Date(String(previa.en)).getTime() < DIAS_ENTRE_RESENAS * DIA) {
        resultado.omitidos.push({ telefono: c.telefono, motivo: "ya se le pidió reseña hace poco" });
        continue;
      }

      const te = negocio.trato === "vos";
      const texto = `¡Hola! Gracias por visitarnos ayer en ${negocio.marca}. Si ${te ? "te" : "le"} gustó la atención, nos ayudaría muchísimo ${te ? "tu" : "su"} reseña en Google: ${url} ¡Muchas gracias!`;
      if (opciones.simular) {
        resultado.enviados.push({ telefono: c.telefono, via: "simulado", texto });
        continue;
      }
      const envio = await mandarAviso(
        negocio.clienteId,
        conexion,
        cita.contacto_id as string,
        c.telefono,
        texto,
        { nombre: te ? "hz_resena_vos" : "hz_resena_usted", variables: [negocio.marca, url] },
        "resena"
      );
      if (!envio.ok) {
        resultado.errores.push(`${c.telefono}: ${envio.error}`);
        continue;
      }
      await admin
        .from("wa_contactos")
        .update({ datos: { ...datos, resena: { cita_id: cita.id, en: new Date().toISOString(), via: envio.via } } })
        .eq("id", cita.contacto_id);
      resultado.enviados.push({ telefono: c.telefono, via: envio.via, texto });
    }
  }
  return resultado;
}

/* =========================================================================
   3. Reactivar pacientes: "ya te toca tu limpieza"
   ========================================================================= */

const TOPE_DIARIO_POR_DEFECTO = 10;
const NO_QUIERE = /^\s*(no|no gracias|baja|stop|alto|no me escriban|ya no)\b/i;

export async function correrReactivaciones(opciones: { simular?: boolean; forzar?: boolean } = {}): Promise<ResultadoAvisos> {
  const resultado: ResultadoAvisos = { enviados: [], omitidos: [], errores: [] };
  const ahora = new Date();
  const { dia, hora } = enCR(ahora);
  if ((hora < 10 || hora >= 17) && !(opciones.simular && opciones.forzar)) return resultado;
  const admin = supabaseAdmin();

  for (const negocio of await negociosCon("reactivar")) {
    const reglas = (negocio.cfg.reactivar ?? {}) as Fila;
    const meses = (reglas.servicios ?? {}) as Record<string, number>;
    const tope = Number(reglas.tope_dia) > 0 ? Number(reglas.tope_dia) : TOPE_DIARIO_POR_DEFECTO;
    if (!Object.values(meses).some((m) => Number(m) > 0)) continue;

    const conexion = await conexionConWaba(negocio.clienteId);
    if (!conexion) {
      resultado.errores.push(`${negocio.clienteId}: falta WhatsApp o WABA ID`);
      continue;
    }

    const [{ data: citas }, { data: contactos }] = await Promise.all([
      admin
        .from("wa_citas")
        .select("contacto_id, servicio, cuando")
        .eq("cliente_id", negocio.clienteId)
        .neq("estado", "cancelada")
        .order("cuando", { ascending: false })
        .limit(5000),
      admin.from("wa_contactos").select("id, telefono, datos").eq("cliente_id", negocio.clienteId).limit(5000),
    ]);
    const porId = new Map((contactos ?? []).map((c) => [c.id as string, c]));

    /* Quien contestó "NO" a una reactivación no vuelve a recibir ninguna. */
    for (const c of contactos ?? []) {
      const d = (c.datos ?? {}) as Fila;
      const fechas = Object.values((d.reactivar ?? {}) as Record<string, string>).map((f) => new Date(f).getTime());
      if (!fechas.length || d.no_promos) continue;
      const { conversacionId } = await ventanaDelContacto(c.id as string);
      if (!conversacionId) continue;
      const { data: respuestas } = await admin
        .from("wa_mensajes")
        .select("texto")
        .eq("conversacion_id", conversacionId)
        .eq("autor", "contacto")
        .gte("creado_en", new Date(Math.max(...fechas)).toISOString());
      if ((respuestas ?? []).some((m) => NO_QUIERE.test(String(m.texto ?? "")))) {
        d.no_promos = true;
        c.datos = d;
        if (!opciones.simular) await admin.from("wa_contactos").update({ datos: d }).eq("id", c.id);
      }
    }

    const conFuturas = new Set(
      (citas ?? []).filter((x) => new Date(x.cuando as string) > ahora).map((x) => x.contacto_id as string)
    );
    /* La cita pasada más reciente de cada contacto, por servicio. */
    const ultima = new Map<string, { contacto: string; servicio: string; cuando: Date }>();
    for (const x of citas ?? []) {
      const cuando = new Date(x.cuando as string);
      const k = `${x.contacto_id}|${x.servicio}`;
      if (cuando <= ahora && !ultima.has(k)) {
        ultima.set(k, { contacto: x.contacto_id as string, servicio: x.servicio as string, cuando });
      }
    }

    const enviadosHoy = (contactos ?? []).filter((c) =>
      Object.values((((c.datos ?? {}) as Fila).reactivar ?? {}) as Record<string, string>).some(
        (f) => enCR(new Date(f)).dia === dia
      )
    ).length;
    let cupo = tope - enviadosHoy;

    const candidatos = [...ultima.values()]
      .filter((u) => {
        const m = Number(meses[u.servicio]);
        if (!(m > 0) || conFuturas.has(u.contacto)) return false;
        const vence = new Date(u.cuando);
        vence.setMonth(vence.getMonth() + m);
        if (vence > ahora) return false;
        const d = (porId.get(u.contacto)?.datos ?? {}) as Fila;
        if (d.no_promos) return false;
        const yaAvisado = (d.reactivar as Record<string, string> | undefined)?.[u.servicio];
        return !yaAvisado || new Date(yaAvisado) < u.cuando;
      })
      .sort((a, b) => a.cuando.getTime() - b.cuando.getTime());

    for (const u of candidatos) {
      const contacto = porId.get(u.contacto);
      const telefono = contacto?.telefono as string | undefined;
      if (!contacto || !telefono) continue;
      if (cupo <= 0) {
        resultado.omitidos.push({ telefono, motivo: "tope diario alcanzado (sigue mañana)" });
        continue;
      }
      const mesesPasados = Math.max(1, Math.round((ahora.getTime() - u.cuando.getTime()) / (30 * DIA)));
      const te = negocio.trato === "vos";
      /* En minúscula para que se lea natural: "cita de limpieza dental". */
      const servicio = u.servicio.charAt(0).toLowerCase() + u.servicio.slice(1);
      const texto = te
        ? `¡Hola! Te escribimos de ${negocio.marca}: ya pasaron ${mesesPasados} meses desde tu última cita de ${servicio}. ¿Querés que te apartemos un espacio? Respondé este mensaje y te ayudamos. Si no querés recibir estos avisos, respondé NO.`
        : `¡Hola! Le escribimos de ${negocio.marca}: ya pasaron ${mesesPasados} meses desde su última cita de ${servicio}. ¿Desea que le apartemos un espacio? Responda este mensaje y le ayudamos. Si no desea recibir estos avisos, responda NO.`;
      if (opciones.simular) {
        resultado.enviados.push({ telefono, via: "simulado", texto });
        cupo--;
        continue;
      }
      const envio = await mandarAviso(
        negocio.clienteId,
        conexion,
        u.contacto,
        telefono,
        texto,
        { nombre: te ? "hz_reactivar_vos" : "hz_reactivar_usted", variables: [negocio.marca, String(mesesPasados), servicio] },
        "reactivar"
      );
      if (!envio.ok) {
        resultado.errores.push(`${telefono}: ${envio.error}`);
        continue;
      }
      const d = (contacto.datos ?? {}) as Fila;
      const nuevo = { ...d, reactivar: { ...((d.reactivar as Fila) ?? {}), [u.servicio]: new Date().toISOString() } };
      contacto.datos = nuevo;
      await admin.from("wa_contactos").update({ datos: nuevo }).eq("id", u.contacto);
      resultado.enviados.push({ telefono, via: envio.via, texto });
      cupo--;
    }
  }
  return resultado;
}
