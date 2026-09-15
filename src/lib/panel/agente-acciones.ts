/* ==========================================================================
   Acciones del Agente de WhatsApp — las que ESCRIBEN.

   NO SON Server Actions, por el mismo motivo que `admin-acciones.ts`: los
   Server Actions perdían la cookie de sesión en el POST detrás del proxy, en
   dos plataformas distintas, con evidencia real (ver
   `project_proxy_refresca_sesion` en la memoria del proyecto). Un Route
   Handler normal sí la conserva. Estas funciones las llama
   `/api/agente/[nombre]/route.ts` por POST — el cableado HTTP vive ahí, acá
   solo el negocio.

   Cada una vuelve a comprobar sesión con `exigirCliente()`: es un endpoint
   POST público, cualquiera con la URL puede llamarlo.
   ========================================================================== */
import { revalidatePath } from "next/cache";
import { supabaseAdmin, supabaseConToken, supabaseServidor } from "@/lib/supabase/servidor";
import { getPerfil } from "./datos";
import { leerConfigAgenda, leerConfigAgente } from "./agente-config";

export type ResultadoAccion =
  | { ok: true; mensaje: string }
  | { ok: false; error: string };

type ResultadoClienteId =
  | { ok: true; clienteId: string; perfilId: string }
  | { ok: false; error: string };

/**
 * Portón de las acciones del agente. Mismo patrón de tres capas que
 * `exigirAdmin`, pero exige "cliente con negocio" en vez de "admin": la
 * cookie de sesión (camino normal), el `_token` del formulario como red de
 * seguridad, y una última relectura con service_role si la cookie llegó
 * pero la consulta de perfil falló.
 */
async function exigirCliente(form?: FormData): Promise<ResultadoClienteId> {
  const perfil = await getPerfil();
  if (perfil.clienteId) return { ok: true, clienteId: perfil.clienteId, perfilId: perfil.id };

  const token = form?.get("_token");
  if (typeof token === "string" && token.length > 20) {
    try {
      const { data: u } = await supabaseConToken(token).auth.getUser(token);
      const uid = u.user?.id;
      if (uid) {
        const { data } = await supabaseAdmin()
          .from("perfiles")
          .select("cliente_id")
          .eq("id", uid)
          .maybeSingle();
        if (data?.cliente_id) return { ok: true, clienteId: data.cliente_id, perfilId: uid };
        console.error(`[exigirCliente] token ok uid=${uid} pero sin cliente_id`);
      } else {
        console.error("[exigirCliente] el _token del form no validó contra Supabase");
      }
    } catch (e) {
      console.error("[exigirCliente] error validando _token:", (e as Error).message);
    }
  }

  if (perfil.id !== "sin-sesion") {
    const { data } = await supabaseAdmin()
      .from("perfiles")
      .select("cliente_id")
      .eq("id", perfil.id)
      .maybeSingle();
    if (data?.cliente_id) return { ok: true, clienteId: data.cliente_id, perfilId: perfil.id };
  }

  console.error(`[exigirCliente] sin autorización — perfil.id=${perfil.id}`);
  return { ok: false, error: "No autorizado." };
}

function revalidarAgente() {
  for (const ruta of [
    "/panel/agente",
    "/panel/agente/conversaciones",
    "/panel/agente/contactos",
    "/panel/agente/citas",
    "/panel/agente/correcciones",
    "/panel/agente/que-sabe",
    "/panel/agente/como-responde",
    "/panel/agente/correo",
  ]) {
    revalidatePath(ruta);
  }
}

/** El `detalle` de la conexión de WhatsApp de un cliente, ya validado. */
async function detalleWhatsapp(
  clienteId: string
): Promise<{ token: string; endpoint: string; phoneNumberId: string } | null> {
  const sb = supabaseAdmin();
  const { data: conexion } = await sb
    .from("conexiones")
    .select("detalle")
    .eq("cliente_id", clienteId)
    .eq("servicio", "whatsapp")
    .maybeSingle();

  const detalle = (conexion?.detalle ?? {}) as {
    token?: string;
    endpoint?: string;
    phone_number_id?: string;
  };
  if (!detalle.token || !detalle.phone_number_id) return null;

  return {
    token: detalle.token,
    endpoint: detalle.endpoint || "https://graph.facebook.com/v21.0",
    phoneNumberId: detalle.phone_number_id,
  };
}

/**
 * Manda un mensaje de verdad por la API de Meta. Si falla, el llamador
 * decide qué hacer — nunca se guarda como si hubiera salido.
 */
async function enviarPorWhatsapp(
  clienteId: string,
  telefono: string,
  texto: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const detalle = await detalleWhatsapp(clienteId);
  if (!detalle) {
    return { ok: false, error: "Este negocio todavía no tiene conectado un número de WhatsApp." };
  }
  const { endpoint, phoneNumberId, token } = detalle;

  try {
    const res = await fetch(`${endpoint}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: telefono.replace("+", ""),
        type: "text",
        text: { preview_url: false, body: texto },
      }),
    });
    if (!res.ok) {
      const cuerpo = await res.text();
      return { ok: false, error: `Meta respondió ${res.status}: ${cuerpo.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/* -------------------------------------------------------------------------
   Responder manualmente / tomar y devolver el control
   ------------------------------------------------------------------------- */

export async function enviarMensajeManual(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const conversacionId = String(form.get("conversacionId") ?? "");
  const texto = String(form.get("texto") ?? "").trim();
  if (!conversacionId || !texto) return { ok: false, error: "Falta el mensaje." };

  const sb = await supabaseServidor();
  const { data: conv, error: eConv } = await sb
    .from("wa_conversaciones")
    .select("id, contacto_id, wa_contactos(telefono)")
    .eq("id", conversacionId)
    .eq("cliente_id", auth.clienteId)
    .maybeSingle();
  if (eConv || !conv) return { ok: false, error: "No encontré esa conversación." };

  const telefono = (conv.wa_contactos as unknown as { telefono: string } | null)?.telefono;
  if (!telefono) return { ok: false, error: "Ese contacto no tiene teléfono guardado." };

  const envio = await enviarPorWhatsapp(auth.clienteId, telefono, texto);
  if (!envio.ok) return { ok: false, error: `No se pudo enviar: ${envio.error}` };

  await sb.from("wa_mensajes").insert({
    cliente_id: auth.clienteId,
    conversacion_id: conversacionId,
    autor: "humano",
    tipo: "texto",
    texto,
  });

  await sb
    .from("wa_conversaciones")
    .update({
      estado: "humano",
      motivo_espera: "",
      tomada_por: auth.perfilId,
      tomada_en: new Date().toISOString(),
      ultimo_mensaje: texto,
      ultimo_en: new Date().toISOString(),
    })
    .eq("id", conversacionId);

  revalidarAgente();
  return { ok: true, mensaje: "Mensaje enviado." };
}

export async function tomarControl(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const conversacionId = String(form.get("conversacionId") ?? "");
  if (!conversacionId) return { ok: false, error: "Falta la conversación." };

  const sb = await supabaseServidor();
  const { error } = await sb
    .from("wa_conversaciones")
    .update({ estado: "humano", tomada_por: auth.perfilId, tomada_en: new Date().toISOString() })
    .eq("id", conversacionId)
    .eq("cliente_id", auth.clienteId);
  if (error) return { ok: false, error: error.message };

  revalidarAgente();
  return { ok: true, mensaje: "Tomaste el control. El agente no responde acá hasta que se lo devolvás." };
}

export async function devolverAgente(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const conversacionId = String(form.get("conversacionId") ?? "");
  if (!conversacionId) return { ok: false, error: "Falta la conversación." };

  const sb = await supabaseServidor();
  const { error } = await sb
    .from("wa_conversaciones")
    .update({ estado: "agente", motivo_espera: "", tomada_por: null, tomada_en: null })
    .eq("id", conversacionId)
    .eq("cliente_id", auth.clienteId);
  if (error) return { ok: false, error: error.message };

  revalidarAgente();
  return { ok: true, mensaje: "Listo, el agente sigue la conversación." };
}

/* -------------------------------------------------------------------------
   Correo — responder manualmente / tomar y devolver el control.

   Mismo patrón que WhatsApp, pero el envío no pasa por Meta: usa las
   credenciales SMTP de la casilla que el admin conectó (`conexiones`,
   servicio "correo"). Mismo principio de siempre: si el SMTP rechaza el
   envío, NUNCA se guarda como si hubiera salido.
   ------------------------------------------------------------------------- */

async function detalleCorreo(
  clienteId: string
): Promise<{ correo: string; claveApp: string; smtpHost: string; smtpPort: number; nombreRemitente: string } | null> {
  const sb = supabaseAdmin();
  const { data: conexion } = await sb
    .from("conexiones")
    .select("detalle")
    .eq("cliente_id", clienteId)
    .eq("servicio", "correo")
    .maybeSingle();

  const detalle = (conexion?.detalle ?? {}) as {
    correo?: string;
    clave_app?: string;
    smtp_host?: string;
    smtp_port?: number;
    nombre_remitente?: string;
  };
  if (!detalle.correo || !detalle.clave_app) return null;

  return {
    correo: detalle.correo,
    claveApp: detalle.clave_app,
    smtpHost: detalle.smtp_host || "smtp.gmail.com",
    smtpPort: detalle.smtp_port || 465,
    nombreRemitente: detalle.nombre_remitente || "",
  };
}

async function enviarPorCorreo(
  clienteId: string,
  destinatario: string,
  asunto: string,
  texto: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const detalle = await detalleCorreo(clienteId);
  if (!detalle) {
    return { ok: false, error: "Este negocio todavía no tiene conectado un correo." };
  }

  try {
    const nodemailer = await import("nodemailer");
    const transportador = nodemailer.createTransport({
      host: detalle.smtpHost,
      port: detalle.smtpPort,
      secure: detalle.smtpPort === 465,
      auth: { user: detalle.correo, pass: detalle.claveApp },
    });
    await transportador.sendMail({
      from: detalle.nombreRemitente ? `${detalle.nombreRemitente} <${detalle.correo}>` : detalle.correo,
      to: destinatario,
      subject: asunto,
      text: texto,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function enviarMensajeManualCorreo(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const conversacionId = String(form.get("conversacionId") ?? "");
  const texto = String(form.get("texto") ?? "").trim();
  if (!conversacionId || !texto) return { ok: false, error: "Falta el mensaje." };

  const sb = await supabaseServidor();
  const { data: conv, error: eConv } = await sb
    .from("correo_conversaciones")
    .select("id, contacto_id, correo_contactos(correo)")
    .eq("id", conversacionId)
    .eq("cliente_id", auth.clienteId)
    .maybeSingle();
  if (eConv || !conv) return { ok: false, error: "No encontré esa conversación." };

  const correoDestino = (conv.correo_contactos as unknown as { correo: string } | null)?.correo;
  if (!correoDestino) return { ok: false, error: "Ese contacto no tiene correo guardado." };

  const { data: ultimo } = await sb
    .from("correo_mensajes")
    .select("asunto")
    .eq("conversacion_id", conversacionId)
    .order("creado_en", { ascending: false })
    .limit(1)
    .maybeSingle();
  const asuntoBase = ultimo?.asunto || "(sin asunto)";
  const asunto = /^re:/i.test(asuntoBase) ? asuntoBase : `Re: ${asuntoBase}`;

  const envio = await enviarPorCorreo(auth.clienteId, correoDestino, asunto, texto);
  if (!envio.ok) return { ok: false, error: `No se pudo enviar: ${envio.error}` };

  await sb.from("correo_mensajes").insert({
    cliente_id: auth.clienteId,
    conversacion_id: conversacionId,
    autor: "humano",
    asunto,
    texto,
  });

  await sb
    .from("correo_conversaciones")
    .update({
      estado: "humano",
      motivo_espera: "",
      tomada_por: auth.perfilId,
      tomada_en: new Date().toISOString(),
      ultimo_mensaje: texto,
      ultimo_en: new Date().toISOString(),
    })
    .eq("id", conversacionId);

  revalidarAgente();
  return { ok: true, mensaje: "Correo enviado." };
}

export async function tomarControlCorreo(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const conversacionId = String(form.get("conversacionId") ?? "");
  if (!conversacionId) return { ok: false, error: "Falta la conversación." };

  const sb = await supabaseServidor();
  const { error } = await sb
    .from("correo_conversaciones")
    .update({ estado: "humano", tomada_por: auth.perfilId, tomada_en: new Date().toISOString() })
    .eq("id", conversacionId)
    .eq("cliente_id", auth.clienteId);
  if (error) return { ok: false, error: error.message };

  revalidarAgente();
  return { ok: true, mensaje: "Tomaste el control. El agente no responde acá hasta que se lo devolvás." };
}

export async function devolverAgenteCorreo(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const conversacionId = String(form.get("conversacionId") ?? "");
  if (!conversacionId) return { ok: false, error: "Falta la conversación." };

  const sb = await supabaseServidor();
  const { error } = await sb
    .from("correo_conversaciones")
    .update({ estado: "agente", motivo_espera: "", tomada_por: null, tomada_en: null })
    .eq("id", conversacionId)
    .eq("cliente_id", auth.clienteId);
  if (error) return { ok: false, error: error.message };

  revalidarAgente();
  return { ok: true, mensaje: "Listo, el agente sigue la conversación." };
}

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Redactar un correo NUEVO a cualquier dirección — a diferencia de
 * `enviarMensajeManualCorreo`, que solo responde DENTRO de una conversación
 * ya abierta. Reusa las mismas tablas (`correo_contactos`/
 * `correo_conversaciones`/`correo_mensajes`) para que ese hilo aparezca
 * normal en la bandeja después — no es un canal aparte, es la misma
 * conversación entrando por el otro lado.
 */
export async function iniciarCorreoNuevo(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const destinatario = String(form.get("destinatario") ?? "").trim().toLowerCase();
  const nombre = String(form.get("nombre") ?? "").trim();
  const asunto = String(form.get("asunto") ?? "").trim() || "(sin asunto)";
  const texto = String(form.get("texto") ?? "").trim();
  if (!destinatario || !texto) return { ok: false, error: "Faltan el destinatario y el mensaje." };
  if (!CORREO_VALIDO.test(destinatario)) return { ok: false, error: "Ese correo no parece válido." };

  /* service_role: crear un contacto/conversación NUEVO no tiene política de
     insert para un cliente normal — `correo_contactos`/`correo_conversaciones`
     se pensaron para que solo n8n los cree al entrar un correo. Acá se
     necesita lo mismo, entrando por el otro lado (el dueño escribe primero). */
  const admin = supabaseAdmin();

  const { data: contacto, error: eContacto } = await admin
    .from("correo_contactos")
    .upsert(
      { cliente_id: auth.clienteId, correo: destinatario, nombre: nombre || undefined },
      { onConflict: "cliente_id,correo", ignoreDuplicates: false }
    )
    .select("id")
    .single();
  if (eContacto || !contacto) return { ok: false, error: eContacto?.message || "No se pudo crear el contacto." };

  const { data: conversacion, error: eConv } = await admin
    .from("correo_conversaciones")
    .upsert(
      { cliente_id: auth.clienteId, contacto_id: contacto.id, estado: "humano" },
      { onConflict: "contacto_id", ignoreDuplicates: false }
    )
    .select("id")
    .single();
  if (eConv || !conversacion) return { ok: false, error: eConv?.message || "No se pudo abrir la conversación." };

  const envio = await enviarPorCorreo(auth.clienteId, destinatario, asunto, texto);
  if (!envio.ok) return { ok: false, error: `No se pudo enviar: ${envio.error}` };

  await admin.from("correo_mensajes").insert({
    cliente_id: auth.clienteId,
    conversacion_id: conversacion.id,
    autor: "humano",
    asunto,
    texto,
  });

  await admin
    .from("correo_conversaciones")
    .update({
      estado: "humano",
      tomada_por: auth.perfilId,
      tomada_en: new Date().toISOString(),
      ultimo_mensaje: texto,
      ultimo_en: new Date().toISOString(),
    })
    .eq("id", conversacion.id);

  revalidarAgente();
  return { ok: true, mensaje: "Correo enviado." };
}

/* -------------------------------------------------------------------------
   Correcciones — enseñarle o descartar
   ------------------------------------------------------------------------- */

export async function ensenarCorreccion(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const correccionId = String(form.get("correccionId") ?? "");
  const respuesta = String(form.get("respuesta") ?? "").trim();
  if (!correccionId || !respuesta) return { ok: false, error: "Escribí la respuesta primero." };

  const sb = await supabaseServidor();
  const { data: correccion, error: eCorr } = await sb
    .from("wa_correcciones")
    .select("id, pregunta")
    .eq("id", correccionId)
    .eq("cliente_id", auth.clienteId)
    .maybeSingle();
  if (eCorr || !correccion) return { ok: false, error: "No encontré esa pregunta." };

  const { data: max } = await sb
    .from("wa_conocimiento")
    .select("orden")
    .eq("cliente_id", auth.clienteId)
    .eq("tipo", "dato")
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error: eIns } = await sb.from("wa_conocimiento").insert({
    cliente_id: auth.clienteId,
    tipo: "dato",
    clave: correccion.pregunta,
    valor: respuesta,
    orden: (max?.orden ?? 0) + 1,
    activo: true,
  });
  if (eIns) return { ok: false, error: eIns.message };

  await sb
    .from("wa_correcciones")
    .update({ estado: "ensenada", respuesta, respondida_en: new Date().toISOString() })
    .eq("id", correccionId);

  revalidarAgente();
  return { ok: true, mensaje: "Enseñado. El agente lo va a usar desde la próxima conversación." };
}

export async function descartarCorreccion(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const correccionId = String(form.get("correccionId") ?? "");
  if (!correccionId) return { ok: false, error: "Falta la pregunta." };

  const sb = await supabaseServidor();
  const { error } = await sb
    .from("wa_correcciones")
    .update({ estado: "descartada" })
    .eq("id", correccionId)
    .eq("cliente_id", auth.clienteId);
  if (error) return { ok: false, error: error.message };

  revalidarAgente();
  return { ok: true, mensaje: "Descartada." };
}

/* -------------------------------------------------------------------------
   Citas — cancelar o marcar cumplida
   ------------------------------------------------------------------------- */

export async function cancelarCita(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const citaId = String(form.get("citaId") ?? "");
  if (!citaId) return { ok: false, error: "Falta la cita." };

  const sb = await supabaseServidor();
  const { data: cita, error: eCita } = await sb
    .from("wa_citas")
    .select("id, cuando, servicio, contacto_id, wa_contactos(telefono)")
    .eq("id", citaId)
    .eq("cliente_id", auth.clienteId)
    .maybeSingle();
  if (eCita || !cita) return { ok: false, error: "No encontré esa cita." };

  const { error } = await sb.from("wa_citas").update({ estado: "cancelada" }).eq("id", citaId);
  if (error) return { ok: false, error: error.message };

  const telefono = (cita.wa_contactos as unknown as { telefono: string } | null)?.telefono;
  if (telefono) {
    /* wa_mensajes.conversacion_id es NOT NULL: hay que ubicar el hilo de
       este contacto (siempre existe uno — es el mismo hilo para siempre,
       nunca uno por cita) para poder dejar el aviso ahí. */
    const { data: conv } = await sb
      .from("wa_conversaciones")
      .select("id")
      .eq("contacto_id", cita.contacto_id)
      .maybeSingle();
    const cuando = new Date(cita.cuando).toLocaleString("es-CR", {
      timeZone: "America/Costa_Rica",
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
    });
    const texto = `Le escribimos para avisarle que su cita${cita.servicio ? " de " + cita.servicio : ""} del ${cuando} quedó cancelada. Si quiere reagendarla, escríbanos por acá.`;
    const envio = await enviarPorWhatsapp(auth.clienteId, telefono, texto);
    if (envio.ok && conv?.id) {
      await sb.from("wa_mensajes").insert({
        cliente_id: auth.clienteId,
        conversacion_id: conv.id,
        autor: "humano",
        tipo: "texto",
        texto,
      });
      await sb
        .from("wa_conversaciones")
        .update({ ultimo_mensaje: texto, ultimo_en: new Date().toISOString() })
        .eq("id", conv.id);
    }
  }

  revalidarAgente();
  return { ok: true, mensaje: "Cita cancelada y paciente avisado." };
}

export async function marcarCitaCumplida(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const citaId = String(form.get("citaId") ?? "");
  if (!citaId) return { ok: false, error: "Falta la cita." };

  const sb = await supabaseServidor();
  const { error } = await sb
    .from("wa_citas")
    .update({ estado: "cumplida" })
    .eq("id", citaId)
    .eq("cliente_id", auth.clienteId);
  if (error) return { ok: false, error: error.message };

  revalidarAgente();
  return { ok: true, mensaje: "Marcada como cumplida." };
}

/**
 * Agendar una cita A MANO — el escape que le faltaba al panel: todo lo que
 * el bot puede hacer solo, una persona lo tiene que poder hacer también
 * (llamada por teléfono, alguien que llega sin avisar, un favor puntual).
 *
 * Usa LA MISMA función atómica `wa_reservar_cita` que usa el workflow de
 * n8n — así nunca se pasa de la capacidad configurada ni ignora el colchón
 * entre citas: son literalmente las mismas reglas, no una copia que se
 * pueda desincronizar. Antes de reservar, valida horario y anticipación
 * con la misma lógica que ya usa `📅 Calcular disponibilidad` en el
 * workflow (grilla en hora de Costa Rica, offset fijo -06:00).
 */
export async function agendarCitaManual(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const contactoId = String(form.get("contactoId") ?? "").trim();
  const telefonoNuevo = String(form.get("telefonoNuevo") ?? "").trim();
  const nombreNuevo = String(form.get("nombreNuevo") ?? "").trim();
  const servicioClave = String(form.get("servicio") ?? "").trim();
  const fecha = String(form.get("fecha") ?? "");
  const hora = String(form.get("hora") ?? "");
  if ((!contactoId && !telefonoNuevo) || !servicioClave || !fecha || !hora) {
    return { ok: false, error: "Faltan datos: a quién, servicio, fecha y hora." };
  }

  const sb = await supabaseServidor();

  let contacto: { id: string; nombre: string; telefono: string } | null = null;

  if (contactoId) {
    const { data, error } = await sb
      .from("wa_contactos")
      .select("id, nombre, telefono")
      .eq("id", contactoId)
      .eq("cliente_id", auth.clienteId)
      .maybeSingle();
    if (error || !data) return { ok: false, error: "No encontré ese contacto." };
    contacto = data;
  } else {
    /* Número escrito a mano — alguien que nunca escribió por WhatsApp
       (llegó sin avisar, llamó por teléfono). Mismo hueco que ya se resolvió
       para Correo: `wa_contactos` tampoco tiene grant de insert para un
       cliente normal (solo n8n/service_role crea contactos nuevos), así que
       esto usa `supabaseAdmin()` para ESTA escritura puntual. */
    const telefonoLimpio = telefonoNuevo.replace(/[^\d+]/g, "");
    if (telefonoLimpio.replace(/\+/g, "").length < 8) {
      return { ok: false, error: "Ese número no parece válido — escribilo con código de país (ej. 50688881234)." };
    }
    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from("wa_contactos")
      .upsert(
        { cliente_id: auth.clienteId, telefono: telefonoLimpio, nombre: nombreNuevo || undefined },
        { onConflict: "cliente_id,telefono", ignoreDuplicates: false }
      )
      .select("id, nombre, telefono")
      .single();
    if (error || !data) return { ok: false, error: error?.message || "No se pudo crear el contacto." };
    contacto = data;
  }

  const { data: servicio, error: eServicio } = await sb
    .from("wa_conocimiento")
    .select("clave, monto, duracion_min")
    .eq("cliente_id", auth.clienteId)
    .eq("tipo", "servicio")
    .eq("clave", servicioClave)
    .maybeSingle();
  if (eServicio || !servicio) return { ok: false, error: "No encontré ese servicio." };

  const asignacion = await traerAsignacionAgente(sb, auth.clienteId);
  if (!asignacion) return { ok: false, error: "No encontré la asignación del agente." };
  const agenda = leerConfigAgenda(asignacion.config);

  const { data: clienteRow } = await sb.from("clientes").select("horario").eq("id", auth.clienteId).maybeSingle();
  const horario = (clienteRow?.horario ?? {}) as Record<string, [string, string][]>;

  const duracionMin = Number(servicio.duracion_min) > 0 ? Number(servicio.duracion_min) : 30;

  const cuando = new Date(`${fecha}T${hora}:00-06:00`);
  if (Number.isNaN(cuando.getTime())) return { ok: false, error: "Fecha u hora inválida." };

  const ahora = Date.now();
  if (cuando.getTime() < ahora + agenda.anticipacionMin * 60_000) {
    return {
      ok: false,
      error: `Tiene que ser al menos ${agenda.anticipacionMin} minutos desde ahora — es la anticipación mínima configurada en "Cómo responde".`,
    };
  }
  if (cuando.getTime() > ahora + agenda.maximoDiasAdelante * 86_400_000) {
    return {
      ok: false,
      error: `No se puede agendar con más de ${agenda.maximoDiasAdelante} días de anticipación.`,
    };
  }

  /* Costa Rica es -06:00 fijo (sin horario de verano): restar 6h del UTC
     da directo el día/hora de pared correctos, sin depender de en qué
     zona horaria corra el servidor — mismo truco que usa el workflow. */
  const DIAS_SEMANA = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
  const crWall = new Date(cuando.getTime() - 6 * 3_600_000);
  const nombreDia = DIAS_SEMANA[crWall.getUTCDay()];
  const bloques = Array.isArray(horario[nombreDia]) ? horario[nombreDia] : [];

  const inicioMin = crWall.getUTCHours() * 60 + crWall.getUTCMinutes();
  const finMin = inicioMin + duracionMin;
  const cabeEnHorario = bloques.some((b) => {
    if (!Array.isArray(b) || b.length !== 2) return false;
    const [ini, fin] = b;
    const [hIni, mIni] = String(ini).split(":").map(Number);
    const [hFin, mFin] = String(fin).split(":").map(Number);
    return inicioMin >= hIni * 60 + mIni && finMin <= hFin * 60 + mFin;
  });
  if (!cabeEnHorario) {
    return {
      ok: false,
      error: "Ese horario no cae dentro del horario del negocio ese día (o la cita no cabe completa antes de cerrar).",
    };
  }

  const admin = supabaseAdmin();
  const { data: citaCreada, error: eRpc } = await admin.rpc("wa_reservar_cita", {
    p_cliente_id: auth.clienteId,
    p_contacto_id: contacto.id,
    p_cuando: cuando.toISOString(),
    p_servicio: servicio.clave,
    p_monto: servicio.monto,
    p_duracion_min: duracionMin,
    p_capacidad: agenda.capacidad,
    p_colchon_min: agenda.colchonMin,
  });
  if (eRpc) return { ok: false, error: eRpc.message };
  if (!citaCreada) {
    return { ok: false, error: "Ya no hay cupo en ese horario — alguien más lo tomó. Probá otro horario." };
  }

  /* Mismo aviso que manda `cancelarCita`: que la persona se entere por
     WhatsApp, no que se quede pensando que nadie confirmó nada. */
  if (contacto.telefono) {
    const cuandoTexto = cuando.toLocaleString("es-CR", {
      timeZone: "America/Costa_Rica",
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
    });
    const texto = `Le confirmamos su cita${servicio.clave ? " de " + servicio.clave : ""} para el ${cuandoTexto}. Cualquier cambio, escríbanos por acá.`;
    const envio = await enviarPorWhatsapp(auth.clienteId, contacto.telefono, texto);
    if (envio.ok) {
      const { data: conv } = await sb
        .from("wa_conversaciones")
        .select("id")
        .eq("contacto_id", contacto.id)
        .maybeSingle();
      if (conv?.id) {
        await sb.from("wa_mensajes").insert({
          cliente_id: auth.clienteId,
          conversacion_id: conv.id,
          autor: "humano",
          tipo: "texto",
          texto,
        });
        await sb
          .from("wa_conversaciones")
          .update({ ultimo_mensaje: texto, ultimo_en: new Date().toISOString() })
          .eq("id", conv.id);
      }
    } else {
      /* La cita SÍ quedó — eso ya pasó por `wa_reservar_cita` y no se
         deshace. Pero avisar que "se le avisó por WhatsApp" cuando en
         realidad el envío falló (token vencido, número inválido, lo que
         sea) es exactamente el error que no se puede cometer: quien lea
         esto tiene que saber que tiene que avisarle a mano. */
      revalidarAgente();
      return {
        ok: true,
        mensaje: `Cita agendada, pero NO se pudo avisar por WhatsApp (${envio.error}). Avisále a mano.`,
      };
    }
  }

  revalidarAgente();
  return { ok: true, mensaje: "Cita agendada y paciente avisado por WhatsApp." };
}

/* -------------------------------------------------------------------------
   Cómo responde / Cómo agenda
   ------------------------------------------------------------------------- */

async function traerAsignacionAgente(sb: Awaited<ReturnType<typeof supabaseServidor>>, clienteId: string) {
  const { data } = await sb
    .from("asignaciones")
    .select("id, config, catalogo_automatizaciones(slug)")
    .eq("cliente_id", clienteId);

  const fila = (data ?? []).find(
    (r) => (r.catalogo_automatizaciones as { slug?: string } | null)?.slug === "agente-whatsapp"
  );
  return fila ? { id: fila.id as string, config: (fila.config ?? {}) as Record<string, unknown> } : null;
}

export async function guardarConfigAgente(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const sb = await supabaseServidor();
  const asignacion = await traerAsignacionAgente(sb, auth.clienteId);
  if (!asignacion) return { ok: false, error: "No encontré la asignación del agente." };

  const actual = leerConfigAgente(asignacion.config);
  const escalar = String(form.get("escalar") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const nuevoConfig = {
    ...asignacion.config,
    trato: form.get("trato") === "vos" ? "vos" : "usted",
    estilo: String(form.get("estilo") ?? actual.estilo).trim() || actual.estilo,
    emojis: form.get("emojis") ?? actual.emojis,
    largo: form.get("largo") ?? actual.largo,
    esperaSegundos: Math.min(60, Math.max(0, Number(form.get("esperaSegundos") ?? actual.esperaSegundos))),
    escalar: escalar.length ? escalar : actual.escalar,
    fueraDeHorario: form.get("fueraDeHorario") ?? actual.fueraDeHorario,
    transcribirAudios: form.get("transcribirAudios") === "on",
  };

  const { error } = await sb.from("asignaciones").update({ config: nuevoConfig }).eq("id", asignacion.id);
  if (error) return { ok: false, error: error.message };

  revalidarAgente();
  return { ok: true, mensaje: "Guardado. Se aplica desde la siguiente conversación." };
}

const DIAS_ORDEN = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"] as const;

export async function guardarAgenda(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const sb = await supabaseServidor();
  const asignacion = await traerAsignacionAgente(sb, auth.clienteId);
  if (!asignacion) return { ok: false, error: "No encontré la asignación del agente." };

  const num = (v: FormDataEntryValue | null, def: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };

  const nuevaAgenda = {
    activa: form.get("activa") === "on",
    capacidad: Math.min(20, Math.max(1, num(form.get("capacidad"), 1))),
    colchonMin: Math.min(120, Math.max(0, num(form.get("colchonMin"), 0))),
    anticipacionMin: Math.min(1440, Math.max(0, num(form.get("anticipacionMin"), 60))),
    maximoDiasAdelante: Math.min(90, Math.max(1, num(form.get("maximoDiasAdelante"), 30))),
  };

  const horario: Record<string, [string, string][]> = {};
  for (const dia of DIAS_ORDEN) {
    const cerrado = form.get(`cerrado_${dia}`) === "on";
    const ini = String(form.get(`ini_${dia}`) ?? "");
    const fin = String(form.get(`fin_${dia}`) ?? "");
    horario[dia] = cerrado || !ini || !fin ? [] : [[ini, fin]];
  }

  const nuevoConfig = { ...asignacion.config, agenda: nuevaAgenda };

  const { error: e1 } = await sb.from("asignaciones").update({ config: nuevoConfig }).eq("id", asignacion.id);
  if (e1) return { ok: false, error: e1.message };

  const { error: e2 } = await sb.from("clientes").update({ horario }).eq("id", auth.clienteId);
  if (e2) return { ok: false, error: e2.message };

  revalidarAgente();
  return { ok: true, mensaje: "Guardado. El agente ya calcula disponibilidad con esto." };
}

/* -------------------------------------------------------------------------
   Perfil de WhatsApp — lo que la gente ve al abrir el chat (foto, "info",
   descripción, dirección, sitio). Se guarda directo en Meta por la Graph
   API; no hay copia en Supabase que se pueda desincronizar — `getPerfilWhatsapp`
   siempre lee de ahí.
   ------------------------------------------------------------------------- */
export async function guardarPerfilWhatsapp(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const detalle = await detalleWhatsapp(auth.clienteId);
  if (!detalle) return { ok: false, error: "Todavía no hay un WhatsApp conectado." };

  const about = String(form.get("about") ?? "").trim().slice(0, 139);
  const descripcion = String(form.get("descripcion") ?? "").trim().slice(0, 512);
  const direccion = String(form.get("direccion") ?? "").trim().slice(0, 256);
  const correo = String(form.get("correo") ?? "").trim().slice(0, 128);
  const sitio = String(form.get("sitio") ?? "").trim().slice(0, 256);
  const vertical = String(form.get("vertical") ?? "OTHER").trim();

  try {
    const res = await fetch(`${detalle.endpoint}/${detalle.phoneNumberId}/whatsapp_business_profile`, {
      method: "POST",
      headers: { Authorization: `Bearer ${detalle.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        about,
        description: descripcion,
        address: direccion,
        email: correo,
        websites: sitio ? [sitio] : [],
        vertical,
      }),
    });
    if (!res.ok) {
      const cuerpo = await res.json().catch(() => ({}));
      return { ok: false, error: `Meta rechazó los datos: ${cuerpo?.error?.message || res.status}` };
    }
  } catch (e) {
    return { ok: false, error: `No se pudo guardar: ${(e as Error).message}` };
  }

  revalidatePath("/panel/agente/conexion");
  return { ok: true, mensaje: "Perfil de WhatsApp actualizado." };
}

/**
 * Foto de perfil: primero hay que subir la imagen por la Resumable Upload
 * API de Meta para conseguir un "handle" (`h`), y RECIÉN con ese handle se
 * puede poner como foto del perfil — no se puede mandar una URL directa.
 */
export async function subirFotoWhatsapp(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const detalle = await detalleWhatsapp(auth.clienteId);
  if (!detalle) return { ok: false, error: "Todavía no hay un WhatsApp conectado." };

  const archivo = form.get("foto");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { ok: false, error: "Elegí una imagen." };
  }
  if (!["image/jpeg", "image/png"].includes(archivo.type)) {
    return { ok: false, error: "Tiene que ser JPG o PNG." };
  }

  const appId = process.env.META_APP_ID;
  if (!appId) return { ok: false, error: "Falta configurar META_APP_ID en el servidor." };

  try {
    // 1. Abrir la sesión de subida.
    const sesion = await fetch(
      `https://graph.facebook.com/v21.0/${appId}/uploads?file_name=${encodeURIComponent(archivo.name)}&file_length=${archivo.size}&file_type=${encodeURIComponent(archivo.type)}`,
      { method: "POST", headers: { Authorization: `Bearer ${detalle.token}` } }
    );
    const sesionCuerpo = await sesion.json();
    if (!sesion.ok || !sesionCuerpo.id) {
      return { ok: false, error: `Meta rechazó la subida: ${sesionCuerpo?.error?.message || sesion.status}` };
    }

    // 2. Mandar los bytes de la imagen.
    const bytes = Buffer.from(await archivo.arrayBuffer());
    const subida = await fetch(`https://graph.facebook.com/v21.0/${sesionCuerpo.id}`, {
      method: "POST",
      headers: { Authorization: `OAuth ${detalle.token}`, file_offset: "0" },
      body: bytes,
    });
    const subidaCuerpo = await subida.json();
    if (!subida.ok || !subidaCuerpo.h) {
      return { ok: false, error: `Meta rechazó el archivo: ${subidaCuerpo?.error?.message || subida.status}` };
    }

    // 3. Ponerla como foto del perfil.
    const perfil = await fetch(`${detalle.endpoint}/${detalle.phoneNumberId}/whatsapp_business_profile`, {
      method: "POST",
      headers: { Authorization: `Bearer ${detalle.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", profile_picture_handle: subidaCuerpo.h }),
    });
    if (!perfil.ok) {
      const cuerpo = await perfil.json().catch(() => ({}));
      return { ok: false, error: `Meta rechazó la foto: ${cuerpo?.error?.message || perfil.status}` };
    }
  } catch (e) {
    return { ok: false, error: `No se pudo subir la foto: ${(e as Error).message}` };
  }

  revalidatePath("/panel/agente/conexion");
  return { ok: true, mensaje: "Foto de perfil actualizada." };
}

/* -------------------------------------------------------------------------
   Qué sabe — servicios, datos y reglas
   ------------------------------------------------------------------------- */

export async function agregarConocimiento(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const tipo = String(form.get("tipo") ?? "");
  const clave = String(form.get("clave") ?? "").trim();
  if (!["servicio", "dato", "regla"].includes(tipo) || !clave) {
    return { ok: false, error: "Faltan datos." };
  }

  const valor = String(form.get("valor") ?? "").trim();
  const montoRaw = String(form.get("monto") ?? "").trim();
  const duracionRaw = String(form.get("duracionMin") ?? "").trim();

  const sb = await supabaseServidor();
  const { data: max } = await sb
    .from("wa_conocimiento")
    .select("orden")
    .eq("cliente_id", auth.clienteId)
    .eq("tipo", tipo)
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await sb.from("wa_conocimiento").insert({
    cliente_id: auth.clienteId,
    tipo,
    clave,
    valor,
    monto: montoRaw ? Number(montoRaw) : null,
    duracion_min: duracionRaw ? Number(duracionRaw) : null,
    orden: (max?.orden ?? 0) + 1,
    activo: true,
  });
  if (error) return { ok: false, error: error.message };

  revalidarAgente();
  return { ok: true, mensaje: "Agregado." };
}

export async function eliminarConocimiento(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const id = String(form.get("id") ?? "");
  if (!id) return { ok: false, error: "Falta el elemento." };

  const sb = await supabaseServidor();
  const { error } = await sb
    .from("wa_conocimiento")
    .delete()
    .eq("id", id)
    .eq("cliente_id", auth.clienteId);
  if (error) return { ok: false, error: error.message };

  revalidarAgente();
  return { ok: true, mensaje: "Eliminado." };
}

export async function alternarConocimiento(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const id = String(form.get("id") ?? "");
  const activo = form.get("activo") === "true";
  if (!id) return { ok: false, error: "Falta el elemento." };

  const sb = await supabaseServidor();
  const { error } = await sb
    .from("wa_conocimiento")
    .update({ activo: !activo })
    .eq("id", id)
    .eq("cliente_id", auth.clienteId);
  if (error) return { ok: false, error: error.message };

  revalidarAgente();
  return { ok: true, mensaje: !activo ? "Activado." : "Desactivado." };
}

/* -------------------------------------------------------------------------
   Recordatorios — el de cita se crea solo al agendar; este es para
   cualquier otro (medicamento, seguimiento, lo que sea). El CONTENIDO
   siempre lo escribe una persona acá — nunca lo redacta el agente.
   ------------------------------------------------------------------------- */

export async function crearRecordatorio(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const contactoId = String(form.get("contactoId") ?? "");
  const mensaje = String(form.get("mensaje") ?? "").trim();
  const cuando = String(form.get("cuando") ?? "");
  if (!contactoId || !mensaje || !cuando) return { ok: false, error: "Faltan datos." };

  const cuandoMs = new Date(cuando).getTime();
  if (!Number.isFinite(cuandoMs) || cuandoMs <= Date.now()) {
    return { ok: false, error: "La fecha tiene que ser en el futuro." };
  }

  const repetirCadaHoras = Number(form.get("repetirCadaHoras") ?? "");
  const repeticiones = Number(form.get("repeticiones") ?? "");
  const repite = Number.isFinite(repetirCadaHoras) && repetirCadaHoras > 0 && Number.isFinite(repeticiones) && repeticiones > 0;

  const sb = await supabaseServidor();
  const { error } = await sb.from("wa_recordatorios").insert({
    cliente_id: auth.clienteId,
    contacto_id: contactoId,
    cuando: new Date(cuandoMs).toISOString(),
    mensaje,
    origen: "manual",
    repetir_cada_horas: repite ? repetirCadaHoras : null,
    // La PRIMERA vez ya cuenta como una: si pidieron 3 en total, quedan 2 más después de esta.
    repeticiones_restantes: repite ? repeticiones - 1 : null,
  });
  if (error) return { ok: false, error: error.message };

  revalidarAgente();
  return { ok: true, mensaje: "Recordatorio programado." };
}

export async function cancelarRecordatorio(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const auth = await exigirCliente(form);
  if (!auth.ok) return auth;

  const id = String(form.get("id") ?? "");
  if (!id) return { ok: false, error: "Falta el recordatorio." };

  const sb = await supabaseServidor();
  const { error } = await sb
    .from("wa_recordatorios")
    .update({ estado: "cancelado" })
    .eq("id", id)
    .eq("cliente_id", auth.clienteId)
    .eq("estado", "pendiente");
  if (error) return { ok: false, error: error.message };

  revalidarAgente();
  return { ok: true, mensaje: "Cancelado." };
}
