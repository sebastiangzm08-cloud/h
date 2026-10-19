/* ==========================================================================
   Configuración del agente: lo que el cliente decide y n8n obedece.

   Vive en `asignaciones.config` (jsonb), igual que la de Redes. Módulo PLANO
   a propósito — sin "use server": un archivo de acciones no puede exportar
   tipos ni funciones síncronas, y eso ya rompió un build antes (ver
   `redes-config.ts`). Las acciones que escriben van en su propio archivo.
   ========================================================================== */

export type TratoAgente = "usted" | "vos";
export type LargoRespuesta = "corto" | "medio" | "largo";

export type ConfigAgente = {
  trato: TratoAgente;
  estilo: string;
  emojis: "ninguno" | "pocos" | "varios";
  largo: LargoRespuesta;
  /**
   * Segundos que espera después del ÚLTIMO mensaje antes de contestar.
   * Sebastián lo fijó alto a propósito (2026-09-11): prefiere que tarde un
   * poco y no que conteste a media idea. Mucha gente escribe en 3-4 mensajes
   * cortados, y responder al primero es el error que más caro sale.
   */
  esperaSegundos: number;
  /** Situaciones en las que el agente se frena y llama a una persona. */
  escalar: string[];
  /** Qué hace fuera del horario de atención. */
  fueraDeHorario: "responde" | "avisa" | "callado";
  transcribirAudios: boolean;
  /** ¿Ya llenó el onboarding propio del Agente (7 preguntas, una sola vez)?
      Separado a propósito de `clientes.onboarding_completo` — ese es el del
      formulario de Redes, y un cliente puede tener las dos automatizaciones
      a la vez sin que completar una tache la otra. */
  onboardingCompleto: boolean;
};

export const CONFIG_AGENTE_POR_DEFECTO: ConfigAgente = {
  trato: "usted",
  estilo: "Cálido y cercano, como quien atiende bien en el mostrador.",
  emojis: "pocos",
  largo: "medio",
  esperaSegundos: 12,
  escalar: [
    "No sabe la respuesta o no está en lo que le cargaste",
    "La persona describe dolor fuerte o una emergencia",
    "Piden un descuento o un precio especial",
    "La persona se molesta o pide hablar con alguien",
  ],
  fueraDeHorario: "responde",
  transcribirAudios: true,
  onboardingCompleto: false,
};

function texto(v: unknown, porDefecto: string) {
  return typeof v === "string" && v.trim() ? v : porDefecto;
}

/**
 * Rellena con los valores por defecto lo que falte en el jsonb. Nunca tira:
 * una config a medias tiene que poder mostrarse igual.
 */
export function leerConfigAgente(raw: Record<string, unknown> | null | undefined): ConfigAgente {
  const c = raw ?? {};
  const d = CONFIG_AGENTE_POR_DEFECTO;

  const espera = Number(c.esperaSegundos);

  return {
    trato: c.trato === "vos" ? "vos" : d.trato,
    estilo: texto(c.estilo, d.estilo),
    emojis:
      c.emojis === "ninguno" || c.emojis === "varios"
        ? (c.emojis as ConfigAgente["emojis"])
        : d.emojis,
    largo:
      c.largo === "corto" || c.largo === "largo" ? (c.largo as LargoRespuesta) : d.largo,
    /* Tope de 60 s: más que eso la persona ya se fue del chat. */
    esperaSegundos:
      Number.isFinite(espera) && espera >= 0 && espera <= 60 ? espera : d.esperaSegundos,
    escalar: Array.isArray(c.escalar) && c.escalar.length ? (c.escalar as string[]) : d.escalar,
    fueraDeHorario:
      c.fueraDeHorario === "avisa" || c.fueraDeHorario === "callado"
        ? (c.fueraDeHorario as ConfigAgente["fueraDeHorario"])
        : d.fueraDeHorario,
    transcribirAudios: c.transcribirAudios !== false,
    onboardingCompleto: c.onboardingCompleto === true,
  };
}

export const TEXTO_EMOJIS: Record<ConfigAgente["emojis"], string> = {
  ninguno: "Ninguno",
  pocos: "Pocos",
  varios: "Varios",
};

export const TEXTO_LARGO: Record<LargoRespuesta, string> = {
  corto: "Corto",
  medio: "Medio",
  largo: "Largo",
};

export const TEXTO_FUERA: Record<ConfigAgente["fueraDeHorario"], string> = {
  responde: "Responde igual y agenda",
  avisa: "Avisa que están cerrados",
  callado: "No responde hasta abrir",
};

/* --------------------------------------------------------------------------
   Agenda: vive en `config.agenda`, el mismo jsonb de arriba — no es una tabla
   ni una columna nueva. La capacidad y el colchón son del NEGOCIO (cuántas
   sillas, cuánto respiro), no del catálogo de servicios ni del horario, así
   que no calzan en `wa_conocimiento` ni en `clientes.horario`.
   -------------------------------------------------------------------------- */

export type ConfigAgenda = {
  /** Si está en false, el agente nunca agenda solo: toma el dato y avisa que alguien confirma. */
  activa: boolean;
  /** Cuántas citas caben en el mismo horario (sillas, doctores, mesas...). */
  capacidad: number;
  /** Minutos de respiro que deja DESPUÉS de cada cita antes de la siguiente. */
  colchonMin: number;
  /** No ofrece un horario que empiece antes de esta cantidad de minutos desde ahora. */
  anticipacionMin: number;
  /** Hasta cuántos días adelante busca campo. */
  maximoDiasAdelante: number;
};

export const CONFIG_AGENDA_POR_DEFECTO: ConfigAgenda = {
  activa: true,
  capacidad: 1,
  colchonMin: 0,
  anticipacionMin: 60,
  maximoDiasAdelante: 30,
};

function numeroEntre(v: unknown, porDefecto: number, min: number, max: number) {
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : porDefecto;
}

export function leerConfigAgenda(raw: Record<string, unknown> | null | undefined): ConfigAgenda {
  const c = (raw?.agenda ?? {}) as Record<string, unknown>;
  const d = CONFIG_AGENDA_POR_DEFECTO;

  return {
    activa: c.activa !== false,
    capacidad: numeroEntre(c.capacidad, d.capacidad, 1, 20),
    colchonMin: numeroEntre(c.colchonMin, d.colchonMin, 0, 120),
    anticipacionMin: numeroEntre(c.anticipacionMin, d.anticipacionMin, 0, 1440),
    maximoDiasAdelante: numeroEntre(c.maximoDiasAdelante, d.maximoDiasAdelante, 1, 90),
  };
}

/** Nombre del día tal cual lo guarda `clientes.horario`, en el orden en que se muestra. */
export const DIAS_HORARIO: { clave: string; texto: string }[] = [
  { clave: "lun", texto: "Lunes" },
  { clave: "mar", texto: "Martes" },
  { clave: "mie", texto: "Miércoles" },
  { clave: "jue", texto: "Jueves" },
  { clave: "vie", texto: "Viernes" },
  { clave: "sab", texto: "Sábado" },
  { clave: "dom", texto: "Domingo" },
];

/* -------------------------------------------------------------------------
   Horario con almuerzo (2026-10-18). Casi todas las clínicas de Costa Rica
   cierran al mediodía, pero pedirle a alguien que arme "bloques" por día es
   enredado. En pantalla se pide abre / cierra por día y UN almuerzo para
   todos; en la base se sigue guardando como bloques (`[["08:00","12:00"],
   ["13:00","17:00"]]`), que es lo que el agente de n8n ya sabe leer.
   ------------------------------------------------------------------------- */
export type Almuerzo = { activo: boolean; ini: string; fin: string };
export const ALMUERZO_POR_DEFECTO: Almuerzo = { activo: false, ini: "12:00", fin: "13:00" };

/** Lee el almuerzo de lo guardado: el hueco entre el primer y el segundo bloque del primer día que lo tenga. */
export function almuerzoDeHorario(horario: Record<string, [string, string][]>): Almuerzo {
  for (const { clave } of DIAS_HORARIO) {
    const b = horario[clave];
    if (b && b.length >= 2 && b[0][1] < b[1][0]) return { activo: true, ini: b[0][1], fin: b[1][0] };
  }
  return ALMUERZO_POR_DEFECTO;
}

/** Abre / cierra del día completo, aunque esté guardado en dos bloques. */
export function extremosDelDia(bloques: [string, string][] | undefined): [string, string] | null {
  if (!bloques?.length) return null;
  return [bloques[0][0], bloques[bloques.length - 1][1]];
}

/** Parte un día en mañana y tarde si el almuerzo cae dentro; si no, queda en un solo bloque. */
export function bloquesDelDia(ini: string, fin: string, almuerzo: Almuerzo): [string, string][] {
  if (!almuerzo.activo || almuerzo.fin <= almuerzo.ini || almuerzo.fin <= ini || almuerzo.ini >= fin) return [[ini, fin]];
  const bloques: [string, string][] = [];
  if (almuerzo.ini > ini) bloques.push([ini, almuerzo.ini]);
  if (almuerzo.fin < fin) bloques.push([almuerzo.fin, fin]);
  return bloques;
}

/** Arma `clientes.horario` desde los campos del editor (`ini_lun`, `fin_lun`, `cerrado_lun`, `almuerzo`…). */
export function horarioDesdeFormulario(form: FormData, dias: readonly string[]): Record<string, [string, string][]> {
  const almuerzo: Almuerzo = {
    activo: form.get("almuerzo") === "on",
    ini: String(form.get("almuerzo_ini") ?? ""),
    fin: String(form.get("almuerzo_fin") ?? ""),
  };
  const horario: Record<string, [string, string][]> = {};
  for (const dia of dias) {
    const cerrado = form.get(`cerrado_${dia}`) === "on";
    const ini = String(form.get(`ini_${dia}`) ?? "");
    const fin = String(form.get(`fin_${dia}`) ?? "");
    horario[dia] = cerrado || !ini || !fin ? [] : bloquesDelDia(ini, fin, almuerzo);
  }
  return horario;
}

/** `[["08:00","17:00"]]` → "8:00 a.m. – 5:00 p.m.". Vacío → "Cerrado". */
export function textoBloquesHorario(bloques: unknown): string {
  if (!Array.isArray(bloques) || bloques.length === 0) return "Cerrado";
  const hora12 = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    const ampm = h < 12 ? "a.m." : "p.m.";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };
  return bloques
    .filter((b): b is [string, string] => Array.isArray(b) && b.length === 2)
    .map(([ini, fin]) => `${hora12(ini)} – ${hora12(fin)}`)
    .join(" y ");
}
