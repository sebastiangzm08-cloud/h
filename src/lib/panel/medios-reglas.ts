/* ==========================================================================
   Qué archivos se pueden MANDAR por WhatsApp desde el panel y cuánto pueden
   pesar. Lo usan las dos puntas: el navegador (para avisar antes de subir
   nada) y el servidor (que vuelve a comprobar, porque el navegador miente).

   Límites de Meta para la Cloud API: foto 5 MB, video 16 MB, documento
   100 MB. Solo JPG/PNG en fotos (WEBP es para stickers) y MP4/3GP en video.
   ========================================================================== */

export type TipoArchivoEnviable = "imagen" | "video" | "documento";

const MB = 1024 * 1024;

const REGLAS: Record<string, { tipo: TipoArchivoEnviable; maxBytes: number }> = {
  "image/jpeg": { tipo: "imagen", maxBytes: 5 * MB },
  "image/png": { tipo: "imagen", maxBytes: 5 * MB },
  "video/mp4": { tipo: "video", maxBytes: 16 * MB },
  "video/3gpp": { tipo: "video", maxBytes: 16 * MB },
  "application/pdf": { tipo: "documento", maxBytes: 100 * MB },
  "application/msword": { tipo: "documento", maxBytes: 100 * MB },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { tipo: "documento", maxBytes: 100 * MB },
  "application/vnd.ms-excel": { tipo: "documento", maxBytes: 100 * MB },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { tipo: "documento", maxBytes: 100 * MB },
  "application/vnd.ms-powerpoint": { tipo: "documento", maxBytes: 100 * MB },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { tipo: "documento", maxBytes: 100 * MB },
  "text/plain": { tipo: "documento", maxBytes: 100 * MB },
};

/** Para el `accept` del <input type="file">. */
export const ACEPTA_ARCHIVOS =
  "image/jpeg,image/png,video/mp4,video/3gpp,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt";

/** Lo que WhatsApp deja poner como texto debajo de una foto, video o documento. */
export const MAX_PIE_DE_ARCHIVO = 1024;

export function pesoLegible(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / MB;
  return `${Number.isInteger(mb) ? mb : mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}

export function validarArchivo(
  archivo: { type: string; size: number }
): { ok: true; tipo: TipoArchivoEnviable } | { ok: false; error: string } {
  const regla = REGLAS[archivo.type];
  if (!regla) {
    return {
      ok: false,
      error: "WhatsApp no acepta ese tipo de archivo. Probá con una foto (JPG o PNG), un video (MP4) o un documento (PDF, Word, Excel).",
    };
  }
  if (archivo.size === 0) return { ok: false, error: "El archivo está vacío." };
  if (archivo.size > regla.maxBytes) {
    const nombre = regla.tipo === "imagen" ? "Las fotos" : regla.tipo === "video" ? "Los videos" : "Los documentos";
    return {
      ok: false,
      error: `${nombre} pueden pesar hasta ${pesoLegible(regla.maxBytes)} en WhatsApp, y este pesa ${pesoLegible(archivo.size)}.`,
    };
  }
  return { ok: true, tipo: regla.tipo };
}

/** Lo que se ve en la lista de conversaciones cuando el último mensaje es un archivo. */
export function etiquetaArchivo(tipo: string): string {
  switch (tipo) {
    case "imagen":
      return "📷 Foto";
    case "video":
      return "🎥 Video";
    case "sticker":
      return "Sticker";
    case "audio":
      return "🎤 Nota de voz";
    case "documento":
      return "📄 Documento";
    default:
      return "Archivo";
  }
}
