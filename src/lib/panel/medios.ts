/* ==========================================================================
   Archivos de las conversaciones del Agente de WhatsApp: fotos, videos,
   stickers, notas de voz y documentos. Solo servidor.

   El problema que resuelve (encontrado por Sebastian en vivo, 2026-10-17):
   n8n recibía la foto pero tiraba el archivo, y el panel solo podía poner la
   etiqueta "Imagen". Además Meta borra el archivo de un webhook a los 7 días,
   así que hay que guardarlo del lado nuestro apenas llega.

   Dónde queda: bucket PRIVADO `wa-medios` de Supabase Storage, en
   `<cliente_id>/<AAAA-MM>/<mensaje_id>.<ext>`. La ruta va en
   `wa_mensajes.media_url`. El navegador nunca lee el bucket directo: el panel
   firma una URL que vence en una hora, solo para mensajes del propio cliente.

   Cuándo se guarda (dos caminos, el segundo es la red de seguridad):
   1. n8n avisa a `/api/medios/guardar` apenas entra el mensaje.
   2. Si ese aviso falló, se guarda al abrir la conversación en el panel
      (mientras no hayan pasado los 7 días de Meta).
   ========================================================================== */
import { supabaseAdmin } from "@/lib/supabase/servidor";
import type { ConexionWhatsapp } from "./whatsapp-conexion";
import { detalleWhatsapp } from "./whatsapp-conexion";
import type { TipoArchivoEnviable } from "./medios-reglas";

export const BUCKET_MEDIOS = "wa-medios";

/** Meta borra el archivo de un webhook a los 7 días: después ya no hay cómo rescatarlo. */
export const VIDA_ARCHIVO_META_MS = 7 * 24 * 60 * 60 * 1000;

const SEGUNDOS_URL_FIRMADA = 60 * 60;

const EXTENSIONES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/3gpp": "3gp",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/aac": "aac",
  "audio/amr": "amr",
  "application/pdf": "pdf",
  "text/plain": "txt",
};

function extension(mime: string | null, nombre?: string | null): string {
  const limpio = (mime ?? "").split(";")[0].trim().toLowerCase();
  if (EXTENSIONES[limpio]) return EXTENSIONES[limpio];
  const deNombre = nombre?.match(/\.([a-z0-9]{1,5})$/i)?.[1];
  return deNombre ? deNombre.toLowerCase() : "bin";
}

function rutaArchivo(clienteId: string, mensajeId: string, creadoEn: string, mime: string | null, nombre?: string | null) {
  return `${clienteId}/${creadoEn.slice(0, 7)}/${mensajeId}.${extension(mime, nombre)}`;
}

export type ResultadoArchivo = { ok: true; ruta: string } | { ok: false; error: string };

/* -------------------------------------------------------------------------
   Guardar lo que ENTRA
   ------------------------------------------------------------------------- */

/**
 * Baja de Meta el archivo de un mensaje que entró y lo deja en el bucket.
 * Idempotente: si ya estaba guardado, devuelve la ruta y no hace nada más.
 */
export async function guardarArchivoRecibido(mensajeId: string): Promise<ResultadoArchivo> {
  const admin = supabaseAdmin();
  const { data: m } = await admin
    .from("wa_mensajes")
    .select("id, cliente_id, media_id, media_url, media_mime, media_nombre, creado_en")
    .eq("id", mensajeId)
    .maybeSingle();

  if (!m) return { ok: false, error: "No existe ese mensaje." };
  if (m.media_url) return { ok: true, ruta: m.media_url as string };
  if (!m.media_id) return { ok: false, error: "Ese mensaje no trae archivo." };
  if (Date.now() - new Date(m.creado_en as string).getTime() > VIDA_ARCHIVO_META_MS) {
    return { ok: false, error: "Meta ya borró este archivo: pasaron más de 7 días." };
  }

  const conexion = await detalleWhatsapp(m.cliente_id as string);
  if (!conexion) return { ok: false, error: "Este negocio no tiene WhatsApp conectado." };

  try {
    /* Paso 1: Meta da una URL de descarga que vence en 5 minutos. */
    const info = await fetch(`${conexion.endpoint}/${m.media_id}`, {
      headers: { Authorization: `Bearer ${conexion.token}` },
      cache: "no-store",
    });
    const meta = (await info.json().catch(() => ({}))) as {
      url?: string;
      mime_type?: string;
      error?: { message?: string };
    };
    if (!info.ok || !meta.url) {
      return { ok: false, error: `Meta no entregó el archivo: ${meta.error?.message ?? `código ${info.status}`}` };
    }

    /* Paso 2: esa URL también pide el token del negocio. */
    const descarga = await fetch(meta.url, {
      headers: { Authorization: `Bearer ${conexion.token}` },
      cache: "no-store",
    });
    if (!descarga.ok) return { ok: false, error: `No se pudo descargar de Meta (código ${descarga.status}).` };
    const bytes = new Uint8Array(await descarga.arrayBuffer());

    const mime = meta.mime_type || (m.media_mime as string | null) || "application/octet-stream";
    const ruta = rutaArchivo(m.cliente_id as string, m.id as string, m.creado_en as string, mime, m.media_nombre as string | null);

    const { error: eSubir } = await admin.storage
      .from(BUCKET_MEDIOS)
      .upload(ruta, bytes, { contentType: mime, upsert: true });
    if (eSubir) return { ok: false, error: `No se pudo guardar el archivo: ${eSubir.message}` };

    await admin
      .from("wa_mensajes")
      .update({ media_url: ruta, media_mime: mime, media_bytes: bytes.byteLength })
      .eq("id", m.id);

    return { ok: true, ruta };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Lo que llama n8n: no conoce el id de la fila, sí el `wa_id` que le dio Meta. */
export async function guardarArchivoPorWaId(waId: string): Promise<ResultadoArchivo> {
  const { data } = await supabaseAdmin()
    .from("wa_mensajes")
    .select("id")
    .eq("wa_id", waId)
    .not("media_id", "is", null)
    .maybeSingle();
  if (!data) return { ok: false, error: "No hay un mensaje con archivo para ese wa_id." };
  return guardarArchivoRecibido(data.id as string);
}

/** Red de seguridad: los archivos de los últimos 7 días que todavía no se guardaron. */
export async function guardarArchivosPendientes(
  limite = 20
): Promise<{ guardados: number; fallidos: { id: string; error: string }[] }> {
  const desde = new Date(Date.now() - VIDA_ARCHIVO_META_MS).toISOString();
  const { data } = await supabaseAdmin()
    .from("wa_mensajes")
    .select("id")
    .not("media_id", "is", null)
    .is("media_url", null)
    .eq("autor", "contacto")
    .gte("creado_en", desde)
    .order("creado_en", { ascending: false })
    .limit(limite);

  let guardados = 0;
  const fallidos: { id: string; error: string }[] = [];
  for (const fila of data ?? []) {
    const r = await guardarArchivoRecibido(fila.id as string);
    if (r.ok) guardados++;
    else fallidos.push({ id: fila.id as string, error: r.error });
  }
  return { guardados, fallidos };
}

/** URLs temporales (1 hora) para mostrar los archivos en el panel. Ruta → URL. */
export async function firmarArchivos(rutas: string[]): Promise<Map<string, string>> {
  const unicas = [...new Set(rutas.filter(Boolean))];
  if (unicas.length === 0) return new Map();
  const { data } = await supabaseAdmin()
    .storage.from(BUCKET_MEDIOS)
    .createSignedUrls(unicas, SEGUNDOS_URL_FIRMADA);
  return new Map(
    (data ?? []).flatMap((d) => (d.path && d.signedUrl ? [[d.path, d.signedUrl] as [string, string]] : []))
  );
}

/* -------------------------------------------------------------------------
   Mandar desde el panel
   ------------------------------------------------------------------------- */

/**
 * Sube el archivo a Meta y lo manda como foto, video o documento, con el
 * texto como pie. Si falla, NO se guarda nada: el llamador decide.
 */
export async function enviarArchivoPorWhatsapp(
  conexion: ConexionWhatsapp,
  telefono: string,
  archivo: File,
  tipo: TipoArchivoEnviable,
  pie: string
): Promise<{ ok: true; mediaId: string } | { ok: false; error: string }> {
  const { endpoint, phoneNumberId, token } = conexion;
  try {
    const cuerpo = new FormData();
    cuerpo.append("messaging_product", "whatsapp");
    cuerpo.append("type", archivo.type);
    cuerpo.append("file", archivo, archivo.name);
    const subida = await fetch(`${endpoint}/${phoneNumberId}/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: cuerpo,
    });
    const subido = (await subida.json().catch(() => ({}))) as { id?: string; error?: { message?: string } };
    if (!subida.ok || !subido.id) {
      return { ok: false, error: `Meta no aceptó el archivo: ${subido.error?.message ?? `código ${subida.status}`}` };
    }

    const clave = tipo === "imagen" ? "image" : tipo === "video" ? "video" : "document";
    const contenido: Record<string, string> = { id: subido.id };
    if (pie) contenido.caption = pie;
    if (clave === "document") contenido.filename = archivo.name;

    const envio = await fetch(`${endpoint}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: telefono.replace("+", ""),
        type: clave,
        [clave]: contenido,
      }),
    });
    if (!envio.ok) {
      const texto = await envio.text();
      let codigo: number | undefined;
      try {
        codigo = (JSON.parse(texto) as { error?: { code?: number } }).error?.code;
      } catch {
        /* cuerpo que no es JSON: se muestra tal cual abajo */
      }
      if (codigo === 131047) {
        return {
          ok: false,
          error:
            "Pasaron más de 24 horas desde el último mensaje de esta persona, y WhatsApp no deja escribirle libremente. Hay que esperar a que ella escriba, o usar una plantilla aprobada.",
        };
      }
      return { ok: false, error: `Meta respondió ${envio.status}: ${texto.slice(0, 200)}` };
    }
    return { ok: true, mediaId: subido.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/**
 * Copia en el bucket de lo que mandó el dueño, para verlo después en el hilo.
 * Mejor esfuerzo: si falla, el archivo ya salió por WhatsApp igual, y el hilo
 * muestra la etiqueta sin la vista previa.
 */
export async function guardarCopiaDeArchivo(
  clienteId: string,
  mensajeId: string,
  creadoEn: string,
  archivo: File
): Promise<string | null> {
  const ruta = rutaArchivo(clienteId, mensajeId, creadoEn, archivo.type, archivo.name);
  const { error } = await supabaseAdmin()
    .storage.from(BUCKET_MEDIOS)
    .upload(ruta, new Uint8Array(await archivo.arrayBuffer()), { contentType: archivo.type, upsert: true });
  if (error) {
    console.error(`[medios] no se pudo guardar la copia de ${mensajeId}: ${error.message}`);
    return null;
  }
  return ruta;
}
