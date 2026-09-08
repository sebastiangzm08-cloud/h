/* ==========================================================================
   LA COSTURA DEL PANEL ADMIN.

   Igual que datos.ts, pero para las pantallas que solo ve Sebastian. Las
   lecturas usan el cliente normal de servidor: las reglas RLS ya le dan al
   admin acceso a todo (`clientes_admin`, `perfiles_admin`, …). El
   `service_role` se reserva para lo que ni el admin puede hacer con RLS:
   crear cuentas de acceso (ver admin-acciones.ts).

   Lo que todavía no tiene datos reales (ejecuciones, mensajes) devuelve
   ejemplos y se migra cuando n8n empiece a escribir.
   ========================================================================== */
import { supabaseServidor } from "@/lib/supabase/servidor";
import { getPerfil, ultimoAutor } from "./datos";
import type { Consulta, EstadoConsulta, HiloConsulta } from "./tipos";

/** Dónde está un cliente en su puesta en marcha. */
export type Onboarding = {
  perfil: boolean;
  buffer: boolean;
  contenido: boolean;
  /** true si no aplica Buffer/contenido (no tiene redes) o si están los 3. */
  completo: boolean;
  hechos: number;
  total: number;
};

export type ClienteAdmin = {
  id: string;
  nombreNegocio: string;
  personaContacto: string;
  correo: string;
  whatsapp: string;
  plan: string;
  estado: "activo" | "prueba" | "pausado" | "moroso";
  automatizaciones: number;
  ingresoMensual: number;
  desde: string;
  onboarding: Onboarding;
};

/** Arma el estado de onboarding. `tieneRedes` decide si Buffer/contenido cuentan. */
function armarOnboarding(
  perfil: boolean,
  buffer: boolean,
  contenido: boolean,
  tieneRedes: boolean
): Onboarding {
  const pasos = tieneRedes ? [perfil, buffer, contenido] : [perfil];
  const hechos = pasos.filter(Boolean).length;
  return {
    perfil,
    buffer,
    contenido,
    hechos,
    total: pasos.length,
    completo: hechos === pasos.length,
  };
}

export type ResumenAdmin = {
  clientesActivos: number;
  clientesPrueba: number;
  ingresoMensual: number;
  accionesHoy: number;
  erroresHoy: number;
  enCola: number;
};

export type EjecucionAdmin = {
  id: string;
  cuando: string;
  cliente: string;
  accion: string;
  duracionMs: number | null;
  estado: "ok" | "error";
  log: string | null;
};

const MESES = ["ene","feb","mar","abr","may","jun","jul","ago","set","oct","nov","dic"];
function mesAnio(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${MESES[d.getMonth()]} ${d.getFullYear()}`;
}
/** "8 set 2026" — con día, para saber la fecha exacta de alta o de pago. */
function fechaCorta(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

/** Solo por si alguien llega a una pantalla admin sin ser admin: lista vacía. */
async function soyAdmin(): Promise<boolean> {
  return (await getPerfil()).rol === "admin";
}

/* -------------------------------------------------------------------------
   Clientes — lectura real
   ------------------------------------------------------------------------- */
export async function getClientesAdmin(): Promise<ClienteAdmin[]> {
  if (!(await soyAdmin())) return [];

  const supabase = await supabaseServidor();
  const { data, error } = await supabase
    .from("clientes")
    .select(
      "id, nombre_negocio, persona_contacto, correo, whatsapp, plan, estado, creado_en, onboarding_completo, asignaciones(precio_mensual, estado, catalogo_automatizaciones(slug))"
    )
    .order("creado_en", { ascending: false });

  if (error || !data) return [];

  const ids = data.map((c) => c.id);
  const [conex, cola] = await Promise.all([
    ids.length
      ? supabase
          .from("conexiones")
          .select("cliente_id")
          .in("cliente_id", ids)
          .eq("servicio", "buffer")
          .eq("estado", "conectada")
      : Promise.resolve({ data: [] as { cliente_id: string }[] }),
    ids.length
      ? supabase.from("cola").select("cliente_id").in("cliente_id", ids)
      : Promise.resolve({ data: [] as { cliente_id: string }[] }),
  ]);
  const conBuffer = new Set((conex.data ?? []).map((r) => r.cliente_id));
  const conContenido = new Set((cola.data ?? []).map((r) => r.cliente_id));

  return data.map((c) => {
    const asigs = (c.asignaciones ?? []) as {
      precio_mensual: number;
      estado: string;
      catalogo_automatizaciones: { slug?: string } | null;
    }[];
    const activas = asigs.filter((a) => a.estado === "activa");
    const tieneRedes = activas.some(
      (a) => a.catalogo_automatizaciones?.slug === "redes-sociales"
    );
    return {
      id: c.id,
      nombreNegocio: c.nombre_negocio,
      personaContacto: c.persona_contacto ?? "",
      correo: c.correo,
      whatsapp: c.whatsapp ?? "",
      plan: c.plan,
      estado: (c.estado as ClienteAdmin["estado"]) ?? "prueba",
      automatizaciones: activas.length,
      ingresoMensual: activas.reduce((s, a) => s + (a.precio_mensual ?? 0), 0),
      desde: mesAnio(c.creado_en),
      onboarding: armarOnboarding(
        Boolean(c.onboarding_completo),
        conBuffer.has(c.id),
        conContenido.has(c.id),
        tieneRedes
      ),
    };
  });
}

/** Para el selector de "Asignar automatización": id + nombre, nada más. */
export async function getClientesParaSelector(): Promise<
  { id: string; nombre: string }[]
> {
  const clientes = await getClientesAdmin();
  return clientes.map((c) => ({ id: c.id, nombre: c.nombreNegocio }));
}

/* -------------------------------------------------------------------------
   Ficha completa de un cliente — para /panel/admin/clientes/[id]
   ------------------------------------------------------------------------- */
export type FichaCliente = {
  id: string;
  nombreNegocio: string;
  personaContacto: string;
  correo: string;
  whatsapp: string;
  rubro: string;
  plan: string;
  estado: ClienteAdmin["estado"];
  desde: string;
  onboardingCompleto: boolean;
  automatizaciones: {
    id: string;
    nombre: string;
    slug: string;
    estado: "activa" | "pausada";
    precioMensual: number;
  }[];
  cobros: {
    id: string;
    periodo: string;
    monto: number;
    estado: "pendiente" | "pagado" | "vencido";
    creadoEn: string;
  }[];
  conexiones: { servicio: string; estado: string; referencia: string | null }[];
  actividad: { id: string; cuando: string; descripcion: string; resultado: string }[];
  onboarding: Onboarding;
};

export async function getFichaCliente(id: string): Promise<FichaCliente | null> {
  if (!(await soyAdmin())) return null;

  const supabase = await supabaseServidor();
  const [cli, asigs, cobros, conexiones, actividad, cola] = await Promise.all([
    supabase
      .from("clientes")
      .select(
        "id, nombre_negocio, persona_contacto, correo, whatsapp, rubro, plan, estado, creado_en, onboarding_completo"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("asignaciones")
      .select("id, estado, precio_mensual, catalogo_automatizaciones(slug, nombre)")
      .eq("cliente_id", id),
    supabase
      .from("cobros")
      .select("id, periodo, monto, estado, creado_en")
      .eq("cliente_id", id)
      .order("creado_en", { ascending: false }),
    supabase
      .from("conexiones")
      .select("servicio, estado, referencia_externa")
      .eq("cliente_id", id),
    supabase
      .from("actividad")
      .select("id, descripcion, resultado, creada_en")
      .eq("cliente_id", id)
      .order("creada_en", { ascending: false })
      .limit(8),
    supabase
      .from("cola")
      .select("id", { count: "exact", head: true })
      .eq("cliente_id", id),
  ]);

  if (!cli.data) return null;
  const c = cli.data;

  const conex = (conexiones.data ?? []) as {
    servicio: string;
    estado: string;
  }[];
  const asigList = (asigs.data ?? []) as {
    estado: string;
    catalogo_automatizaciones: { slug?: string } | null;
  }[];
  const onboarding = armarOnboarding(
    Boolean(c.onboarding_completo),
    conex.some((x) => x.servicio === "buffer" && x.estado === "conectada"),
    (cola.count ?? 0) > 0,
    asigList.some(
      (a) =>
        a.estado === "activa" &&
        a.catalogo_automatizaciones?.slug === "redes-sociales"
    )
  );

  return {
    id: c.id,
    nombreNegocio: c.nombre_negocio,
    personaContacto: c.persona_contacto ?? "",
    correo: c.correo,
    whatsapp: c.whatsapp ?? "",
    rubro: c.rubro ?? "",
    plan: c.plan,
    estado: (c.estado as ClienteAdmin["estado"]) ?? "prueba",
    desde: fechaCorta(c.creado_en),
    onboardingCompleto: Boolean(c.onboarding_completo),
    automatizaciones: (asigs.data ?? []).map((a) => {
      const cat = a.catalogo_automatizaciones as { slug?: string; nombre?: string } | null;
      return {
        id: a.id,
        nombre: cat?.nombre ?? "—",
        slug: cat?.slug ?? "",
        estado: a.estado === "pausada" ? "pausada" : "activa",
        precioMensual: a.precio_mensual ?? 0,
      };
    }),
    cobros: (cobros.data ?? []).map((x) => ({
      id: x.id,
      periodo: x.periodo,
      monto: x.monto,
      estado: (["pendiente", "pagado", "vencido"].includes(x.estado)
        ? x.estado
        : "pendiente") as "pendiente" | "pagado" | "vencido",
      creadoEn: fechaCorta(x.creado_en),
    })),
    conexiones: (conexiones.data ?? []).map((x) => ({
      servicio: x.servicio,
      estado: x.estado,
      referencia: x.referencia_externa ?? null,
    })),
    actividad: (actividad.data ?? []).map((x) => ({
      id: x.id,
      cuando: mesAnio(x.creada_en),
      descripcion: x.descripcion,
      resultado: x.resultado,
    })),
    onboarding,
  };
}

/* -------------------------------------------------------------------------
   Resumen del Inicio admin — mezcla real (clientes) + ejemplo (actividad)
   ------------------------------------------------------------------------- */
export async function getResumenAdmin(): Promise<ResumenAdmin> {
  const [clientes, supabase] = await Promise.all([
    getClientesAdmin(),
    supabaseServidor(),
  ]);

  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);

  const [acciones, errores, cola] = await Promise.all([
    supabase
      .from("actividad")
      .select("id", { count: "exact", head: true })
      .gte("creada_en", inicioHoy.toISOString()),
    supabase
      .from("ejecuciones")
      .select("id", { count: "exact", head: true })
      .eq("estado", "error")
      .gte("creada_en", inicioHoy.toISOString()),
    supabase
      .from("cola")
      .select("id", { count: "exact", head: true })
      .in("estado", ["pendiente", "en_retoque"]),
  ]);

  return {
    clientesActivos: clientes.filter((c) => c.estado === "activo").length,
    clientesPrueba: clientes.filter((c) => c.estado === "prueba").length,
    ingresoMensual: clientes.reduce((s, c) => s + c.ingresoMensual, 0),
    accionesHoy: acciones.count ?? 0,
    erroresHoy: errores.count ?? 0,
    enCola: cola.count ?? 0,
  };
}

/* -------------------------------------------------------------------------
   Contadores para las pastillas de la barra lateral y la campana del admin.
   ------------------------------------------------------------------------- */
export async function getContadoresAdmin(): Promise<{
  clientes: number;
  mensajes: number;
  erroresHoy: number;
  pagosVencidos: number;
}> {
  if (!(await soyAdmin()))
    return { clientes: 0, mensajes: 0, erroresHoy: 0, pagosVencidos: 0 };

  const supabase = await supabaseServidor();
  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);

  const [clientes, mensajes, errores, vencidos] = await Promise.all([
    supabase.from("clientes").select("id", { count: "exact", head: true }),
    supabase
      .from("mensajes")
      .select("id", { count: "exact", head: true })
      .eq("estado", "sin_responder"),
    supabase
      .from("ejecuciones")
      .select("id", { count: "exact", head: true })
      .eq("estado", "error")
      .gte("creada_en", inicioHoy.toISOString()),
    supabase
      .from("cobros")
      .select("id", { count: "exact", head: true })
      .eq("estado", "vencido"),
  ]);

  return {
    clientes: clientes.count ?? 0,
    mensajes: mensajes.count ?? 0,
    erroresHoy: errores.count ?? 0,
    pagosVencidos: vencidos.count ?? 0,
  };
}

/* -------------------------------------------------------------------------
   Pagos — todos los cobros de todos los clientes, para /panel/admin/pagos.
   Con la suspensión automática viva (2 días), el admin necesita ver de un
   vistazo quién debe y actuar antes de que el cron los pause.
   ------------------------------------------------------------------------- */
export type CobroAdmin = {
  id: string;
  clienteId: string;
  cliente: string;
  clienteEstado: ClienteAdmin["estado"];
  periodo: string;
  monto: number;
  estado: "pendiente" | "pagado" | "vencido";
  metodo: string | null;
  diasDesde: number;
  creadoEn: string;
};

export type PagosAdmin = {
  resumen: {
    porCobrar: number;
    vencido: number;
    cobrado: number;
    clientesEnRiesgo: number;
  };
  cobros: CobroAdmin[];
};

function diasDesdeIso(iso: string | null): number {
  if (!iso) return 0;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export async function getPagosAdmin(): Promise<PagosAdmin> {
  const vacio: PagosAdmin = {
    resumen: { porCobrar: 0, vencido: 0, cobrado: 0, clientesEnRiesgo: 0 },
    cobros: [],
  };
  if (!(await soyAdmin())) return vacio;

  const supabase = await supabaseServidor();
  const { data, error } = await supabase
    .from("cobros")
    .select(
      "id, periodo, monto, estado, metodo, creado_en, clientes(id, nombre_negocio, estado)"
    )
    .order("creado_en", { ascending: false });

  if (error || !data) return vacio;

  const cobros: CobroAdmin[] = data.map((x) => {
    const cli = x.clientes as {
      id?: string;
      nombre_negocio?: string;
      estado?: string;
    } | null;
    const estado = (["pendiente", "pagado", "vencido"].includes(x.estado)
      ? x.estado
      : "pendiente") as CobroAdmin["estado"];
    return {
      id: x.id,
      clienteId: cli?.id ?? "",
      cliente: cli?.nombre_negocio ?? "—",
      clienteEstado: (cli?.estado as ClienteAdmin["estado"]) ?? "prueba",
      periodo: x.periodo,
      monto: x.monto,
      estado,
      metodo: x.metodo ?? null,
      diasDesde: diasDesdeIso(x.creado_en),
      creadoEn: mesAnio(x.creado_en),
    };
  });

  /* Orden: primero lo que urge cobrar (vencido, más viejo arriba), después
     pendiente (más viejo arriba), y al final lo pagado (más reciente). */
  const rango = { vencido: 0, pendiente: 1, pagado: 2 } as const;
  cobros.sort((a, b) => {
    if (rango[a.estado] !== rango[b.estado]) return rango[a.estado] - rango[b.estado];
    // Sin pagar: el más viejo arriba (más urge). Pagado: el más reciente arriba.
    return a.estado === "pagado"
      ? a.diasDesde - b.diasDesde
      : b.diasDesde - a.diasDesde;
  });

  const enRiesgo = new Set(
    cobros.filter((c) => c.estado !== "pagado").map((c) => c.clienteId)
  );

  return {
    resumen: {
      porCobrar: cobros
        .filter((c) => c.estado !== "pagado")
        .reduce((s, c) => s + c.monto, 0),
      vencido: cobros
        .filter((c) => c.estado === "vencido")
        .reduce((s, c) => s + c.monto, 0),
      cobrado: cobros
        .filter((c) => c.estado === "pagado")
        .reduce((s, c) => s + c.monto, 0),
      clientesEnRiesgo: enRiesgo.size,
    },
    cobros,
  };
}

/* -------------------------------------------------------------------------
   Ejecuciones — el log técnico de n8n (tabla `ejecuciones`). Solo admin.
   ------------------------------------------------------------------------- */
export async function getEjecucionesAdmin(
  limite = 40
): Promise<EjecucionAdmin[]> {
  if (!(await soyAdmin())) return [];

  const supabase = await supabaseServidor();
  const { data, error } = await supabase
    .from("ejecuciones")
    .select("id, accion, duracion_ms, estado, log, creada_en, clientes(nombre_negocio)")
    .order("creada_en", { ascending: false })
    .limit(limite);

  if (error || !data) return [];

  return data.map((e) => {
    const cli = e.clientes as { nombre_negocio?: string } | null;
    return {
      id: e.id,
      cuando: mesAnio(e.creada_en),
      cliente: cli?.nombre_negocio ?? "—",
      accion: e.accion,
      duracionMs: e.duracion_ms ?? null,
      estado: e.estado === "error" ? "error" : "ok",
      log: e.log ?? null,
    };
  });
}

/* -------------------------------------------------------------------------
   Consultas de soporte — todas, para el admin (mensajes + mensajes_lineas)
   ------------------------------------------------------------------------- */
function estadoConsultaAdmin(v: string): EstadoConsulta {
  return (["sin_responder", "respondida", "resuelta"].includes(v)
    ? v
    : "sin_responder") as EstadoConsulta;
}

export async function getConsultasAdmin(): Promise<Consulta[]> {
  if (!(await soyAdmin())) return [];

  const supabase = await supabaseServidor();
  const { data, error } = await supabase
    .from("mensajes")
    .select(
      "id, asunto, estado, creado_en, clientes(nombre_negocio), mensajes_lineas(autor, creado_en)"
    )
    .order("creado_en", { ascending: false });

  if (error || !data) return [];

  return data.map((m) => {
    const cli = m.clientes as { nombre_negocio?: string } | null;
    return {
      id: m.id,
      asunto: m.asunto,
      estado: estadoConsultaAdmin(m.estado),
      cuando: mesAnio(m.creado_en),
      ultimaDe: ultimoAutor(
        m.mensajes_lineas as { autor?: string; creado_en?: string }[]
      ),
      cliente: cli?.nombre_negocio ?? "—",
    };
  });
}

export async function getConsultaAdmin(
  id: string
): Promise<HiloConsulta | null> {
  if (!(await soyAdmin())) return null;

  const supabase = await supabaseServidor();
  const { data, error } = await supabase
    .from("mensajes")
    .select(
      "id, asunto, estado, creado_en, clientes(nombre_negocio), mensajes_lineas(id, autor, texto, creado_en)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const crudas = (data.mensajes_lineas ?? []) as {
    id: string;
    autor: string;
    texto: string;
    creado_en: string;
  }[];
  const cli = data.clientes as { nombre_negocio?: string } | null;

  return {
    id: data.id,
    asunto: data.asunto,
    estado: estadoConsultaAdmin(data.estado),
    cuando: mesAnio(data.creado_en),
    ultimaDe: ultimoAutor(crudas),
    cliente: cli?.nombre_negocio ?? "—",
    lineas: [...crudas]
      .sort((a, b) => a.creado_en.localeCompare(b.creado_en))
      .map((l) => ({
        id: l.id,
        autor: (l.autor === "hoshizora" ? "hoshizora" : "cliente") as
          | "cliente"
          | "hoshizora",
        texto: l.texto ?? "",
        cuando: mesAnio(l.creado_en),
      })),
  };
}
