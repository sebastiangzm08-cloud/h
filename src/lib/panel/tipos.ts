/* ==========================================================================
   Tipos del panel. Espejo de las tablas de Supabase descritas en la
   propuesta técnica — si acá cambia un campo, cambia allá también.

   Los nombres van en español a propósito: es el idioma del negocio y del
   resto del proyecto. Mezclar `client.status` con `cliente.estado` es la
   forma más rápida de que nadie encuentre nada.
   ========================================================================== */

/** Los 6 procesos de content.ts. El catálogo entero cuelga de acá. */
export type Proceso =
  | "ventas"
  | "atencion"
  | "administracion"
  | "operaciones"
  | "datos"
  | "personas";

export const nombreProceso: Record<Proceso, string> = {
  ventas: "Captación y ventas",
  atencion: "Atención al cliente",
  administracion: "Administración y finanzas",
  operaciones: "Operaciones y entrega",
  datos: "Datos y reportes",
  personas: "Personas y procesos internos",
};

/** Quién está mirando. El rol vive en la base, no en la pantalla. */
export type Rol = "cliente" | "admin";

export type EstadoCliente = "activo" | "prueba" | "pausado" | "moroso";

export type Cliente = {
  id: string;
  nombreNegocio: string;
  rubro: string;
  personaContacto: string;
  correo: string;
  whatsapp: string;
  plan: string;
  estado: EstadoCliente;
  clienteDesde: string;
  mensualidad: number;
  proximoCobro: string;
  /** ¿Ya llenó el formulario "¿cómo está tu negocio?" al menos una vez? */
  onboardingCompleto: boolean;
};

export type Perfil = {
  id: string;
  rol: Rol;
  nombre: string;
  clienteId: string | null;
};

/**
 * El estado hace dos trabajos distintos y por eso son tres, no dos:
 *   publicada → existe; el cliente la activa y queda andando hoy
 *   a_pedido  → se construye para ese cliente; se muestra con su plazo
 *   borrador  → idea interna; el cliente no la ve
 *
 * Sin `a_pedido` solo quedan dos salidas malas: prometer lo que no existe,
 * o no tener catálogo que mostrar.
 */
export type EstadoAutomatizacion = "publicada" | "a_pedido" | "borrador";

/** Los planes, de menor a mayor. Cada uno habilita una automatización. */
export type Plan = "basico" | "growth" | "scale";

export const nombrePlan: Record<Plan, string> = {
  basico: "Básico",
  growth: "Growth",
  scale: "Scale",
};

/** Una automatización del catálogo maestro: lo que vendés. */
export type Automatizacion = {
  id: string;
  slug: string;
  nombre: string;
  proceso: Proceso;
  /**
   * El plan que la habilita. Es LO QUE VE EL CLIENTE: "Growth" le dice algo,
   * "N3" no le dice nada.
   */
  planMinimo: Plan;
  /**
   * Nivel de complejidad N1–N4. Dato INTERNO: sirve para cotizar y estimar
   * plazos, nunca se muestra en el panel del cliente.
   */
  nivel: "N1" | "N2" | "N3" | "N4";
  carga: "programada" | "moderada" | "continua";
  /** `null` = no tiene precio fijo, se cotiza (ej. Prospección). */
  precioMensual: number | null;
  descripcion: string;
  /**
   * Límites por defecto de la automatización. Al asignarla a un cliente,
   * estos se copian a `asignaciones.limites` y de ahí los lee el panel y
   * n8n. Se pueden ajustar por cliente después.
   */
  limitesSugeridos: Record<string, number>;
  /** Qué necesita conectado para poder funcionar. */
  conexionesRequeridas: string[];
  estado: EstadoAutomatizacion;
  /** Cuánto tarda en quedar andando. Solo para las `a_pedido`. */
  plazo: string | null;
};

/**
 * Lo que un cliente TIENE contratado. Es la tabla que une todo, y la que
 * decide qué ve cada quien en su panel: sin asignación, la automatización
 * no existe para ese cliente.
 */
export type Asignacion = {
  id: string;
  automatizacion: Automatizacion;
  estado: "activa" | "pausada";
  precioMensual: number;
  /** Ej: { publicacionesDia: 10, fotosMejoradasMes: 30 } */
  limites: Record<string, number>;
  /** Las respuestas del formulario. Van tal cual al nodo de n8n. */
  config: Record<string, unknown>;
  /** Resumen corto para la tarjeta del Inicio. */
  resumen: string;
};

/** Un medidor de consumo contra su límite. */
export type Medidor = {
  etiqueta: string;
  usado: number;
  tope: number;
  /** Para mostrar "1.240 / 2.000" con separador de miles. */
  formato?: "entero" | "miles";
};

export type ResultadoActividad = "ok" | "atencion" | "error" | "aviso";

export type Actividad = {
  id: string;
  cuando: string;
  automatizacion: string;
  descripcion: string;
  resultado: ResultadoActividad;
};

export type Pendiente = {
  id: string;
  titulo: string;
  detalle: string;
  gravedad: "info" | "atencion" | "urgente";
  /** A dónde lleva el botón. */
  accion: { texto: string; href: string };
};

/** Un punto de la gráfica de acciones automatizadas. */
export type PuntoUso = { fecha: string; valor: number };

/* -------------------------------------------------------------------------
   Perfil del negocio — el formulario "¿cómo está tu negocio?" que se llena
   al entrar. Sus respuestas arman el prompt exacto para Gemini. Se guarda
   en `clientes.perfil_negocio` (jsonb).
   ------------------------------------------------------------------------- */
export type PerfilNegocio = {
  queVendes: string;
  quienCompra: string;
  queTeDiferencia: string;
  /** "cercano" | "formal" | "divertido" | "experto" — texto libre igual. */
  voz: string;
  trato: "vos" | "usted";
  queNuncaDecir: string;
  promosActivas: string;
  ejemplosTexto: string;
  links: string;
};

export const PERFIL_NEGOCIO_VACIO: PerfilNegocio = {
  queVendes: "",
  quienCompra: "",
  queTeDiferencia: "",
  voz: "cercano",
  trato: "vos",
  queNuncaDecir: "",
  promosActivas: "",
  ejemplosTexto: "",
  links: "",
};

/* -------------------------------------------------------------------------
   Conexiones — cada servicio externo que una automatización necesita
   enchufado. Espejo de la tabla `conexiones`.
   ------------------------------------------------------------------------- */
export type EstadoConexion = "conectada" | "sin_conectar" | "vencida" | "error";

export type Conexion = {
  servicio: string;
  /** Nombre lindo: "instagram" → "Instagram". */
  nombre: string;
  estado: EstadoConexion;
  /** Para qué automatización hace falta. */
  paraQue: string;
  /** Cuenta o página conectada, si la hay. */
  referencia: string | null;
  /** Cuándo vence el permiso, si aplica. */
  venceEn: string | null;
};

/* -------------------------------------------------------------------------
   Facturación — el plan, el cobro que viene y el historial. `cobros` +
   campos del cliente.
   ------------------------------------------------------------------------- */
export type EstadoCobro = "pendiente" | "pagado" | "vencido";

export type Cobro = {
  id: string;
  periodo: string;
  monto: number;
  estado: EstadoCobro;
  metodo: string | null;
  pagadoEn: string | null;
};

export type Facturacion = {
  plan: string;
  mensualidad: number;
  proximoCobro: string;
  /** Cómo paga hoy: "SINPE Móvil ····0215". */
  metodoPago: string;
  cobros: Cobro[];
};

/* -------------------------------------------------------------------------
   Piezas de contenido — cada foto/video que el cliente subió y su estado en
   la fila. Espejo de la tabla `cola`.
   ------------------------------------------------------------------------- */
export type EstadoPieza =
  | "pendiente"
  | "en_retoque"
  | "programada"
  | "publicada"
  | "fallida"
  | "cancelada";

export type Pieza = {
  id: string;
  tipo: "imagen" | "video";
  /** URL en ImageKit del archivo original (la portada, si es carrusel). */
  url: string;
  /** true = varias fotos en un solo post. */
  esCarrusel: boolean;
  /** Cuántas fotos lleva el carrusel (0 si no lo es). */
  cantidadImagenes: number;
  instruccion: string;
  redes: string[];
  estado: EstadoPieza;
  /** Día para el que quedó agendada, ya formateado. `null` = sin fecha. */
  programadaPara: string | null;
  /** Cuándo se subió, en relativo. */
  cuando: string;
};

/* -------------------------------------------------------------------------
   Consultas de soporte — el hilo entre el cliente y Hoshizora, dentro del
   panel (sin correo). Espejo de `mensajes` + `mensajes_lineas`.
   ------------------------------------------------------------------------- */
export type EstadoConsulta = "sin_responder" | "respondida" | "resuelta";

export type LineaConsulta = {
  id: string;
  autor: "cliente" | "hoshizora";
  texto: string;
  cuando: string;
};

export type Consulta = {
  id: string;
  asunto: string;
  estado: EstadoConsulta;
  cuando: string;
  /** Quién escribió la última línea. Para saber de quién es el turno. */
  ultimaDe: "cliente" | "hoshizora" | null;
  /** Solo en el listado del admin. */
  cliente?: string;
};

export type HiloConsulta = Consulta & { lineas: LineaConsulta[] };
