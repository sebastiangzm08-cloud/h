/* ==========================================================================
   Un turno de la demo: lo que devuelve el modelo, leído con cuidado.

   El modelo contesta en JSON ({ respuesta, escalar, cita... }) pero NUNCA se
   confía ciegamente en él:
   - si el JSON viene roto se intenta rescatar el campo `respuesta`; si no se
     puede, el turno falla limpio (el prospecto reintenta);
   - una cita solo queda "confirmada" si la PERSONA escribió un horario
     (no basta con que el modelo diga que confirmó);
   - hay un respaldo determinista para lo más delicado (pedir hablar con una
     persona, una urgencia, una queja), por si el modelo no marca `escalar`.
   ========================================================================== */
import { sinTildes } from "./herramientas";
import type { CitaDemo, Escalada } from "./tipos";

export type SalidaModelo = {
  respuesta: string;
  escalar: boolean;
  motivoEscalamiento: string;
  citaEstado: "ninguna" | "propuesta" | "confirmada";
  citaServicio: string;
  citaHorario: string;
};

const MAX_RESPUESTA = 1200;
const MAX_CAMPO = 160;

function limpiarCampo(v: unknown, max = MAX_CAMPO): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function desdeObjeto(o: unknown): SalidaModelo | null {
  if (!o || typeof o !== "object") return null;
  const r = o as Record<string, unknown>;
  const respuesta = typeof r.respuesta === "string" ? r.respuesta.trim().slice(0, MAX_RESPUESTA) : "";
  if (!respuesta) return null;
  const estado = r.cita_estado;
  return {
    respuesta,
    escalar: r.escalar === true,
    motivoEscalamiento: limpiarCampo(r.motivo_escalamiento),
    citaEstado: estado === "propuesta" || estado === "confirmada" ? estado : "ninguna",
    citaServicio: limpiarCampo(r.cita_servicio),
    citaHorario: limpiarCampo(r.cita_horario),
  };
}

/** Lee la salida cruda del modelo. `null` = no se pudo rescatar una respuesta. */
export function leerSalidaModelo(crudo: string | undefined | null): SalidaModelo | null {
  const texto = (crudo ?? "").trim();
  if (!texto) return null;

  const sinCercas = texto.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const intentos: string[] = [sinCercas];
  const ini = sinCercas.indexOf("{");
  const fin = sinCercas.lastIndexOf("}");
  if (ini >= 0 && fin > ini) intentos.push(sinCercas.slice(ini, fin + 1));

  for (const t of intentos) {
    try {
      const s = desdeObjeto(JSON.parse(t));
      if (s) return s;
    } catch {
      /* siguiente intento */
    }
  }

  /* JSON cortado o con basura alrededor: rescatar solo el campo `respuesta`. */
  const m = sinCercas.match(/"respuesta"\s*:\s*"((?:\\.|[^"\\])*)"/);
  if (m) {
    try {
      const respuesta = (JSON.parse(`"${m[1]}"`) as string).trim().slice(0, MAX_RESPUESTA);
      if (respuesta) {
        return {
          respuesta,
          escalar: false,
          motivoEscalamiento: "",
          citaEstado: "ninguna",
          citaServicio: "",
          citaHorario: "",
        };
      }
    } catch {
      /* cae al caso de abajo */
    }
  }

  /* Texto plano (el modelo ignoró el formato): sirve tal cual, pero si parece un
     JSON roto no se le muestra esa basura a la persona. */
  if (/^[{[`]/.test(sinCercas) || /"respuesta"/.test(sinCercas)) return null;
  return {
    respuesta: sinCercas.slice(0, MAX_RESPUESTA),
    escalar: false,
    motivoEscalamiento: "",
    citaEstado: "ninguna",
    citaServicio: "",
    citaHorario: "",
  };
}

/* -------------------------------------------------------------------------
   Respaldo determinista de escalamiento (sobre lo que ESCRIBIÓ la persona)
   ------------------------------------------------------------------------- */

const RE_PIDE_PERSONA =
  /(hablar con (una |un |alguna |algun )?(persona|humano|asesor|asesora|encargad[oa]|gerente|supervisor|alguien|recepcion)|persona real|ser humano|quiero (un )?humano|me (pueden|puede) llamar|llamenme|que me llamen)/;
const RE_URGENCIA =
  /\b(no respira|se desmay\w+|me desmay\w+|convuls\w+|infarto|sangrado (fuerte|abundante)|sangrando|es una emergencia|tengo una emergencia|dolor (muy )?fuerte)\b/;
const RE_QUEJA = /\b(queja|reclamo|denunci\w+|demandar|mal servicio|pesimo servicio)\b/;

export function escaladaDeterminista(mensaje: string): Escalada | null {
  const t = sinTildes(mensaje);
  if (RE_URGENCIA.test(t)) return { motivo: "Posible urgencia: la persona describe un síntoma delicado." };
  if (RE_PIDE_PERSONA.test(t)) return { motivo: "Pidió hablar con una persona del negocio." };
  if (RE_QUEJA.test(t)) return { motivo: "Presentó una queja o un reclamo." };
  return null;
}

/* -------------------------------------------------------------------------
   Citas: la demo no tiene calendario, así que NO se confirma nada que la
   persona no haya propuesto ella misma.
   ------------------------------------------------------------------------- */

const HORAS_EN_LETRAS = "una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce";
const RE_HORA = new RegExp(
  [
    String.raw`\ba las?\s*\d{1,2}\b`,
    String.raw`\b\d{1,2}\s*[:h]\s*\d{0,2}`,
    String.raw`\b\d{1,2}\s*(a\.?\s?m|p\.?\s?m)\b`,
    String.raw`\bmediodia\b`,
    String.raw`\bmedio dia\b`,
    `\\ba las (${HORAS_EN_LETRAS})\\b`,
    `\\b(${HORAS_EN_LETRAS})( y (media|cuarto))? de la (manana|tarde|noche)\\b`,
  ].join("|")
);

/** ¿Alguno de los mensajes de la persona nombra una hora concreta? */
export function personaDioHorario(mensajesDeLaPersona: string[]): boolean {
  return mensajesDeLaPersona.some((m) => RE_HORA.test(sinTildes(m)));
}

export function armarCita(
  s: SalidaModelo,
  mensajesRecientesDeLaPersona: string[]
): CitaDemo | null {
  if (s.citaEstado === "ninguna") return null;
  if (!s.citaServicio && !s.citaHorario) return null;

  if (s.citaEstado === "confirmada" && s.citaHorario && personaDioHorario(mensajesRecientesDeLaPersona)) {
    return { estado: "confirmada", servicio: s.citaServicio, horario: s.citaHorario };
  }
  /* El modelo dijo "confirmada" pero la persona nunca dio una hora: queda como propuesta. */
  return { estado: "propuesta", servicio: s.citaServicio, horario: s.citaHorario };
}
