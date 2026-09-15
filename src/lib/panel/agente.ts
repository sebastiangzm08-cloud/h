/* ==========================================================================
   LA COSTURA DEL AGENTE DE WHATSAPP.

   Mismo contrato que `datos.ts`: las pantallas piden por acá y por ningún
   otro lado. Consulta las tablas `wa_*` que crea `supabase/agente-whatsapp.sql`.

   RESPALDO A EJEMPLOS — a propósito, y temporal.
   Mientras el SQL no esté corrido, PostgREST responde "no existe esa tabla".
   En vez de reventar la pantalla, cada función devuelve un juego de ejemplos
   coherente (una clínica dental) y `enModoEjemplo()` avisa a la interfaz para
   que lo diga en pantalla. Así el entorno se puede ver y enseñar hoy.

   Cuando el SQL esté corrido y n8n escriba filas, esto se cae solo: las
   consultas empiezan a devolver datos reales y el respaldo deja de usarse.
   Para quitarlo del todo, borrar los `EJEMPLO_*` y los `catch` que los llaman.
   ========================================================================== */
import { cache } from "react";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { getPerfil } from "./datos";
import type { PerfilWhatsapp } from "./agente-formato";

/* -------------------------------------------------------------------------
   Tipos
   ------------------------------------------------------------------------- */

/** Quién tiene el turno de hablar. Es el corazón del producto. */
export type EstadoConversacion = "agente" | "espera" | "humano" | "cerrada";

/** `nota` no la ve el contacto: es el agente hablándole al dueño. */
export type AutorMensaje = "contacto" | "agente" | "humano" | "sistema" | "nota";

export type EstadoContacto =
  | "nuevo"
  | "pregunto_precio"
  | "agendado"
  | "cliente"
  | "perdido";

export type ContactoAgente = {
  id: string;
  telefono: string;
  nombre: string;
  estado: EstadoContacto;
  etiquetas: string[];
  notas: string;
  creadoEn: string;
};

export type ConversacionAgente = {
  id: string;
  contactoId: string;
  nombre: string;
  telefono: string;
  estado: EstadoConversacion;
  motivoEspera: string;
  ultimoMensaje: string;
  ultimoEn: string;
  etiquetas: string[];
};

export type MensajeAgente = {
  id: string;
  autor: AutorMensaje;
  tipo: "texto" | "audio" | "imagen" | "documento";
  texto: string;
  transcripcion: string | null;
  herramientas: string[];
  creadoEn: string;
};

export type CitaAgente = {
  id: string;
  nombre: string;
  cuando: string;
  servicio: string;
  monto: number | null;
  estado: "confirmada" | "sin_confirmar" | "cancelada" | "cumplida";
  recordatorioEn: string | null;
};

export type RecordatorioAgente = {
  id: string;
  contactoId: string;
  nombre: string;
  cuando: string;
  mensaje: string;
  origen: "cita" | "manual";
  estado: "pendiente" | "enviado" | "cancelado";
  repetirCadaHoras: number | null;
  repeticionesRestantes: number | null;
};

export type ItemConocimiento = {
  id: string;
  tipo: "servicio" | "dato" | "regla";
  clave: string;
  valor: string;
  monto: number | null;
  duracionMin: number | null;
  activo: boolean;
};

export type CorreccionAgente = {
  id: string;
  pregunta: string;
  respuesta: string;
  estado: "pendiente" | "ensenada" | "descartada";
  veces: number;
  creadaEn: string;
  deQuien: string;
};

export type ResumenAgente = {
  conversacionesHoy: number;
  resueltasSinVos: number;
  citasHoy: number;
  esperando: number;
  correccionesPendientes: number;
  porHora: { hora: number; cantidad: number }[];
};

/* ---------------------------------------------------------------------
   Correo — mismo cerebro y mismos estados que WhatsApp, canal aparte.
   Ver `agente-correo.sql`: `correo_contactos.estado` usa el mismo check
   que `wa_contactos`, por eso reusa `EstadoContacto` tal cual.
   --------------------------------------------------------------------- */

export type ContactoCorreo = {
  id: string;
  correo: string;
  nombre: string;
  estado: EstadoContacto;
  etiquetas: string[];
  notas: string;
  creadoEn: string;
};

export type ConversacionCorreo = {
  id: string;
  contactoId: string;
  nombre: string;
  correo: string;
  estado: EstadoConversacion;
  motivoEspera: string;
  ultimoMensaje: string;
  ultimoEn: string;
  etiquetas: string[];
};

export type AutorMensajeCorreo = "contacto" | "agente" | "humano" | "sistema";

export type MensajeCorreo = {
  id: string;
  autor: AutorMensajeCorreo;
  asunto: string;
  texto: string;
  creadoEn: string;
};

/* -------------------------------------------------------------------------
   Detección del modo ejemplo

   Una sola sonda por request (`cache` de React la memoiza). Si la tabla no
   existe todavía, todo el módulo trabaja con ejemplos.
   ------------------------------------------------------------------------- */

export const enModoEjemplo = cache(async function enModoEjemplo(): Promise<boolean> {
  try {
    const sb = await supabaseServidor();
    /* OJO: tiene que ser un select NORMAL. Con `{ head: true }` PostgREST
       contesta 204 sin cuerpo y sin error aunque la tabla no exista —
       comprobado— y la sonda daría "ya existe" siempre. */
    const { error } = await sb.from("wa_conversaciones").select("id").limit(1);
    // 42P01 = la tabla no existe · PGRST205 = PostgREST no la tiene en caché
    return Boolean(error);
  } catch {
    return true;
  }
});

async function clienteId(): Promise<string | null> {
  const perfil = await getPerfil();
  return perfil.clienteId;
}

/* -------------------------------------------------------------------------
   Ejemplos — una clínica dental, para que se entienda de un vistazo.

   Las fechas se calculan contra `ahora` para que nunca se vean vencidas.
   ------------------------------------------------------------------------- */

function haceMin(min: number) {
  return new Date(Date.now() - min * 60_000).toISOString();
}
function enDias(dias: number, hora: number, minuto = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(hora, minuto, 0, 0);
  return d.toISOString();
}

const EJEMPLO_CONVERSACIONES: ConversacionAgente[] = [
  {
    id: "ej-maria",
    contactoId: "ct-maria",
    nombre: "María Jiménez",
    telefono: "+506 8712-4409",
    estado: "espera",
    motivoEspera: "No tenía el precio de reparación de un puente",
    ultimoMensaje: "…y cuánto saldría repararlo?",
    ultimoEn: haceMin(6),
    etiquetas: ["Paciente nuevo", "Cita agendada"],
  },
  {
    id: "ej-rodrigo",
    contactoId: "ct-rodrigo",
    nombre: "Rodrigo Alfaro",
    telefono: "+506 8834-2210",
    estado: "agente",
    motivoEspera: "",
    ultimoMensaje: "Perfecto, ahí nos vemos el sábado entonces",
    ultimoEn: haceMin(27),
    etiquetas: ["Cita agendada"],
  },
  {
    id: "ej-kimberly",
    contactoId: "ct-kimberly",
    nombre: "Kimberly Mora",
    telefono: "+506 7011-9583",
    estado: "agente",
    motivoEspera: "",
    ultimoMensaje: "Ah ok, muchas gracias por la información",
    ultimoEn: haceMin(44),
    etiquetas: ["Blanqueamiento"],
  },
  {
    id: "ej-carlos",
    contactoId: "ct-carlos",
    nombre: "Carlos Vargas",
    telefono: "+506 6128-7744",
    estado: "humano",
    motivoEspera: "",
    ultimoMensaje: "Perfecto, muchas gracias Andrea",
    ultimoEn: haceMin(71),
    etiquetas: ["Seguro INS"],
  },
  {
    id: "ej-jose",
    contactoId: "ct-jose",
    nombre: "Jose Pablo Chaves",
    telefono: "+506 8390-1265",
    estado: "agente",
    motivoEspera: "",
    ultimoMensaje: "Dale, nos vemos el lunes",
    ultimoEn: haceMin(98),
    etiquetas: ["Cita agendada", "Resina"],
  },
  {
    id: "ej-laura",
    contactoId: "ct-laura",
    nombre: "Laura Sandí",
    telefono: "+506 8455-0932",
    estado: "agente",
    motivoEspera: "",
    ultimoMensaje: "¿A qué hora abren hoy?",
    ultimoEn: haceMin(120),
    etiquetas: ["Recurrente"],
  },
];

const EJEMPLO_MENSAJES: Record<string, MensajeAgente[]> = {
  "ej-maria": [
    { id: "m1", autor: "contacto", tipo: "texto", texto: "Buenas", transcripcion: null, herramientas: [], creadoEn: haceMin(16) },
    { id: "m2", autor: "contacto", tipo: "texto", texto: "Disculpe una consulta", transcripcion: null, herramientas: [], creadoEn: haceMin(16) },
    { id: "m3", autor: "contacto", tipo: "texto", texto: "¿ustedes hacen limpieza dental?", transcripcion: null, herramientas: [], creadoEn: haceMin(16) },
    {
      id: "m4",
      autor: "contacto",
      tipo: "audio",
      texto: "",
      transcripcion:
        "Perdón, y también quería saber si atienden los sábados, porque yo entre semana trabajo todo el día.",
      herramientas: [],
      creadoEn: haceMin(16),
    },
    { id: "m5", autor: "sistema", tipo: "texto", texto: "El agente esperó 12 segundos a que terminara de escribir", transcripcion: null, herramientas: [], creadoEn: haceMin(15) },
    {
      id: "m6",
      autor: "agente",
      tipo: "texto",
      texto:
        "¡Hola María! Con mucho gusto. Sí hacemos limpieza dental, cuesta ₡25.000 y toma unos 40 minutos.\n\nY sí, los sábados atendemos de 8 a.m. a 12 m.d. Este sábado tengo campo a las 9:00 a.m. o a las 10:30 a.m. ¿Cuál le sirve mejor?",
      transcripcion: null,
      herramientas: ["precios", "agenda"],
      creadoEn: haceMin(15),
    },
    { id: "m7", autor: "contacto", tipo: "texto", texto: "La de 9 me sirve", transcripcion: null, herramientas: [], creadoEn: haceMin(13) },
    {
      id: "m8",
      autor: "agente",
      tipo: "texto",
      texto:
        "Listo, se la aparté: sábado a las 9:00 a.m., limpieza dental. Si le surge algo me avisa por aquí y la movemos.",
      transcripcion: null,
      herramientas: ["agenda"],
      creadoEn: haceMin(13),
    },
    {
      id: "m9",
      autor: "contacto",
      tipo: "texto",
      texto:
        "Una última cosa: tengo un puente que se me despegó, ¿eso lo pueden ver el mismo día? ¿y como cuánto saldría?",
      transcripcion: null,
      herramientas: [],
      creadoEn: haceMin(6),
    },
    {
      id: "m10",
      autor: "nota",
      tipo: "texto",
      texto:
        "No tengo el precio de reparación de puente en lo que me cargaron, y prefiero no inventar un monto. Le dije a María que le confirmás vos en un momento.",
      transcripcion: null,
      herramientas: [],
      creadoEn: haceMin(6),
    },
  ],
  "ej-rodrigo": [
    { id: "r1", autor: "contacto", tipo: "texto", texto: "Buenas, quería saber si dan citas de valoración", transcripcion: null, herramientas: [], creadoEn: haceMin(62) },
    {
      id: "r2",
      autor: "agente",
      tipo: "texto",
      texto:
        "¡Hola! Con mucho gusto. La valoración es gratis y toma unos 20 minutos — el doctor le revisa y le dice qué necesita, sin compromiso.\n\nTengo campo el sábado a las 10:30 a.m. o el lunes a las 3:00 p.m. ¿Cuál le queda mejor?",
      transcripcion: null,
      herramientas: ["precios", "agenda"],
      creadoEn: haceMin(61),
    },
    { id: "r3", autor: "contacto", tipo: "texto", texto: "El sábado a las 10:30 me queda bien", transcripcion: null, herramientas: [], creadoEn: haceMin(29) },
    {
      id: "r4",
      autor: "agente",
      tipo: "texto",
      texto:
        "Listo don Rodrigo, se la aparté: sábado a las 10:30 a.m., valoración. El viernes le mando un recordatorio.",
      transcripcion: null,
      herramientas: ["agenda"],
      creadoEn: haceMin(28),
    },
    { id: "r5", autor: "contacto", tipo: "texto", texto: "Perfecto, ahí nos vemos el sábado entonces", transcripcion: null, herramientas: [], creadoEn: haceMin(27) },
  ],
  "ej-kimberly": [
    { id: "k1", autor: "contacto", tipo: "texto", texto: "Hola, ¿cuánto cuesta el blanqueamiento?", transcripcion: null, herramientas: [], creadoEn: haceMin(51) },
    {
      id: "k2",
      autor: "agente",
      tipo: "texto",
      texto:
        "¡Hola! El blanqueamiento cuesta ₡120.000 y se hace en una sola sesión de como hora y media. Queda listo el mismo día.",
      transcripcion: null,
      herramientas: ["precios"],
      creadoEn: haceMin(51),
    },
    { id: "k3", autor: "contacto", tipo: "texto", texto: "¿Y tienen parqueo ahí?", transcripcion: null, herramientas: [], creadoEn: haceMin(47) },
    {
      id: "k4",
      autor: "agente",
      tipo: "texto",
      texto:
        "Esa no se la puedo confirmar con seguridad ahorita — déjeme consultarlo con la clínica y le escribo hoy mismo, no quiero darle un dato equivocado.",
      transcripcion: null,
      herramientas: [],
      creadoEn: haceMin(46),
    },
    {
      id: "k5",
      autor: "nota",
      tipo: "texto",
      texto:
        "No tengo nada cargado sobre parqueo. Contestalo una vez en Correcciones y se lo respondo yo a Kimberly y a quien pregunte después.",
      transcripcion: null,
      herramientas: [],
      creadoEn: haceMin(46),
    },
    { id: "k6", autor: "contacto", tipo: "texto", texto: "Ah ok, muchas gracias por la información", transcripcion: null, herramientas: [], creadoEn: haceMin(44) },
  ],
  "ej-carlos": [
    {
      id: "c1",
      autor: "contacto",
      tipo: "audio",
      texto: "",
      transcripcion:
        "Buenas, una consulta: ¿ustedes reciben el seguro del INS? Es que yo tengo póliza y quería ver si me cubre la limpieza o si tengo que pagarla aparte.",
      herramientas: [],
      creadoEn: haceMin(79),
    },
    {
      id: "c2",
      autor: "agente",
      tipo: "texto",
      texto:
        "Buenas don Carlos, con mucho gusto le averiguo. Déjeme confirmarlo con la clínica y le escribo en un momentito.",
      transcripcion: null,
      herramientas: [],
      creadoEn: haceMin(79),
    },
    {
      id: "c3",
      autor: "nota",
      tipo: "texto",
      texto:
        "Me preguntaron por el seguro del INS y no tengo nada cargado sobre seguros. No quise inventar.",
      transcripcion: null,
      herramientas: [],
      creadoEn: haceMin(79),
    },
    { id: "c4", autor: "sistema", tipo: "texto", texto: "Andrea tomó la conversación", transcripcion: null, herramientas: [], creadoEn: haceMin(76) },
    {
      id: "c5",
      autor: "humano",
      tipo: "texto",
      texto:
        "Don Carlos, buenas. Sí trabajamos con INS: la limpieza se la cubren, solo tiene que traer la orden patronal el día de la cita. ¿Le agendo?",
      transcripcion: null,
      herramientas: [],
      creadoEn: haceMin(74),
    },
    { id: "c6", autor: "contacto", tipo: "texto", texto: "Perfecto, muchas gracias Andrea", transcripcion: null, herramientas: [], creadoEn: haceMin(71) },
  ],
  "ej-jose": [
    { id: "j1", autor: "contacto", tipo: "texto", texto: "Buenas, quería preguntar por una resina", transcripcion: null, herramientas: [], creadoEn: haceMin(104) },
    { id: "j2", autor: "contacto", tipo: "texto", texto: "se me picó una muela de atrás", transcripcion: null, herramientas: [], creadoEn: haceMin(104) },
    { id: "j3", autor: "sistema", tipo: "texto", texto: "El agente esperó 12 segundos a que terminara de escribir", transcripcion: null, herramientas: [], creadoEn: haceMin(103) },
    {
      id: "j4",
      autor: "agente",
      tipo: "texto",
      texto:
        "¡Hola! La resina cuesta ₡30.000 por pieza y se hace en una sola cita de unos 40 minutos.\n\nEso sí, el precio final lo confirma el doctor cuando la revise, porque depende de qué tan grande esté la picadura. Tengo campo el lunes a las 2:00 p.m. ¿Le sirve?",
      transcripcion: null,
      herramientas: ["precios", "agenda"],
      creadoEn: haceMin(103),
    },
    { id: "j5", autor: "contacto", tipo: "texto", texto: "El lunes a las 2 está bien", transcripcion: null, herramientas: [], creadoEn: haceMin(99) },
    { id: "j6", autor: "agente", tipo: "texto", texto: "Listo, agendado: lunes a las 2:00 p.m. Le mando recordatorio el domingo.", transcripcion: null, herramientas: ["agenda"], creadoEn: haceMin(99) },
    { id: "j7", autor: "contacto", tipo: "texto", texto: "Dale, nos vemos el lunes", transcripcion: null, herramientas: [], creadoEn: haceMin(98) },
  ],
  "ej-laura": [
    { id: "l1", autor: "contacto", tipo: "texto", texto: "¿A qué hora abren hoy?", transcripcion: null, herramientas: [], creadoEn: haceMin(120) },
    {
      id: "l2",
      autor: "agente",
      tipo: "texto",
      texto:
        "¡Hola doña Laura! Hoy atendemos de 8:00 a.m. a 5:00 p.m. ¿Le agendo algo o pasa sin cita?",
      transcripcion: null,
      herramientas: ["horario"],
      creadoEn: haceMin(120),
    },
  ],
};

const EJEMPLO_CONTACTOS: ContactoAgente[] = [
  { id: "ct-maria", telefono: "+506 8712-4409", nombre: "María Jiménez", estado: "agendado", etiquetas: ["Paciente nuevo", "Solo sábados"], notas: "Trabaja entre semana. Puente despegado pendiente de valorar.", creadoEn: haceMin(16) },
  { id: "ct-rodrigo", telefono: "+506 8834-2210", nombre: "Rodrigo Alfaro", estado: "agendado", etiquetas: ["Paciente nuevo"], notas: "Resuelto por el agente de punta a punta.", creadoEn: haceMin(62) },
  { id: "ct-kimberly", telefono: "+506 7011-9583", nombre: "Kimberly Mora", estado: "pregunto_precio", etiquetas: ["Blanqueamiento"], notas: "Preguntó por parqueo; quedó en Correcciones.", creadoEn: haceMin(51) },
  { id: "ct-carlos", telefono: "+506 6128-7744", nombre: "Carlos Vargas", estado: "cliente", etiquetas: ["Seguro INS", "Manda audios"], notas: "Tiene póliza del INS. Debe traer orden patronal.", creadoEn: haceMin(79) },
  { id: "ct-jose", telefono: "+506 8390-1265", nombre: "Jose Pablo Chaves", estado: "agendado", etiquetas: ["Resina"], notas: "Muela de atrás picada.", creadoEn: haceMin(104) },
  { id: "ct-laura", telefono: "+506 8455-0932", nombre: "Laura Sandí", estado: "cliente", etiquetas: ["Recurrente"], notas: "Paciente de años.", creadoEn: haceMin(120) },
  { id: "ct-gerson", telefono: "+506 7288-6001", nombre: "Gerson Picado", estado: "perdido", etiquetas: ["Ortodoncia"], notas: "Preguntó y no volvió.", creadoEn: haceMin(60 * 24 * 14) },
];

const EJEMPLO_CITAS: CitaAgente[] = [
  { id: "ci-1", nombre: "María Jiménez", cuando: enDias(2, 9), servicio: "Limpieza dental", monto: 25000, estado: "confirmada", recordatorioEn: enDias(1, 15) },
  { id: "ci-2", nombre: "Rodrigo Alfaro", cuando: enDias(2, 10, 30), servicio: "Valoración", monto: null, estado: "confirmada", recordatorioEn: enDias(1, 15) },
  { id: "ci-3", nombre: "Jose Pablo Chaves", cuando: enDias(4, 14), servicio: "Resina", monto: 30000, estado: "sin_confirmar", recordatorioEn: enDias(3, 15) },
  { id: "ci-4", nombre: "Laura Sandí", cuando: enDias(6, 11), servicio: "Control", monto: 15000, estado: "confirmada", recordatorioEn: enDias(5, 15) },
  { id: "ci-5", nombre: "Kimberly Mora", cuando: enDias(7, 8, 30), servicio: "Blanqueamiento", monto: 120000, estado: "sin_confirmar", recordatorioEn: enDias(6, 15) },
];

const EJEMPLO_CONOCIMIENTO: ItemConocimiento[] = [
  { id: "co-1", tipo: "servicio", clave: "Valoración / primera consulta", valor: "", monto: 0, duracionMin: 20, activo: true },
  { id: "co-2", tipo: "servicio", clave: "Limpieza dental", valor: "", monto: 25000, duracionMin: 40, activo: true },
  { id: "co-3", tipo: "servicio", clave: "Resina (por pieza)", valor: "", monto: 30000, duracionMin: 40, activo: true },
  { id: "co-4", tipo: "servicio", clave: "Extracción simple", valor: "", monto: 35000, duracionMin: 30, activo: true },
  { id: "co-5", tipo: "servicio", clave: "Control", valor: "", monto: 15000, duracionMin: 20, activo: true },
  { id: "co-6", tipo: "servicio", clave: "Blanqueamiento", valor: "", monto: 120000, duracionMin: 90, activo: true },
  { id: "co-7", tipo: "dato", clave: "Lunes a viernes", valor: "8:00 a.m. – 5:00 p.m.", monto: null, duracionMin: null, activo: true },
  { id: "co-8", tipo: "dato", clave: "Sábados", valor: "8:00 a.m. – 12:00 m.d.", monto: null, duracionMin: null, activo: true },
  { id: "co-9", tipo: "dato", clave: "Domingos", valor: "Cerrado", monto: null, duracionMin: null, activo: true },
  { id: "co-10", tipo: "dato", clave: "Dirección", valor: "Curridabat, 100 m sur del parque", monto: null, duracionMin: null, activo: true },
  { id: "co-11", tipo: "regla", clave: "No dar diagnósticos ni decir qué tratamiento necesita alguien", valor: "", monto: null, duracionMin: null, activo: true },
  { id: "co-12", tipo: "regla", clave: "No prometer resultados", valor: "", monto: null, duracionMin: null, activo: true },
  { id: "co-13", tipo: "regla", clave: "No dar precios que no estén en la lista", valor: "", monto: null, duracionMin: null, activo: true },
  { id: "co-14", tipo: "regla", clave: "No hablar de otras clínicas ni compararse", valor: "", monto: null, duracionMin: null, activo: true },
];

const EJEMPLO_CORRECCIONES: CorreccionAgente[] = [
  { id: "cr-1", pregunta: "¿Cuánto cuesta reparar un puente que se despegó?", respuesta: "", estado: "pendiente", veces: 1, creadaEn: haceMin(6), deQuien: "María Jiménez" },
  { id: "cr-2", pregunta: "¿Aceptan el seguro del INS?", respuesta: "", estado: "pendiente", veces: 3, creadaEn: haceMin(79), deQuien: "Carlos Vargas" },
  { id: "cr-3", pregunta: "¿Tienen parqueo en el local?", respuesta: "", estado: "pendiente", veces: 1, creadaEn: haceMin(46), deQuien: "Kimberly Mora" },
];

/* -------------------------------------------------------------------------
   Lecturas
   ------------------------------------------------------------------------- */

type FilaConversacion = {
  id: string;
  contacto_id: string;
  estado: string;
  motivo_espera: string | null;
  ultimo_mensaje: string | null;
  ultimo_en: string;
  wa_contactos: { nombre: string | null; telefono: string; etiquetas: string[] | null } | null;
};

function comoEstado(v: string): EstadoConversacion {
  return (["agente", "espera", "humano", "cerrada"].includes(v)
    ? v
    : "agente") as EstadoConversacion;
}

/**
 * Cuántas respuestas mandó el agente este mes — el número real que mueve el
 * costo de Gemini, a diferencia de "conversaciones" (que solo cuenta hilos
 * distintos, no cuántas idas y vueltas tuvo cada uno). Ver
 * [[project-agente-whatsapp]] para el porqué.
 */
export async function getMensajesAgenteMes(): Promise<number> {
  if (await enModoEjemplo()) return 0;

  const id = await clienteId();
  if (!id) return 0;

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const sb = await supabaseServidor();
  const { count } = await sb
    .from("wa_mensajes")
    .select("id", { count: "exact", head: true })
    .eq("cliente_id", id)
    .eq("autor", "agente")
    .gte("creado_en", inicioMes.toISOString());

  return count ?? 0;
}

export async function getConversaciones(): Promise<ConversacionAgente[]> {
  if (await enModoEjemplo()) return EJEMPLO_CONVERSACIONES;

  const id = await clienteId();
  if (!id) return [];

  const sb = await supabaseServidor();
  const { data, error } = await sb
    .from("wa_conversaciones")
    .select(
      "id, contacto_id, estado, motivo_espera, ultimo_mensaje, ultimo_en, wa_contactos(nombre, telefono, etiquetas)"
    )
    .eq("cliente_id", id)
    .neq("estado", "cerrada")
    .order("ultimo_en", { ascending: false })
    .limit(80);

  if (error || !data) return [];

  return (data as unknown as FilaConversacion[]).map((f) => ({
    id: f.id,
    contactoId: f.contacto_id,
    nombre: f.wa_contactos?.nombre?.trim() || f.wa_contactos?.telefono || "Sin nombre",
    telefono: f.wa_contactos?.telefono ?? "",
    estado: comoEstado(f.estado),
    motivoEspera: f.motivo_espera ?? "",
    ultimoMensaje: f.ultimo_mensaje ?? "",
    ultimoEn: f.ultimo_en,
    etiquetas: f.wa_contactos?.etiquetas ?? [],
  }));
}

export async function getMensajes(conversacionId: string): Promise<MensajeAgente[]> {
  if (await enModoEjemplo()) return EJEMPLO_MENSAJES[conversacionId] ?? [];

  const id = await clienteId();
  if (!id) return [];

  const sb = await supabaseServidor();
  const { data, error } = await sb
    .from("wa_mensajes")
    .select("id, autor, tipo, texto, transcripcion, herramientas, creado_en")
    .eq("cliente_id", id)
    .eq("conversacion_id", conversacionId)
    .order("creado_en", { ascending: true })
    .limit(300);

  if (error || !data) return [];

  return data.map((f) => ({
    id: f.id as string,
    autor: f.autor as AutorMensaje,
    tipo: (f.tipo ?? "texto") as MensajeAgente["tipo"],
    texto: (f.texto as string) ?? "",
    transcripcion: (f.transcripcion as string | null) ?? null,
    herramientas: (f.herramientas as string[] | null) ?? [],
    creadoEn: f.creado_en as string,
  }));
}

export async function getContactos(): Promise<ContactoAgente[]> {
  if (await enModoEjemplo()) return EJEMPLO_CONTACTOS;

  const id = await clienteId();
  if (!id) return [];

  const sb = await supabaseServidor();
  const { data, error } = await sb
    .from("wa_contactos")
    .select("id, telefono, nombre, estado, etiquetas, notas, creado_en")
    .eq("cliente_id", id)
    .order("creado_en", { ascending: false })
    .limit(300);

  if (error || !data) return [];

  return data.map((f) => ({
    id: f.id as string,
    telefono: (f.telefono as string) ?? "",
    nombre: ((f.nombre as string) ?? "").trim(),
    estado: (f.estado ?? "nuevo") as EstadoContacto,
    etiquetas: (f.etiquetas as string[] | null) ?? [],
    notas: (f.notas as string) ?? "",
    creadoEn: f.creado_en as string,
  }));
}

export async function getRecordatorios(): Promise<RecordatorioAgente[]> {
  if (await enModoEjemplo()) return [];

  const id = await clienteId();
  if (!id) return [];

  const sb = await supabaseServidor();
  const { data, error } = await sb
    .from("wa_recordatorios")
    .select("id, contacto_id, cuando, mensaje, origen, estado, repetir_cada_horas, repeticiones_restantes, wa_contactos(nombre, telefono)")
    .eq("cliente_id", id)
    .eq("estado", "pendiente")
    .order("cuando", { ascending: true })
    .limit(100);

  if (error || !data) return [];

  type FilaRecordatorio = {
    id: string;
    contacto_id: string;
    cuando: string;
    mensaje: string;
    origen: string;
    estado: string;
    repetir_cada_horas: number | null;
    repeticiones_restantes: number | null;
    wa_contactos: { nombre: string | null; telefono: string } | null;
  };

  return (data as unknown as FilaRecordatorio[]).map((f) => ({
    id: f.id,
    contactoId: f.contacto_id,
    nombre: f.wa_contactos?.nombre?.trim() || f.wa_contactos?.telefono || "Sin nombre",
    cuando: f.cuando,
    mensaje: f.mensaje,
    origen: (f.origen === "cita" ? "cita" : "manual") as RecordatorioAgente["origen"],
    estado: "pendiente",
    repetirCadaHoras: f.repetir_cada_horas,
    repeticionesRestantes: f.repeticiones_restantes,
  }));
}

export async function getCitas(): Promise<CitaAgente[]> {
  if (await enModoEjemplo()) return EJEMPLO_CITAS;

  const id = await clienteId();
  if (!id) return [];

  const sb = await supabaseServidor();
  const { data, error } = await sb
    .from("wa_citas")
    .select("id, cuando, servicio, monto, estado, recordatorio_en, wa_contactos(nombre, telefono)")
    .eq("cliente_id", id)
    .gte("cuando", new Date(Date.now() - 86_400_000).toISOString())
    .order("cuando", { ascending: true })
    .limit(100);

  if (error || !data) return [];

  type FilaCita = {
    id: string;
    cuando: string;
    servicio: string | null;
    monto: number | null;
    estado: string;
    recordatorio_en: string | null;
    wa_contactos: { nombre: string | null; telefono: string } | null;
  };

  return (data as unknown as FilaCita[]).map((f) => ({
    id: f.id,
    nombre: f.wa_contactos?.nombre?.trim() || f.wa_contactos?.telefono || "Sin nombre",
    cuando: f.cuando,
    servicio: f.servicio ?? "",
    monto: f.monto,
    estado: (f.estado ?? "confirmada") as CitaAgente["estado"],
    recordatorioEn: f.recordatorio_en,
  }));
}

export async function getConocimiento(): Promise<ItemConocimiento[]> {
  if (await enModoEjemplo()) return EJEMPLO_CONOCIMIENTO;

  const id = await clienteId();
  if (!id) return [];

  const sb = await supabaseServidor();
  const { data, error } = await sb
    .from("wa_conocimiento")
    .select("id, tipo, clave, valor, monto, duracion_min, activo")
    .eq("cliente_id", id)
    .order("orden", { ascending: true })
    .limit(300);

  if (error || !data) return [];

  return data.map((f) => ({
    id: f.id as string,
    tipo: f.tipo as ItemConocimiento["tipo"],
    clave: (f.clave as string) ?? "",
    valor: (f.valor as string) ?? "",
    monto: (f.monto as number | null) ?? null,
    duracionMin: (f.duracion_min as number | null) ?? null,
    activo: (f.activo as boolean) ?? true,
  }));
}

export async function getCorrecciones(): Promise<CorreccionAgente[]> {
  if (await enModoEjemplo()) return EJEMPLO_CORRECCIONES;

  const id = await clienteId();
  if (!id) return [];

  const sb = await supabaseServidor();
  const { data, error } = await sb
    .from("wa_correcciones")
    .select("id, pregunta, respuesta, estado, veces, creada_en, wa_conversaciones(wa_contactos(nombre))")
    .eq("cliente_id", id)
    .eq("estado", "pendiente")
    .order("veces", { ascending: false })
    .limit(60);

  if (error || !data) return [];

  type FilaCorreccion = {
    id: string;
    pregunta: string;
    respuesta: string | null;
    estado: string;
    veces: number;
    creada_en: string;
    wa_conversaciones: { wa_contactos: { nombre: string | null } | null } | null;
  };

  return (data as unknown as FilaCorreccion[]).map((f) => ({
    id: f.id,
    pregunta: f.pregunta,
    respuesta: f.respuesta ?? "",
    estado: f.estado as CorreccionAgente["estado"],
    veces: f.veces,
    creadaEn: f.creada_en,
    deQuien: f.wa_conversaciones?.wa_contactos?.nombre ?? "",
  }));
}

type FilaConversacionCorreo = {
  id: string;
  contacto_id: string;
  estado: string;
  motivo_espera: string | null;
  ultimo_mensaje: string | null;
  ultimo_en: string;
  correo_contactos: { nombre: string | null; correo: string; etiquetas: string[] | null } | null;
};

export async function getConversacionesCorreo(): Promise<ConversacionCorreo[]> {
  const id = await clienteId();
  if (!id) return [];

  const sb = await supabaseServidor();
  const { data, error } = await sb
    .from("correo_conversaciones")
    .select(
      "id, contacto_id, estado, motivo_espera, ultimo_mensaje, ultimo_en, correo_contactos(nombre, correo, etiquetas)"
    )
    .eq("cliente_id", id)
    .neq("estado", "cerrada")
    .order("ultimo_en", { ascending: false })
    .limit(80);

  if (error || !data) return [];

  return (data as unknown as FilaConversacionCorreo[]).map((f) => ({
    id: f.id,
    contactoId: f.contacto_id,
    nombre: f.correo_contactos?.nombre?.trim() || f.correo_contactos?.correo || "Sin nombre",
    correo: f.correo_contactos?.correo ?? "",
    estado: comoEstado(f.estado),
    motivoEspera: f.motivo_espera ?? "",
    ultimoMensaje: f.ultimo_mensaje ?? "",
    ultimoEn: f.ultimo_en,
    etiquetas: f.correo_contactos?.etiquetas ?? [],
  }));
}

export async function getMensajesCorreo(conversacionId: string): Promise<MensajeCorreo[]> {
  const id = await clienteId();
  if (!id) return [];

  const sb = await supabaseServidor();
  const { data, error } = await sb
    .from("correo_mensajes")
    .select("id, autor, asunto, texto, creado_en")
    .eq("cliente_id", id)
    .eq("conversacion_id", conversacionId)
    .order("creado_en", { ascending: true })
    .limit(300);

  if (error || !data) return [];

  return data.map((f) => ({
    id: f.id as string,
    autor: f.autor as AutorMensajeCorreo,
    asunto: (f.asunto as string) ?? "",
    texto: (f.texto as string) ?? "",
    creadoEn: f.creado_en as string,
  }));
}

export async function getContactosCorreo(): Promise<ContactoCorreo[]> {
  const id = await clienteId();
  if (!id) return [];

  const sb = await supabaseServidor();
  const { data, error } = await sb
    .from("correo_contactos")
    .select("id, correo, nombre, estado, etiquetas, notas, creado_en")
    .eq("cliente_id", id)
    .order("creado_en", { ascending: false })
    .limit(300);

  if (error || !data) return [];

  return data.map((f) => ({
    id: f.id as string,
    correo: (f.correo as string) ?? "",
    nombre: ((f.nombre as string) ?? "").trim(),
    estado: (f.estado ?? "nuevo") as EstadoContacto,
    etiquetas: (f.etiquetas as string[] | null) ?? [],
    notas: (f.notas as string) ?? "",
    creadoEn: f.creado_en as string,
  }));
}

const EJEMPLO_HORARIO: Record<string, [string, string][]> = {
  lun: [["08:00", "17:00"]],
  mar: [["08:00", "17:00"]],
  mie: [["08:00", "17:00"]],
  jue: [["08:00", "17:00"]],
  vie: [["08:00", "17:00"]],
  sab: [["08:00", "12:00"]],
  dom: [],
};

/**
 * El horario estructurado con el que el agente calcula disponibilidad de
 * verdad. Vive en `clientes.horario` (no en `wa_conocimiento`, donde solo
 * está el texto libre que el agente le recita a la gente).
 */
export async function getHorarioNegocio(): Promise<Record<string, [string, string][]>> {
  if (await enModoEjemplo()) return EJEMPLO_HORARIO;

  const id = await clienteId();
  if (!id) return {};

  const sb = await supabaseServidor();
  const { data, error } = await sb.from("clientes").select("horario").eq("id", id).single();
  if (error || !data?.horario) return {};

  return data.horario as Record<string, [string, string][]>;
}

export type SaludConexion =
  | { estado: "sin_conectar" }
  | { estado: "ok"; numero: string; calidad: string | null }
  | { estado: "token_vencido"; detalle: string };

/**
 * El perfil de negocio que la gente ve al abrir el chat (foto, "info",
 * descripción, dirección, sitio) — se lee EN VIVO de Meta, no de una copia
 * guardada: es la fuente de verdad y así el formulario nunca muestra un
 * dato viejo si alguien lo cambió por otro lado.
 */
export async function getPerfilWhatsapp(): Promise<PerfilWhatsapp> {
  const id = await clienteId();
  if (!id) return { estado: "sin_conectar" };

  const sb = await supabaseServidor();
  const { data } = await sb
    .from("conexiones")
    .select("detalle")
    .eq("cliente_id", id)
    .eq("servicio", "whatsapp")
    .maybeSingle();

  const detalle = (data?.detalle ?? {}) as { token?: string; endpoint?: string; phone_number_id?: string };
  if (!detalle.token || !detalle.phone_number_id) return { estado: "sin_conectar" };

  const endpoint = detalle.endpoint || "https://graph.facebook.com/v21.0";
  try {
    const res = await fetch(
      `${endpoint}/${detalle.phone_number_id}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical`,
      { headers: { Authorization: `Bearer ${detalle.token}` }, cache: "no-store" }
    );
    const cuerpo = await res.json();
    if (!res.ok) {
      return { estado: "error", detalle: cuerpo?.error?.message || `Meta respondió ${res.status}` };
    }
    const perfil = cuerpo.data?.[0] ?? {};
    return {
      estado: "ok",
      about: perfil.about ?? "",
      descripcion: perfil.description ?? "",
      direccion: perfil.address ?? "",
      correo: perfil.email ?? "",
      sitio: perfil.websites?.[0] ?? "",
      vertical: perfil.vertical ?? "OTHER",
      fotoUrl: perfil.profile_picture_url ?? "",
    };
  } catch (e) {
    return { estado: "error", detalle: (e as Error).message };
  }
}

/**
 * Chequeo EN VIVO de la conexión de WhatsApp — le pregunta a Meta directo,
 * no solo mira lo que hay guardado. Antes esto solo se sabía cuando el
 * agente ya llevaba rato sin contestar y alguien iba a revisar n8n a mano.
 */
export async function getSaludConexion(): Promise<SaludConexion> {
  const id = await clienteId();
  if (!id) return { estado: "sin_conectar" };

  const sb = await supabaseServidor();
  const { data } = await sb
    .from("conexiones")
    .select("detalle")
    .eq("cliente_id", id)
    .eq("servicio", "whatsapp")
    .maybeSingle();

  const detalle = (data?.detalle ?? {}) as { token?: string; endpoint?: string; phone_number_id?: string };
  if (!detalle.token || !detalle.phone_number_id) return { estado: "sin_conectar" };

  const endpoint = detalle.endpoint || "https://graph.facebook.com/v21.0";
  try {
    const res = await fetch(
      `${endpoint}/${detalle.phone_number_id}?fields=display_phone_number,quality_rating`,
      { headers: { Authorization: `Bearer ${detalle.token}` }, cache: "no-store" }
    );
    const cuerpo = await res.json();
    if (!res.ok) {
      return { estado: "token_vencido", detalle: cuerpo?.error?.message || `Meta respondió ${res.status}` };
    }
    return { estado: "ok", numero: cuerpo.display_phone_number ?? "", calidad: cuerpo.quality_rating ?? null };
  } catch (e) {
    return { estado: "token_vencido", detalle: (e as Error).message };
  }
}

/**
 * Métricas del Resumen. Se calculan sobre las conversaciones del día:
 * "resueltas sin vos" son las que el agente cerró sin que nadie las tomara,
 * que es exactamente lo que el dueño quiere saber.
 */
export async function getResumenAgente(): Promise<ResumenAgente> {
  const [convs, citas, correcciones] = await Promise.all([
    getConversaciones(),
    getCitas(),
    getCorrecciones(),
  ]);

  const inicioDia = new Date();
  inicioDia.setHours(0, 0, 0, 0);
  const hoy = convs.filter((c) => new Date(c.ultimoEn) >= inicioDia);

  const porHora: { hora: number; cantidad: number }[] = [];
  for (let h = 7; h <= 18; h += 1) {
    porHora.push({
      hora: h,
      cantidad: hoy.filter((c) => new Date(c.ultimoEn).getHours() === h).length,
    });
  }

  const citasHoy = citas.filter((c) => {
    const d = new Date(c.cuando);
    return d >= inicioDia && d < new Date(inicioDia.getTime() + 86_400_000);
  }).length;

  return {
    conversacionesHoy: hoy.length,
    resueltasSinVos: hoy.filter((c) => c.estado === "agente").length,
    citasHoy,
    esperando: convs.filter((c) => c.estado === "espera").length,
    correccionesPendientes: correcciones.length,
    porHora,
  };
}

/* -------------------------------------------------------------------------
   Formato — vive acá para que todas las pantallas escriban la hora igual.
   ------------------------------------------------------------------------- */

/* Reexportadas desde `agente-formato.ts` (sin imports de servidor) para no
   romper a quien ya hacía `import { hora } from "@/lib/panel/agente"". */
export { hora, relativa, fechaCorta, VERTICALES_WHATSAPP, type PerfilWhatsapp } from "./agente-formato";
