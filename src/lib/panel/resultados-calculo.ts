/* ==========================================================================
   Cálculos de la pantalla "Resultados". Funciones PURAS: reciben filas ya
   leídas y devuelven cifras. Sin imports de servidor ni de Supabase, a
   propósito, por dos razones:
   - se pueden probar sueltas (no hace falta base de datos);
   - un componente cliente puede importar de acá sin arrastrar `next/headers`
     al navegador (ver la nota de `agente-formato.ts`).

   Las lecturas viven en `resultados.ts`.

   TODO sale de datos crudos: mensajes, conversaciones y citas. NUNCA de
   `wa_contactos.estado`: el flujo del agente solo marca `agendado` y nadie
   escribe `pregunto_precio` ni `perdido` (hallazgo del 2026-09-24).
   ========================================================================== */

import { PREFILTRO_PRECIO, REGEX_PREGUNTA_PRECIO, preguntaPrecio } from "./pregunta-precio";

export const DIA_MS = 86_400_000;
const HORA_MS = 3_600_000;
/* Costa Rica no tiene horario de verano: UTC-6 fijo, igual que n8n y el Inicio. */
const DESFASE_CR_MS = 6 * HORA_MS;

/** Ventana de "oportunidades": la misma que usa el Inicio para decir "ya tiene cita". */
export const DIAS_OPORTUNIDAD = 60;
/** Pasadas estas horas sin actividad se cierra la ventana de 24 h de WhatsApp. */
export const HORAS_RECUPERABLE = 24;
/** Con menos personas que esto los porcentajes saltan demasiado: se avisa en pantalla. */
export const MUESTRA_MINIMA = 10;
/** Una etapa con menos personas que esto no puede ser "donde más se cae". */
const BASE_MINIMA_PARA_DESTACAR = 5;

/* "Preguntó precio": un solo criterio, compartido con el Inicio (`agente.ts`). */
export { PREFILTRO_PRECIO, REGEX_PREGUNTA_PRECIO, preguntaPrecio };

/* --------------------------------------------------------------------------
   Fechas en hora de Costa Rica
   -------------------------------------------------------------------------- */

/** "2026-09-23": el día de Costa Rica al que pertenece ese instante. */
export function diaCR(ms: number) {
  return new Date(ms - DESFASE_CR_MS).toISOString().slice(0, 10);
}

/** El primer instante del mes (hora de Costa Rica), en ISO. */
export function inicioMesCR(ms: number) {
  return `${diaCR(ms).slice(0, 7)}-01T06:00:00.000Z`;
}

export function inicioMesAnteriorCR(ms: number) {
  const [anio, mes] = diaCR(ms).slice(0, 7).split("-").map(Number);
  const a = mes === 1 ? anio - 1 : anio;
  const m = mes === 1 ? 12 : mes - 1;
  return `${a}-${String(m).padStart(2, "0")}-01T06:00:00.000Z`;
}

const MES_LARGO = new Intl.DateTimeFormat("es-CR", { month: "long", timeZone: "America/Costa_Rica" });
export function nombreMesCR(ms: number) {
  return MES_LARGO.format(new Date(ms));
}

/** Un instante a la mitad del mes anterior, para poder nombrarlo. */
export function mitadMesAnteriorMs(ms: number) {
  return Date.parse(inicioMesAnteriorCR(ms)) + 14 * DIA_MS;
}

/* --------------------------------------------------------------------------
   Tipos de entrada (lo que lee `resultados.ts`)
   -------------------------------------------------------------------------- */

export type CitaFila = {
  contactoId: string;
  estado: string;
  /** Cuándo es la cita. */
  cuando: string;
  /** Cuándo se agendó. */
  creadaEn: string;
};

export type PreguntaFila = {
  conversacionId: string;
  contactoId: string;
  texto: string | null;
  transcripcion: string | null;
  /** Cuándo mandó ESE mensaje. */
  creadoEn: string;
  estado: string;
  ultimoMensaje: string;
  /** Última actividad de la conversación. */
  ultimoEn: string;
  nombre: string;
  telefono: string;
};

/* --------------------------------------------------------------------------
   1. Dónde se pierden clientes
   -------------------------------------------------------------------------- */

export type Embudo = {
  rango: 7 | 30;
  desdeIso: string;
  hastaIso: string;
  /** Personas distintas que mandaron al menos un mensaje en el período. */
  escribio: number;
  /** De esas, las que escribieron una pregunta de precio (regex del Inicio). */
  preguntoPrecio: number;
  /** De esas, las que tienen una cita CREADA en el período (cancelada o no). */
  agendo: number;
  /** De las que agendaron, las que tienen una cita marcada "cumplida". */
  asistio: number;
  /* Lo que pasó con quienes agendaron y NO asistieron (se excluyen entre sí). */
  citaPorVenir: number;
  citaSinMarcar: number;
  citaCancelada: number;
  /** Preguntaron el precio y no agendaron (es lo que se "cae" entre esas dos etapas). */
  preguntaronSinAgendar: number;
  /** Agendaron sin haber escrito una pregunta de precio ("quiero una cita"). */
  agendaronSinPreguntar: number;
  /** La lectura se cortó en el tope de filas: las cifras pueden quedar cortas. */
  incompleto: boolean;
};

export function calcularEmbudo(e: {
  ahoraMs: number;
  rango: 7 | 30;
  /** `contacto_id` de quienes mandaron algún mensaje en el período. */
  escribieron: Iterable<string>;
  /** `contacto_id` de quienes mandaron una pregunta de precio EN el período. */
  preguntaron: Iterable<string>;
  citas: CitaFila[];
  incompleto: boolean;
}): Embudo {
  const desdeMs = e.ahoraMs - e.rango * DIA_MS;
  const preguntaron = new Set(e.preguntaron);
  /* Quien preguntó el precio, escribió: se suma por si la lectura de mensajes
     se cortó en el tope y la de preguntas no. Así nunca hay más "preguntaron"
     que "escribieron". */
  const escribieron = new Set(e.escribieron);
  for (const id of preguntaron) escribieron.add(id);

  const citasPor = new Map<string, CitaFila[]>();
  for (const c of e.citas) {
    if (!escribieron.has(c.contactoId)) continue;
    /* Una cita de este período, o una cita VIVA que todavía no pasa aunque se
       haya agendado antes: quien la tiene sí agendó, no se "cayó". */
    const futuraViva = c.estado !== "cancelada" && Date.parse(c.cuando) > e.ahoraMs;
    if (Date.parse(c.creadaEn) < desdeMs && !futuraViva) continue;
    const lista = citasPor.get(c.contactoId);
    if (lista) lista.push(c);
    else citasPor.set(c.contactoId, [c]);
  }

  let agendo = 0;
  let asistio = 0;
  let citaPorVenir = 0;
  let citaSinMarcar = 0;
  let citaCancelada = 0;
  let preguntaronSinAgendar = 0;
  let agendaronSinPreguntar = 0;

  for (const id of escribieron) {
    const citas = citasPor.get(id);
    const pregunto = preguntaron.has(id);
    if (!citas) {
      if (pregunto) preguntaronSinAgendar += 1;
      continue;
    }
    agendo += 1;
    if (!pregunto) agendaronSinPreguntar += 1;

    if (citas.some((c) => c.estado === "cumplida")) {
      asistio += 1;
      continue;
    }
    const vivas = citas.filter((c) => c.estado !== "cancelada");
    if (vivas.length === 0) citaCancelada += 1;
    else if (vivas.some((c) => Date.parse(c.cuando) > e.ahoraMs)) citaPorVenir += 1;
    else citaSinMarcar += 1;
  }

  return {
    rango: e.rango,
    desdeIso: new Date(desdeMs).toISOString(),
    hastaIso: new Date(e.ahoraMs).toISOString(),
    escribio: escribieron.size,
    preguntoPrecio: preguntaron.size,
    agendo,
    asistio,
    citaPorVenir,
    citaSinMarcar,
    citaCancelada,
    preguntaronSinAgendar,
    agendaronSinPreguntar,
    incompleto: e.incompleto,
  };
}

export type PasoEmbudo = {
  desde: string;
  hacia: string;
  /** Personas que no pasaron a la siguiente etapa. */
  perdidas: number;
  /** Sobre cuántas personas se calcula el porcentaje. */
  base: number;
  /** `null` si no hay base para calcularlo. */
  porcentaje: number | null;
  /** Qué significa "perdidas" en esta etapa, en una frase. */
  detalle: string;
  /** Hay datos que no se pueden saber (citas pasadas sin marcar): no se destaca. */
  incierto?: boolean;
};

/**
 * Lo que se cae entre una etapa y la siguiente. Cada paso se calcula sobre
 * conjuntos ANIDADOS (quienes preguntaron el precio y no agendaron, no la
 * resta de dos barras), así nunca da negativo aunque alguien agende sin haber
 * preguntado el precio.
 *
 * Quien todavía tiene la cita por venir NO cuenta como pérdida: no tuvo
 * ocasión de asistir. Se saca de la base del último paso.
 */
export function pasosDelEmbudo(e: Embudo): PasoEmbudo[] {
  const pct = (perdidas: number, base: number) => (base > 0 ? Math.round((perdidas / base) * 100) : null);
  /* Las citas con la fecha pasada que nadie marcó "Cumplida" NO son pérdida
     ni asistencia: no se sabe. Quedan fuera de la base y de lo perdido (se
     muestran aparte). Perdidas = las canceladas. */
  const baseCitas = e.agendo - e.citaPorVenir - e.citaSinMarcar;
  const perdidasCitas = e.citaCancelada;
  return [
    {
      desde: "Escribieron",
      hacia: "Preguntaron el precio",
      perdidas: e.escribio - e.preguntoPrecio,
      base: e.escribio,
      porcentaje: pct(e.escribio - e.preguntoPrecio, e.escribio),
      detalle: "no preguntaron el precio",
    },
    {
      desde: "Preguntaron el precio",
      hacia: "Agendaron",
      perdidas: e.preguntaronSinAgendar,
      base: e.preguntoPrecio,
      porcentaje: pct(e.preguntaronSinAgendar, e.preguntoPrecio),
      detalle: "preguntaron el precio y no agendaron",
    },
    {
      desde: "Agendaron",
      hacia: "Asistieron",
      perdidas: perdidasCitas,
      base: baseCitas,
      porcentaje: pct(perdidasCitas, baseCitas),
      detalle: "agendaron y cancelaron",
      /* Con citas sin marcar el resultado real de este paso es incierto. */
      incierto: e.citaSinMarcar > 0,
    },
  ];
}

/**
 * El paso donde se cae la MAYOR proporción de gente, entre los que importan:
 * "preguntaron el precio → agendaron" y "agendaron → asistieron". El primer
 * paso (escribieron → preguntaron el precio) NO compite: casi siempre es el
 * más grande porque mucha gente solo quiere saber el horario o la dirección, y
 * eso no son clientes perdidos. Se mide en porcentaje y no en personas, y se
 * pide una base mínima para que "1 de 1" no gane. Si empatan, gana el más
 * cercano a la plata.
 */
export function indiceMayorCaida(pasos: PasoEmbudo[]): number | null {
  let mejor: number | null = null;
  let mejorPct = -1;
  for (let i = 1; i < pasos.length; i += 1) {
    const p = pasos[i];
    if (p.incierto || p.porcentaje === null || p.perdidas <= 0 || p.base < BASE_MINIMA_PARA_DESTACAR) continue;
    if (p.porcentaje >= mejorPct) {
      mejor = i;
      mejorPct = p.porcentaje;
    }
  }
  return mejor;
}

/* --------------------------------------------------------------------------
   Servicios mencionados (para personalizar el mensaje sugerido)
   -------------------------------------------------------------------------- */

export function normalizar(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

const PRIMERAS_PALABRAS_GENERICAS = new Set(["consulta", "servicio", "cita", "control"]);

/**
 * Si el mensaje de la persona nombra un servicio de la lista del negocio,
 * devuelve ese servicio como se dice en una frase ("limpieza dental"). Calza
 * con el nombre completo o con su primera palabra (si es de 6+ letras y no es
 * una palabra genérica). Si no hay una coincidencia clara, `null`: es mejor un
 * mensaje general que decirle a alguien que preguntó por algo que no dijo.
 */
export function servicioMencionado(texto: string, servicios: string[]): string | null {
  const t = normalizar(texto);
  if (!t) return null;
  let mejor: { nombre: string; largo: number } | null = null;

  for (const clave of servicios) {
    const limpio = clave.replace(/\(.*?\)/g, " ").trim();
    for (const alternativa of limpio.split("/")) {
      const nombre = alternativa.trim();
      if (nombre.length < 4) continue;
      const completo = normalizar(nombre);
      const primera = completo.split(/\s+/)[0] ?? "";
      const candidatos = [completo];
      if (primera.length >= 6 && !PRIMERAS_PALABRAS_GENERICAS.has(primera)) candidatos.push(primera);
      for (const c of candidatos) {
        if (t.includes(c) && (!mejor || c.length > mejor.largo)) {
          mejor = { nombre: nombre.toLocaleLowerCase("es"), largo: c.length };
        }
      }
    }
  }
  return mejor ? mejor.nombre : null;
}

/* --------------------------------------------------------------------------
   Mensaje sugerido
   -------------------------------------------------------------------------- */

/** "MARÍA JOSÉ Jiménez" → "María". Si no empieza con una letra (emoji, número), vacío. */
export function primerNombre(nombre: string) {
  /* El primer pedazo que empiece con letra: "😎 Mike" → "Mike". */
  const primero =
    nombre
      .trim()
      .split(/\s+/)
      .find((t) => /^\p{L}/u.test(t)) ?? "";
  const m = /^\p{L}[\p{L}'’-]*/u.exec(primero);
  if (!m || m[0].length < 2) return "";
  return m[0].charAt(0).toLocaleUpperCase("es") + m[0].slice(1).toLocaleLowerCase("es");
}

export function mensajeSugerido(p: {
  nombre: string;
  negocio: string;
  servicio: string | null;
  /** Días desde que preguntó el precio. */
  diasDesdePregunta: number;
  trato: "usted" | "vos";
}) {
  const n = primerNombre(p.nombre);
  const saludo = n ? `Hola ${n},` : "Hola,";
  const negocio = p.negocio.trim();
  const de = negocio ? ` de ${negocio}` : "";
  const cuando =
    p.diasDesdePregunta <= 1 ? "Ayer" : p.diasDesdePregunta <= 6 ? "Hace unos días" : "Hace un tiempo";
  const tema = p.servicio ?? "nuestros precios";

  if (p.trato === "vos") {
    return `${saludo} te escribimos${de}. ${cuando} nos consultaste por ${tema} y quisimos darte seguimiento. ¿Te gustaría que te apartemos una cita? Si querés pensarlo, con gusto te ayudamos con cualquier duda.`;
  }
  return `${saludo} le escribimos${de}. ${cuando} nos consultó por ${tema} y quisimos darle seguimiento. ¿Le gustaría que le apartemos una cita? Si prefiere pensarlo, con gusto le ayudamos con cualquier duda.`;
}

/* --------------------------------------------------------------------------
   3. Oportunidades (y 4. Recuperación, que es un subconjunto)
   -------------------------------------------------------------------------- */

export type Oportunidad = {
  contactoId: string;
  conversacionId: string;
  /** El nombre si lo hay; si no, el teléfono. */
  nombre: string;
  tieneNombre: boolean;
  telefono: string;
  /** Estado de la conversación: agente | espera | humano | cerrada. */
  estado: string;
  ultimoMensaje: string;
  ultimoEn: string;
  /** Su pregunta de precio más reciente (recortada). */
  pregunta: string;
  preguntoEn: string;
  /** Servicio de la lista que nombró en esa pregunta, si lo hizo. */
  servicio: string | null;
  /** Más de 24 h sin actividad: se puede recuperar. */
  recuperable: boolean;
  /** Solo si es recuperable. */
  mensaje: string;
};

export type TramoEdad = { clave: "reciente" | "1a3" | "4a14" | "15a60"; etiqueta: string; cantidad: number };

export type Oportunidades = {
  /** Preguntaron el precio (últimos 60 días) y no tienen cita. */
  total: number;
  /** Con actividad en las últimas 24 h: el agente todavía está conversando con ellas. */
  recientes: number;
  /** Más de 24 h sin actividad. */
  recuperables: number;
  porEdad: TramoEdad[];
  /** Las más recientes primero, hasta el límite. */
  lista: Oportunidad[];
  /** Todas las recuperables (con su mensaje), hasta su propio tope. */
  recuperablesLista: Oportunidad[];
  incompleto: boolean;
};

function recortar(texto: string, max: number) {
  const t = texto.trim().replace(/\s+/g, " ");
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export function calcularOportunidades(e: {
  ahoraMs: number;
  /** Mensajes del contacto que ya pasaron el prefiltro de la base (se vuelve a aplicar el regex). */
  preguntas: PreguntaFila[];
  /** Citas creadas en los últimos 60 días o que todavía no pasan. */
  citas: CitaFila[];
  servicios: string[];
  negocio: string;
  trato: "usted" | "vos";
  limite: number;
  /** Tope propio de la lista de Recuperación. */
  limiteRecuperables: number;
  incompleto: boolean;
}): Oportunidades {
  const hace60Ms = e.ahoraMs - DIAS_OPORTUNIDAD * DIA_MS;

  /* Misma definición del Inicio ("no tiene cita en 60 días": cualquiera que no
     esté cancelada), más una guarda: una cita que todavía no pasa cuenta
     aunque se haya agendado hace más de 60 días. */
  const conCita = new Set<string>();
  for (const c of e.citas) {
    if (c.estado === "cancelada") continue;
    if (Date.parse(c.creadaEn) >= hace60Ms || Date.parse(c.cuando) > e.ahoraMs) conCita.add(c.contactoId);
  }

  const porContacto = new Map<string, PreguntaFila[]>();
  for (const f of e.preguntas) {
    if (!preguntaPrecio(f.texto, f.transcripcion)) continue;
    if (Date.parse(f.creadoEn) < hace60Ms) continue;
    if (conCita.has(f.contactoId)) continue;
    const lista = porContacto.get(f.contactoId);
    if (lista) lista.push(f);
    else porContacto.set(f.contactoId, [f]);
  }

  const oportunidades: Oportunidad[] = [];
  for (const [contactoId, filas] of porContacto) {
    filas.sort((a, b) => Date.parse(b.creadoEn) - Date.parse(a.creadoEn));
    const ultima = filas[0];
    const textoPregunta = (ultima.texto || ultima.transcripcion || "").trim();

    let servicio: string | null = null;
    for (const f of filas) {
      servicio = servicioMencionado(f.texto || f.transcripcion || "", e.servicios);
      if (servicio) break;
    }

    const ultimoMs = Date.parse(ultima.ultimoEn);
    const ultimoEn = Number.isFinite(ultimoMs) ? ultima.ultimoEn : ultima.creadoEn;
    const recuperable = e.ahoraMs - Date.parse(ultimoEn) > HORAS_RECUPERABLE * HORA_MS;
    const nombre = ultima.nombre.trim();
    const diasDesdePregunta = Math.floor((e.ahoraMs - Date.parse(ultima.creadoEn)) / DIA_MS);

    oportunidades.push({
      contactoId,
      conversacionId: ultima.conversacionId,
      nombre: nombre || ultima.telefono || "Sin nombre",
      tieneNombre: Boolean(nombre),
      telefono: ultima.telefono,
      estado: ultima.estado,
      ultimoMensaje: recortar(ultima.ultimoMensaje, 140),
      ultimoEn,
      pregunta: recortar(textoPregunta, 140) || "Nota de voz",
      preguntoEn: ultima.creadoEn,
      servicio,
      recuperable,
      mensaje: recuperable
        ? mensajeSugerido({ nombre, negocio: e.negocio, servicio, diasDesdePregunta, trato: e.trato })
        : "",
    });
  }

  oportunidades.sort((a, b) => Date.parse(b.ultimoEn) - Date.parse(a.ultimoEn));

  const tramos: TramoEdad[] = [
    { clave: "reciente", etiqueta: "Menos de 24 h", cantidad: 0 },
    { clave: "1a3", etiqueta: "1 a 3 días", cantidad: 0 },
    { clave: "4a14", etiqueta: "4 a 14 días", cantidad: 0 },
    { clave: "15a60", etiqueta: "15 a 60 días", cantidad: 0 },
  ];
  for (const o of oportunidades) {
    const edadMs = e.ahoraMs - Date.parse(o.ultimoEn);
    const dias = Math.floor(edadMs / DIA_MS);
    const clave = !o.recuperable ? "reciente" : dias <= 3 ? "1a3" : dias <= 14 ? "4a14" : "15a60";
    const tramo = tramos.find((t) => t.clave === clave);
    if (tramo) tramo.cantidad += 1;
  }

  const recuperables = oportunidades.filter((o) => o.recuperable).length;
  return {
    total: oportunidades.length,
    recientes: oportunidades.length - recuperables,
    recuperables,
    porEdad: tramos,
    lista: oportunidades.slice(0, e.limite),
    recuperablesLista: oportunidades.filter((o) => o.recuperable).slice(0, e.limiteRecuperables),
    incompleto: e.incompleto,
  };
}

/* --------------------------------------------------------------------------
   2. Ventas
   -------------------------------------------------------------------------- */

export type VentaServicio = { servicio: string; cantidad: number; total: number };

export type Ventas = {
  /** "septiembre" */
  mes: string;
  mesPasado: string;
  /** Suma del monto de las citas cumplidas del mes. */
  total: number;
  cumplidas: number;
  /** Cumplidas con un monto mayor a cero: las únicas que suman. */
  conMonto: number;
  /** Cumplidas sin monto (gratis o sin precio cargado): no suman. */
  sinMonto: number;
  /** `null` si ninguna cumplida trae monto. */
  ticketPromedio: number | null;
  porServicio: VentaServicio[];
  mesPasadoTotal: number;
  mesPasadoCumplidas: number;
  /** Citas del mes que ya pasaron y siguen "confirmada" o "sin confirmar". */
  pasadasSinMarcar: number;
  incompleto: boolean;
};

export function calcularVentas(e: {
  mes: string;
  mesPasado: string;
  cumplidas: { monto: number | null; servicio: string | null }[];
  cumplidasMesPasado: { monto: number | null }[];
  pasadasSinMarcar: number;
  incompleto: boolean;
}): Ventas {
  const suma = (filas: { monto: number | null }[]) => filas.reduce((s, f) => s + (f.monto ?? 0), 0);
  const conMontoFilas = e.cumplidas.filter((f) => (f.monto ?? 0) > 0);
  const total = suma(e.cumplidas);

  const porServicio = new Map<string, VentaServicio>();
  for (const f of e.cumplidas) {
    const nombre = (f.servicio ?? "").trim() || "Sin servicio indicado";
    const actual = porServicio.get(nombre) ?? { servicio: nombre, cantidad: 0, total: 0 };
    actual.cantidad += 1;
    actual.total += f.monto ?? 0;
    porServicio.set(nombre, actual);
  }

  return {
    mes: e.mes,
    mesPasado: e.mesPasado,
    total,
    cumplidas: e.cumplidas.length,
    conMonto: conMontoFilas.length,
    sinMonto: e.cumplidas.length - conMontoFilas.length,
    ticketPromedio: conMontoFilas.length > 0 ? Math.round(total / conMontoFilas.length) : null,
    porServicio: [...porServicio.values()].sort((a, b) => b.total - a.total || b.cantidad - a.cantidad),
    mesPasadoTotal: suma(e.cumplidasMesPasado),
    mesPasadoCumplidas: e.cumplidasMesPasado.length,
    pasadasSinMarcar: e.pasadasSinMarcar,
    incompleto: e.incompleto,
  };
}
