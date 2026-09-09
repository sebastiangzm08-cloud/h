/* ==========================================================================
   LA COSTURA CON SUPABASE.

   Todo el panel pide sus datos por acá y por ningún otro lado. Estas
   funciones consultan Supabase de verdad; si el cliente todavía no tiene
   datos (recién dado de alta, n8n aún no escribió nada), devuelven vacío y
   cada pantalla muestra su estado correspondiente.

   Regla: si una pantalla necesita un dato, se agrega una función acá.
   Nunca se consulta la base desde un componente.

   EXCEPCIÓN — el catálogo de productos (`CATALOGO`) vive en este archivo,
   no en la base. Es configuración del producto, no datos de un cliente. La
   tabla `catalogo_automatizaciones` solo guarda el `id`/`slug` para que las
   asignaciones tengan a qué apuntar; el nombre, la descripción y el plan
   salen de acá, emparejados por slug.
   ========================================================================== */
import { cache } from "react";
import { supabaseServidor } from "@/lib/supabase/servidor";
import type {
  Actividad,
  Asignacion,
  Automatizacion,
  Cliente,
  Cobro,
  Conexion,
  Consulta,
  EstadoCliente,
  EstadoConsulta,
  Facturacion,
  HiloConsulta,
  Medidor,
  Pendiente,
  Perfil,
  PerfilNegocio,
  Pieza,
  PuntoUso,
  ResultadoActividad,
} from "./tipos";
import { PERFIL_NEGOCIO_VACIO } from "./tipos";

/* Espejo de las líneas crudas de `mensajes_lineas` que trae PostgREST. */
type LineaRaw = { autor?: string; creado_en?: string };

/** De un montón de líneas, quién escribió la más reciente. */
export function ultimoAutor(
  lineas: LineaRaw[] | null | undefined
): "cliente" | "hoshizora" | null {
  if (!lineas || lineas.length === 0) return null;
  const orden = [...lineas].sort(
    (a, b) => (a.creado_en ?? "").localeCompare(b.creado_en ?? "")
  );
  const a = orden[orden.length - 1]?.autor;
  return a === "hoshizora" ? "hoshizora" : "cliente";
}

function estadoConsulta(v: string): EstadoConsulta {
  return (["sin_responder", "respondida", "resuelta"].includes(v)
    ? v
    : "sin_responder") as EstadoConsulta;
}

/** Ya no hay datos de ejemplo: todo sale de Supabase. */
export const MODO_EJEMPLO = false;

const MESES = ["ene","feb","mar","abr","may","jun","jul","ago","set","oct","nov","dic"];

/** "jun 2026" a partir de un ISO. */
function mesAnio(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso)
    .toLocaleDateString("es-CR", { month: "short", year: "numeric" })
    .replace(".", "");
}

/** "8 set 2026" — día exacto, para cobros y altas. */
function fechaCorta(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso)
    .toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" })
    .replace(".", "");
}

/** "Setiembre 2026" con inicial en mayúscula, para el nombre de un periodo. */
function periodoLargo(d: Date): string {
  const s = d.toLocaleDateString("es-CR", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Hora corta tica: "5:00 p. m." → "5:00 p.m." */
function horaCorta(d: Date): string {
  return d
    .toLocaleTimeString("es-CR", { hour: "numeric", minute: "2-digit" })
    .replace(/\s*p\.?\s*m\.?/i, " p.m.")
    .replace(/\s*a\.?\s*m\.?/i, " a.m.")
    .trim();
}

/** "recién", "hace 12 min", "hoy 9:14 a.m.", "ayer 6:40 p.m.", "3 set". */
function relativa(iso: string): string {
  const d = new Date(iso);
  const ahora = new Date();
  const seg = (ahora.getTime() - d.getTime()) / 1000;
  if (seg < 60) return "recién";
  if (seg < 3600) return `hace ${Math.floor(seg / 60)} min`;

  const mismoDia = d.toDateString() === ahora.toDateString();
  if (mismoDia) return `hoy ${horaCorta(d)}`;

  const ayer = new Date(ahora);
  ayer.setDate(ayer.getDate() - 1);
  if (d.toDateString() === ayer.toDateString()) return `ayer ${horaCorta(d)}`;

  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

/** `escalarSiNoEntiende` → "Escalar si no entiende". Para claves de config/límite. */
function humaniza(clave: string): string {
  const t = clave
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .toLowerCase()
    .trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/* -------------------------------------------------------------------------
   Catálogo maestro — tu producto (vive en código, ver cabecera del archivo)

   TRES, no nueve. El agente de WhatsApp es todo en uno: atiende, vende y
   agenda. Reportes, facturas, cobros, pedidos y personal quedaron fuera.
   ------------------------------------------------------------------------- */
const CATALOGO: Automatizacion[] = [
  {
    id: "aut-redes",
    slug: "redes-sociales",
    nombre: "Redes sociales",
    proceso: "ventas",
    planMinimo: "basico",
    nivel: "N2",
    carga: "moderada",
    precioMensual: 50000,
    descripcion:
      "Subís fotos, la IA escribe un texto distinto para cada red y publica en tus turnos.",
    // 10 al día, 300 al mes, y hasta 30 fotos mejoradas con kie.ai al mes.
    limitesSugeridos: {
      publicacionesDia: 10,
      publicacionesMes: 300,
      fotosMejoradasMes: 30,
    },
    conexionesRequeridas: ["instagram", "facebook"],
    estado: "publicada",
    plazo: null,
  },
  {
    id: "aut-whatsapp",
    slug: "agente-whatsapp",
    nombre: "Agente de WhatsApp",
    proceso: "atencion",
    planMinimo: "growth",
    nivel: "N3",
    carga: "continua",
    precioMensual: 125000,
    descripcion:
      "Atiende, vende y agenda. Contesta lo repetido, cierra ventas y llena tu agenda, y pasa a una persona cuando de verdad hace falta.",
    limitesSugeridos: { mensajesMes: 2000 },
    conexionesRequeridas: ["whatsapp"],
    estado: "a_pedido",
    plazo: "5 a 7 días",
  },
  {
    id: "aut-prospeccion",
    slug: "prospeccion-clientes",
    nombre: "Prospección e inteligencia de mercado",
    proceso: "ventas",
    planMinimo: "scale",
    nivel: "N4",
    carga: "continua",
    // Sin precio fijo: depende del tamaño del mercado y de cuánto se rastrea.
    precioMensual: null,
    descripcion:
      "Una araña que trabaja tu mercado por vos: busca posibles clientes en tu zona, estudia a tu competencia directa —qué publican, qué ofrecen, por qué les funciona— y te lo entrega en informes para decidir con datos, no a ciegas.",
    limitesSugeridos: {},
    conexionesRequeridas: [],
    estado: "a_pedido",
    plazo: "1 a 2 semanas",
  },
];

function autPorSlug(slug: string | null | undefined): Automatizacion | undefined {
  return CATALOGO.find((a) => a.slug === slug);
}

/* -------------------------------------------------------------------------
   Identidad
   ------------------------------------------------------------------------- */

/**
 * Quién está mirando. Sale del perfil del usuario de la sesión.
 *
 * `(panel)/layout.tsx` redirige a /acceso si esto devuelve "sin-sesion",
 * así que dentro de una pantalla del panel siempre hay usuario.
 */
/* `cache()` dedupe: el layout del panel, el layout de admin y varias
   pantallas piden el perfil en el mismo render. Sin esto se llama a
   `getUser()` (una petición de red a Supabase) 3-4 veces por página. */
const SIN_SESION: Perfil = {
  id: "sin-sesion",
  rol: "cliente",
  nombre: "Invitado",
  clienteId: null,
};

export const getPerfil = cache(async function getPerfil(): Promise<Perfil> {
  const supabase = await supabaseServidor();

  /* En Netlify, `getUser()` y la consulta de perfil fallan de vez en cuando
     por un blip de red o el cold start de la función. Sin reintento, un
     admin puede aparecer como "cliente" un instante y rebotar al cambiar de
     vista. Dos intentos con una pausa corta lo cubren. */
  for (let intento = 0; intento < 2; intento++) {
    const { data: sesion, error: eUser } = await supabase.auth.getUser();
    const usuario = sesion?.user;

    if (!usuario?.id) {
      if (eUser && intento === 0) {
        await new Promise((r) => setTimeout(r, 250));
        continue;
      }
      return SIN_SESION;
    }

    const { data, error } = await supabase
      .from("perfiles")
      .select("id, rol, nombre, cliente_id")
      .eq("id", usuario.id)
      .maybeSingle();

    if (error && intento === 0) {
      await new Promise((r) => setTimeout(r, 250));
      continue;
    }

    if (!data) {
      return {
        id: usuario.id,
        rol: "cliente",
        nombre: usuario.email ?? "Cliente",
        clienteId: null,
      };
    }

    return {
      id: data.id,
      rol: data.rol === "admin" ? "admin" : "cliente",
      nombre: data.nombre ?? "Cliente",
      clienteId: data.cliente_id,
    };
  }

  return SIN_SESION;
});

/**
 * La ficha del negocio del cliente de la sesión. Un admin no cuelga de
 * ningún cliente: devuelve una ficha vacía (el panel admin no la usa).
 */
export async function getCliente(): Promise<Cliente> {
  const perfil = await getPerfil();

  const base: Cliente = {
    id: perfil.clienteId ?? "",
    nombreNegocio: perfil.rol === "admin" ? "Hoshizora Studio" : "Tu negocio",
    rubro: "",
    personaContacto: perfil.nombre,
    correo: "",
    whatsapp: "",
    plan: "—",
    estado: "prueba",
    clienteDesde: "—",
    mensualidad: 0,
    proximoCobro: "—",
    onboardingCompleto: true,
  };

  if (!perfil.clienteId) return base;

  const supabase = await supabaseServidor();
  const { data, error } = await supabase
    .from("clientes")
    .select(
      "id, nombre_negocio, rubro, persona_contacto, correo, whatsapp, plan, estado, creado_en, onboarding_completo"
    )
    .eq("id", perfil.clienteId)
    .single();

  if (error || !data) return base;

  return {
    id: data.id,
    nombreNegocio: data.nombre_negocio,
    rubro: data.rubro ?? "",
    personaContacto: data.persona_contacto ?? perfil.nombre,
    correo: data.correo,
    whatsapp: data.whatsapp ?? "",
    plan: data.plan,
    estado: (data.estado as EstadoCliente) ?? "prueba",
    clienteDesde: mesAnio(data.creado_en),
    // La plata vive en Facturación (getFacturacion): esta ficha no la trae
    // para no hacer dos consultas de cobros en cada página del panel.
    mensualidad: 0,
    proximoCobro: "—",
    onboardingCompleto: Boolean(data.onboarding_completo),
  };
}

/**
 * Las respuestas del formulario "¿cómo está tu negocio?". Alimentan el
 * prompt de Gemini que escribe los textos de cada publicación.
 */
export async function getPerfilNegocio(): Promise<PerfilNegocio> {
  const perfil = await getPerfil();
  if (!perfil.clienteId) return { ...PERFIL_NEGOCIO_VACIO };

  const supabase = await supabaseServidor();
  const { data, error } = await supabase
    .from("clientes")
    .select("perfil_negocio")
    .eq("id", perfil.clienteId)
    .single();

  if (error || !data?.perfil_negocio) return { ...PERFIL_NEGOCIO_VACIO };

  const p = data.perfil_negocio as Partial<PerfilNegocio>;
  return {
    ...PERFIL_NEGOCIO_VACIO,
    ...p,
    trato: p.trato === "usted" ? "usted" : "vos",
  };
}

/** El correo de la sesión (de la cuenta de acceso, no de la ficha del negocio). */
export async function getCorreoSesion(): Promise<string> {
  const supabase = await supabaseServidor();
  const { data } = await supabase.auth.getUser();
  return data?.user?.email ?? "";
}

/* -------------------------------------------------------------------------
   Asignaciones — lo que el cliente tiene contratado (tabla `asignaciones`)
   ------------------------------------------------------------------------- */

function resumenAsignacion(
  estado: "activa" | "pausada",
  config: Record<string, unknown>
): string {
  if (estado === "pausada") return "En pausa";
  if (Object.keys(config).length === 0) return "Activa · falta configurarla";
  return "Activa";
}

export async function getAsignaciones(): Promise<Asignacion[]> {
  const perfil = await getPerfil();
  if (!perfil.clienteId) return [];

  const supabase = await supabaseServidor();
  const { data, error } = await supabase
    .from("asignaciones")
    .select(
      "id, estado, precio_mensual, limites, config, creada_en, catalogo_automatizaciones(slug)"
    )
    .eq("cliente_id", perfil.clienteId)
    .order("creada_en", { ascending: true });

  if (error || !data) return [];

  const out: Asignacion[] = [];
  for (const row of data) {
    const cat = row.catalogo_automatizaciones as { slug?: string } | null;
    const aut = autPorSlug(cat?.slug);
    if (!aut) continue; // slug que no existe en el catálogo de código: se ignora

    const estado = row.estado === "pausada" ? "pausada" : "activa";
    const config = (row.config ?? {}) as Record<string, unknown>;

    out.push({
      id: row.id,
      automatizacion: aut,
      estado,
      precioMensual: row.precio_mensual ?? 0,
      limites: (row.limites ?? {}) as Record<string, number>,
      config,
      resumen: resumenAsignacion(estado, config),
    });
  }
  return out;
}

/** Una automatización CONTRATADA por su slug, o `null`. */
export async function getAsignacion(slug: string): Promise<Asignacion | null> {
  const todas = await getAsignaciones();
  return todas.find((a) => a.automatizacion.slug === slug) ?? null;
}

/** Una entrada del catálogo de código por slug, contratada o no. */
export async function getAutomatizacion(
  slug: string
): Promise<Automatizacion | null> {
  return autPorSlug(slug) ?? null;
}

/** El catálogo que el cliente puede sumar: publicadas y a pedido que aún no tiene. */
export async function getCatalogoDisponible(): Promise<Automatizacion[]> {
  const asignados = new Set(
    (await getAsignaciones()).map((a) => a.automatizacion.slug)
  );
  return CATALOGO.filter(
    (a) => a.estado !== "borrador" && !asignados.has(a.slug)
  );
}

/**
 * El catálogo maestro tal cual, sin cruzar con ningún cliente. Lo usa el
 * panel admin (Catálogo maestro, Asignar), donde SÍ se muestra el nivel.
 */
export async function getCatalogoBase(): Promise<Automatizacion[]> {
  return CATALOGO.filter((a) => a.estado !== "borrador");
}

/** El catálogo que el cliente ve, con la marca de si ya lo tiene. */
export async function getCatalogo(): Promise<
  { automatizacion: Automatizacion; contratada: boolean }[]
> {
  const asignados = new Set(
    (await getAsignaciones()).map((a) => a.automatizacion.slug)
  );
  return CATALOGO.filter((a) => a.estado !== "borrador").map((a) => ({
    automatizacion: a,
    contratada: asignados.has(a.slug),
  }));
}

/* -------------------------------------------------------------------------
   Actividad y uso — todo sale de la tabla `actividad`

   Es la bitácora que escriben los workflows. La gráfica, los chips y los
   medidores son distintas lecturas de la misma tabla.
   ------------------------------------------------------------------------- */

type FilaActividad = {
  id: string;
  creada_en: string;
  descripcion: string;
  resultado: string;
  asignacion_id: string | null;
};

/** Trae la actividad cruda del cliente desde una fecha. Base de varias vistas. */
async function actividadDesde(desde: Date): Promise<FilaActividad[]> {
  const perfil = await getPerfil();
  if (!perfil.clienteId) return [];

  const supabase = await supabaseServidor();
  const { data, error } = await supabase
    .from("actividad")
    .select("id, creada_en, descripcion, resultado, asignacion_id")
    .eq("cliente_id", perfil.clienteId)
    .gte("creada_en", desde.toISOString())
    .order("creada_en", { ascending: false });

  if (error || !data) return [];
  return data as FilaActividad[];
}

/**
 * Acciones automatizadas por día, últimos 14 días. Sin argumento suma TODAS
 * las automatizaciones (la gráfica del Inicio); con `asignacionId` cuenta
 * solo esa (la pestaña Uso del detalle). Los días sin nada van en cero.
 */
export async function getUsoDiario(asignacionId?: string): Promise<PuntoUso[]> {
  const hoy = new Date();
  const inicio = new Date(hoy);
  inicio.setHours(0, 0, 0, 0);
  inicio.setDate(inicio.getDate() - 13);

  const filas = await actividadDesde(inicio);
  const relevantes = asignacionId
    ? filas.filter((f) => f.asignacion_id === asignacionId)
    : filas;

  const conteo = new Map<string, number>();
  for (const f of relevantes) {
    const dia = f.creada_en.slice(0, 10);
    conteo.set(dia, (conteo.get(dia) ?? 0) + 1);
  }

  const puntos: PuntoUso[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(inicio);
    d.setDate(d.getDate() + i);
    const clave = d.toISOString().slice(0, 10);
    puntos.push({ fecha: clave, valor: conteo.get(clave) ?? 0 });
  }
  return puntos;
}

/** Desglose de hoy por automatización, para los chips bajo la gráfica. */
export async function getUsoHoyPorAutomatizacion(): Promise<
  { nombre: string; valor: number }[]
> {
  const [asignaciones, filas] = await Promise.all([
    getAsignaciones(),
    (async () => {
      const inicio = new Date();
      inicio.setHours(0, 0, 0, 0);
      return actividadDesde(inicio);
    })(),
  ]);

  const nombrePorAsignacion = new Map(
    asignaciones.map((a) => [a.id, a.automatizacion.nombre])
  );

  const conteo = new Map<string, number>();
  for (const f of filas) {
    const nombre = f.asignacion_id
      ? nombrePorAsignacion.get(f.asignacion_id) ?? "Otras"
      : "Sistema";
    conteo.set(nombre, (conteo.get(nombre) ?? 0) + 1);
  }

  return [...conteo.entries()]
    .map(([nombre, valor]) => ({ nombre, valor }))
    .sort((a, b) => b.valor - a.valor);
}

/**
 * Un medidor por cada límite de cada automatización contratada. El tope sale
 * de `asignaciones.limites`; el consumo, de contar `actividad` en la ventana
 * que corresponde (los que terminan en "Dia" cuentan hoy, el resto el mes).
 */
export async function getMedidores(): Promise<Medidor[]> {
  const asignaciones = await getAsignaciones();
  const conLimites = asignaciones.filter(
    (a) => Object.keys(a.limites).length > 0
  );
  if (conLimites.length === 0) return [];

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const inicioDia = new Date();
  inicioDia.setHours(0, 0, 0, 0);

  const filasMes = await actividadDesde(inicioMes);

  const cuenta = (asignacionId: string, soloHoy: boolean) =>
    filasMes.filter(
      (f) =>
        f.asignacion_id === asignacionId &&
        (!soloHoy || new Date(f.creada_en) >= inicioDia)
    ).length;

  const medidores: Medidor[] = [];
  for (const a of asignaciones) {
    for (const [clave, tope] of Object.entries(a.limites)) {
      const porDia = /d[ií]a$/i.test(clave);
      medidores.push({
        etiqueta: `${a.automatizacion.nombre} · ${humaniza(clave)}`,
        usado: cuenta(a.id, porDia),
        tope,
        formato: tope >= 1000 ? "miles" : "entero",
      });
    }
  }
  return medidores.slice(0, 6);
}

/**
 * Uso de UNA automatización, para su pestaña "Resumen": cuántas piezas hay
 * en fila ahora mismo y, por cada límite, cuánto se lleva usado del tope.
 * Publicaciones se cuentan de `actividad` (día o mes según la clave); las
 * fotos mejoradas, de `cola` (piezas con pedido de retoque este mes).
 */
export async function getUsoAutomatizacion(
  asignacionId: string,
  limites: Record<string, number>
): Promise<{
  enFila: number;
  medidores: { clave: string; etiqueta: string; usado: number; tope: number }[];
}> {
  const perfil = await getPerfil();
  if (!perfil.clienteId || !asignacionId) {
    return { enFila: 0, medidores: [] };
  }

  const supabase = await supabaseServidor();
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const inicioDia = new Date();
  inicioDia.setHours(0, 0, 0, 0);

  const RETOQUE = "instruccion.ilike.*mejor*,instruccion.ilike.*fondo*,instruccion.ilike.*retoc*";

  const [enFila, actMes, actHoy, mejorasMes] = await Promise.all([
    supabase
      .from("cola")
      .select("id", { count: "exact", head: true })
      .eq("asignacion_id", asignacionId)
      .in("estado", ["pendiente", "en_retoque", "programada"]),
    supabase
      .from("actividad")
      .select("id", { count: "exact", head: true })
      .eq("asignacion_id", asignacionId)
      .gte("creada_en", inicioMes.toISOString()),
    supabase
      .from("actividad")
      .select("id", { count: "exact", head: true })
      .eq("asignacion_id", asignacionId)
      .gte("creada_en", inicioDia.toISOString()),
    supabase
      .from("cola")
      .select("id", { count: "exact", head: true })
      .eq("asignacion_id", asignacionId)
      .neq("estado", "cancelada")
      .gte("creada_en", inicioMes.toISOString())
      .or(RETOQUE),
  ]);

  const medidores = Object.entries(limites).map(([clave, tope]) => {
    let usado: number;
    if (/mejorad/i.test(clave)) usado = mejorasMes.count ?? 0;
    else if (/d[ií]a$/i.test(clave)) usado = actHoy.count ?? 0;
    else usado = actMes.count ?? 0;
    return { clave, etiqueta: humaniza(clave), usado, tope };
  });

  return { enFila: enFila.count ?? 0, medidores };
}

/** La bitácora para la pantalla de Actividad y el bloque del Inicio. */
export async function getActividad(limite = 5): Promise<Actividad[]> {
  const perfil = await getPerfil();
  if (!perfil.clienteId) return [];

  const [asignaciones, supabase] = await Promise.all([
    getAsignaciones(),
    supabaseServidor(),
  ]);
  const nombrePorAsignacion = new Map(
    asignaciones.map((a) => [a.id, a.automatizacion.nombre])
  );

  const { data, error } = await supabase
    .from("actividad")
    .select("id, creada_en, descripcion, resultado, asignacion_id")
    .eq("cliente_id", perfil.clienteId)
    .order("creada_en", { ascending: false })
    .limit(limite);

  if (error || !data) return [];

  return (data as FilaActividad[]).map((f) => ({
    id: f.id,
    cuando: relativa(f.creada_en),
    automatizacion: f.asignacion_id
      ? nombrePorAsignacion.get(f.asignacion_id) ?? "Sistema"
      : "Sistema",
    descripcion: f.descripcion,
    resultado: (["ok", "atencion", "error", "aviso"].includes(f.resultado)
      ? f.resultado
      : "ok") as ResultadoActividad,
  }));
}

/* -------------------------------------------------------------------------
   Pendientes — lo que espera algo del cliente

   Se arma de tres fuentes: piezas en la cola sin fecha, cobros sin pagar, y
   actividad marcada como que necesita atención.
   ------------------------------------------------------------------------- */
export async function getPendientes(): Promise<Pendiente[]> {
  const perfil = await getPerfil();
  if (!perfil.clienteId) return [];

  const supabase = await supabaseServidor();
  const [cola, cobros, atencion, asignaciones] = await Promise.all([
    supabase
      .from("cola")
      .select("id, asignacion_id")
      .eq("cliente_id", perfil.clienteId)
      .eq("estado", "pendiente")
      .is("programada_para", null),
    supabase
      .from("cobros")
      .select("id, periodo, monto, estado")
      .eq("cliente_id", perfil.clienteId)
      .in("estado", ["pendiente", "vencido"])
      .order("creado_en", { ascending: false }),
    supabase
      .from("actividad")
      .select("id, descripcion, asignacion_id, creada_en")
      .eq("cliente_id", perfil.clienteId)
      .eq("resultado", "atencion")
      .order("creada_en", { ascending: false })
      .limit(10),
    getAsignaciones(),
  ]);

  const slugPorAsignacion = new Map(
    asignaciones.map((a) => [a.id, a.automatizacion.slug])
  );
  const hrefAut = (asignacionId: string | null) => {
    const slug = asignacionId ? slugPorAsignacion.get(asignacionId) : null;
    return slug ? `/panel/automatizaciones/${slug}` : "/panel/actividad";
  };

  const pendientes: Pendiente[] = [];

  const sinFecha = cola.data ?? [];
  if (sinFecha.length > 0) {
    pendientes.push({
      id: "cola-sin-fecha",
      titulo: `${sinFecha.length} ${sinFecha.length === 1 ? "pieza" : "piezas"} en fila sin fecha`,
      detalle: "Salen en el próximo turno si no elegís día",
      gravedad: "atencion",
      accion: { texto: "Abrir", href: hrefAut(sinFecha[0].asignacion_id) },
    });
  }

  for (const c of cobros.data ?? []) {
    pendientes.push({
      id: `cobro-${c.id}`,
      titulo:
        c.estado === "vencido"
          ? `Cobro vencido de ${c.periodo}`
          : `Cobro pendiente de ${c.periodo}`,
      detalle: `₡${Number(c.monto).toLocaleString("es-CR")}`,
      gravedad: c.estado === "vencido" ? "urgente" : "atencion",
      accion: { texto: "Ver", href: "/panel/facturacion" },
    });
  }

  const necesitan = atencion.data ?? [];
  if (necesitan.length > 0) {
    pendientes.push({
      id: "actividad-atencion",
      titulo: `${necesitan.length} ${necesitan.length === 1 ? "cosa necesita" : "cosas necesitan"} tu atención`,
      detalle: necesitan[0].descripcion,
      gravedad: "urgente",
      accion: { texto: "Ver", href: hrefAut(necesitan[0].asignacion_id) },
    });
  }

  const orden = { urgente: 0, atencion: 1, info: 2 } as const;
  return pendientes.sort((a, b) => orden[a.gravedad] - orden[b.gravedad]);
}

/* -------------------------------------------------------------------------
   Contadores para las pastillas de la barra lateral y la campana. Consultas
   `head:true` (solo cuentan, no traen filas). El `clienteId` lo pasa el
   layout, que ya lo tiene: así no se vuelve a pedir el perfil.
   ------------------------------------------------------------------------- */
export async function getContadoresCliente(
  clienteId: string | null
): Promise<{ pendientes: number; automatizaciones: number }> {
  if (!clienteId) return { pendientes: 0, automatizaciones: 0 };

  const supabase = await supabaseServidor();
  const [cola, cobros, atencion, asigs] = await Promise.all([
    supabase
      .from("cola")
      .select("id", { count: "exact", head: true })
      .eq("cliente_id", clienteId)
      .eq("estado", "pendiente")
      .is("programada_para", null),
    supabase
      .from("cobros")
      .select("id", { count: "exact", head: true })
      .eq("cliente_id", clienteId)
      .in("estado", ["pendiente", "vencido"]),
    supabase
      .from("actividad")
      .select("id", { count: "exact", head: true })
      .eq("cliente_id", clienteId)
      .eq("resultado", "atencion"),
    supabase
      .from("asignaciones")
      .select("id", { count: "exact", head: true })
      .eq("cliente_id", clienteId)
      .eq("estado", "activa"),
  ]);

  return {
    pendientes: (cola.count ?? 0) + (cobros.count ?? 0) + (atencion.count ?? 0),
    automatizaciones: asigs.count ?? 0,
  };
}

/* -------------------------------------------------------------------------
   Buffer — no se puede conectar por OAuth (Buffer cerró eso para apps de
   terceros). El cliente se registra y conecta sus redes en Buffer, y nos
   pasa el enlace/ID de su cuenta; nosotros terminamos el enganche con n8n.
   ------------------------------------------------------------------------- */
export type EstadoBuffer = "sin_enviar" | "en_revision" | "listo";

export async function getConexionBuffer(): Promise<{
  estado: EstadoBuffer;
  referencia: string | null;
}> {
  const perfil = await getPerfil();
  if (!perfil.clienteId) return { estado: "sin_enviar", referencia: null };

  const supabase = await supabaseServidor();
  const { data } = await supabase
    .from("conexiones")
    .select("estado, referencia_externa")
    .eq("cliente_id", perfil.clienteId)
    .eq("servicio", "buffer")
    .maybeSingle();

  if (!data) return { estado: "sin_enviar", referencia: null };
  return {
    estado: data.estado === "conectada" ? "listo" : "sin_enviar",
    referencia: data.referencia_externa ?? null,
  };
}

/* -------------------------------------------------------------------------
   Primeros pasos — checklist de arranque para un cliente nuevo. Se muestra
   en Inicio hasta que estén los tres (o los que apliquen a su plan).
   ------------------------------------------------------------------------- */
export type PasoOnboarding = {
  clave: string;
  titulo: string;
  detalle: string;
  href: string;
  hecho: boolean;
};

export async function getPrimerosPasos(): Promise<{
  pasos: PasoOnboarding[];
  completo: boolean;
} | null> {
  const perfil = await getPerfil();
  if (perfil.rol !== "cliente" || !perfil.clienteId) return null;

  const clienteId = perfil.clienteId;
  const supabase = await supabaseServidor();
  const [cli, asigs, buffer, cola] = await Promise.all([
    supabase
      .from("clientes")
      .select("onboarding_completo")
      .eq("id", clienteId)
      .maybeSingle(),
    supabase
      .from("asignaciones")
      .select("estado, catalogo_automatizaciones(slug)")
      .eq("cliente_id", clienteId)
      .eq("estado", "activa"),
    getConexionBuffer(),
    supabase
      .from("cola")
      .select("id", { count: "exact", head: true })
      .eq("cliente_id", clienteId),
  ]);

  const tieneRedes = (asigs.data ?? []).some((a) => {
    const cat = a.catalogo_automatizaciones as { slug?: string } | null;
    return cat?.slug === "redes-sociales";
  });

  const pasos: PasoOnboarding[] = [
    {
      clave: "perfil",
      titulo: "Completá el perfil de tu negocio",
      detalle: "Qué vendés, a quién y con qué tono. La IA lo usa para escribir.",
      href: "/panel/perfil",
      hecho: Boolean(cli.data?.onboarding_completo),
    },
  ];

  if (tieneRedes) {
    pasos.push({
      clave: "buffer",
      titulo: "Conectá tu cuenta de Buffer",
      detalle: "Por ahí salen tus publicaciones. Es gratis y toma un minuto.",
      href: "/panel/conexiones",
      hecho: buffer.estado === "listo",
    });
    pasos.push({
      clave: "contenido",
      titulo: "Subí tu primer contenido",
      detalle: "Un par de fotos para que la automatización arranque.",
      href: "/panel/automatizaciones/redes-sociales",
      hecho: (cola.count ?? 0) > 0,
    });
  }

  return { pasos, completo: pasos.every((p) => p.hecho) };
}

/* -------------------------------------------------------------------------
   Conexiones — cruce de lo que EXIGE el catálogo con la tabla `conexiones`
   ------------------------------------------------------------------------- */
const NOMBRE_SERVICIO: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
  google: "Google",
};

export async function getConexiones(): Promise<Conexion[]> {
  const perfil = await getPerfil();
  const asignaciones = await getAsignaciones();

  // Qué servicios hacen falta, y para qué automatización (el primero que lo pida).
  const requeridas = new Map<string, string>();
  for (const a of asignaciones) {
    for (const s of a.automatizacion.conexionesRequeridas) {
      if (!requeridas.has(s)) requeridas.set(s, a.automatizacion.nombre);
    }
  }
  if (requeridas.size === 0) return [];

  // Lo que ya está conectado en la base.
  const conectadas = new Map<
    string,
    { estado: string; referencia: string | null; venceEn: string | null }
  >();
  if (perfil.clienteId) {
    const supabase = await supabaseServidor();
    const { data } = await supabase
      .from("conexiones")
      .select("servicio, estado, referencia_externa, vence_en")
      .eq("cliente_id", perfil.clienteId);
    for (const row of data ?? []) {
      conectadas.set(row.servicio, {
        estado: row.estado,
        referencia: row.referencia_externa,
        venceEn: row.vence_en ? mesAnio(row.vence_en) : null,
      });
    }
  }

  return [...requeridas.entries()].map(([servicio, paraQue]) => {
    const c = conectadas.get(servicio);
    return {
      servicio,
      nombre: NOMBRE_SERVICIO[servicio] ?? servicio,
      estado: (c?.estado as Conexion["estado"]) ?? "sin_conectar",
      paraQue,
      referencia: c?.referencia ?? null,
      venceEn: c?.venceEn ?? null,
    };
  });
}

/* -------------------------------------------------------------------------
   Piezas de contenido — la fila `cola` del cliente, para la galería del
   apartado de Redes. n8n va moviendo el `estado` a medida que trabaja.
   ------------------------------------------------------------------------- */
export async function getPiezas(limite = 60): Promise<Pieza[]> {
  const perfil = await getPerfil();
  if (!perfil.clienteId) return [];

  const supabase = await supabaseServidor();
  const traer = (cols: string) =>
    supabase
      .from("cola")
      .select(cols)
      .eq("cliente_id", perfil.clienteId)
      .order("creada_en", { ascending: false })
      .limit(limite);

  // Con las columnas de carrusel; antes de esa migración, sin ellas.
  let res = await traer(
    "id, tipo, url_imagekit, imagenes, es_carrusel, instruccion, redes, estado, programada_para, creada_en"
  );
  if (res.error) {
    res = await traer(
      "id, tipo, url_imagekit, instruccion, redes, estado, programada_para, creada_en"
    );
  }
  if (res.error || !res.data) return [];

  type FilaCola = {
    id: string;
    tipo: string;
    url_imagekit: string;
    imagenes?: unknown[];
    es_carrusel?: boolean;
    instruccion?: string | null;
    redes?: string[] | null;
    estado: string;
    programada_para: string | null;
    creada_en: string;
  };

  return (res.data as unknown as FilaCola[]).map((p) => ({
    id: p.id,
    tipo: p.tipo === "video" ? "video" : "imagen",
    url: p.url_imagekit,
    esCarrusel: Boolean(p.es_carrusel),
    cantidadImagenes: Array.isArray(p.imagenes) ? p.imagenes.length : 0,
    instruccion: p.instruccion ?? "",
    redes: (p.redes ?? []) as string[],
    estado: ([
      "pendiente",
      "en_retoque",
      "programada",
      "publicada",
      "fallida",
      "cancelada",
    ].includes(p.estado)
      ? p.estado
      : "pendiente") as Pieza["estado"],
    programadaPara: p.programada_para
      ? new Date(p.programada_para).toLocaleDateString("es-CR", {
          day: "numeric",
          month: "short",
        })
      : null,
    cuando: relativa(p.creada_en),
  }));
}

/* -------------------------------------------------------------------------
   Facturación — tabla `cobros` + suma de asignaciones activas
   ------------------------------------------------------------------------- */
export async function getFacturacion(): Promise<Facturacion> {
  const [perfil, cliente, asignaciones] = await Promise.all([
    getPerfil(),
    getCliente(),
    getAsignaciones(),
  ]);

  const mensualidad = asignaciones
    .filter((a) => a.estado === "activa")
    .reduce((s, a) => s + a.precioMensual, 0);

  const vacio: Facturacion = {
    plan: cliente.plan,
    mensualidad,
    proximoCobro: "—",
    metodoPago: "Sin definir",
    cobros: [],
  };

  if (!perfil.clienteId) return vacio;

  const supabase = await supabaseServidor();
  const { data, error } = await supabase
    .from("cobros")
    .select("id, periodo, monto, estado, metodo, pagado_en")
    .eq("cliente_id", perfil.clienteId)
    .order("creado_en", { ascending: false });

  if (error || !data) return vacio;

  const cobros: Cobro[] = data.map((c) => ({
    id: c.id,
    periodo: c.periodo,
    monto: c.monto,
    estado: (["pendiente", "pagado", "vencido"].includes(c.estado)
      ? c.estado
      : "pendiente") as Cobro["estado"],
    metodo: c.metodo ?? null,
    pagadoEn: c.pagado_en ? fechaCorta(c.pagado_en) : null,
  }));

  const pendiente = cobros.find((c) => c.estado !== "pagado");
  const ultimoPago = cobros.find((c) => c.estado === "pagado");

  return {
    plan: cliente.plan,
    mensualidad,
    proximoCobro: pendiente?.periodo ?? periodoLargo(new Date()),
    metodoPago: ultimoPago?.metodo ?? "Sin definir",
    cobros,
  };
}

/* -------------------------------------------------------------------------
   Soporte — consultas del cliente (mensajes + mensajes_lineas)
   ------------------------------------------------------------------------- */
export async function getConsultas(): Promise<Consulta[]> {
  const perfil = await getPerfil();
  if (!perfil.clienteId) return [];

  const supabase = await supabaseServidor();
  const { data, error } = await supabase
    .from("mensajes")
    .select("id, asunto, estado, creado_en, mensajes_lineas(autor, creado_en)")
    .eq("cliente_id", perfil.clienteId)
    .order("creado_en", { ascending: false });

  if (error || !data) return [];

  return data.map((m) => ({
    id: m.id,
    asunto: m.asunto,
    estado: estadoConsulta(m.estado),
    cuando: relativa(m.creado_en),
    ultimaDe: ultimoAutor(m.mensajes_lineas as LineaRaw[]),
  }));
}

export async function getConsulta(id: string): Promise<HiloConsulta | null> {
  const perfil = await getPerfil();
  if (!perfil.clienteId) return null;

  const supabase = await supabaseServidor();
  const { data, error } = await supabase
    .from("mensajes")
    .select(
      "id, asunto, estado, creado_en, mensajes_lineas(id, autor, texto, creado_en)"
    )
    .eq("id", id)
    .eq("cliente_id", perfil.clienteId)
    .maybeSingle();

  if (error || !data) return null;

  const crudas = (data.mensajes_lineas ?? []) as {
    id: string;
    autor: string;
    texto: string;
    creado_en: string;
  }[];

  const lineas = [...crudas]
    .sort((a, b) => a.creado_en.localeCompare(b.creado_en))
    .map((l) => ({
      id: l.id,
      autor: (l.autor === "hoshizora" ? "hoshizora" : "cliente") as
        | "cliente"
        | "hoshizora",
      texto: l.texto ?? "",
      cuando: relativa(l.creado_en),
    }));

  return {
    id: data.id,
    asunto: data.asunto,
    estado: estadoConsulta(data.estado),
    cuando: relativa(data.creado_en),
    ultimaDe: ultimoAutor(crudas),
    lineas,
  };
}
