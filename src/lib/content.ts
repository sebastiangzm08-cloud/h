/* ==========================================================================
   Contenido del sitio. Textos, procesos, catálogo y planes.
   Los precios son PLACEHOLDER: ajustalos a tu mercado antes de publicar.
   ========================================================================== */
import { site, colones } from "@/config/site";

/* -------------------------------------------------------------------------
   Herramientas. Alimentan el selector y la barra de la home.
   ------------------------------------------------------------------------- */
export type ToolId =
  | "whatsapp"
  | "sheets"
  | "correo"
  | "crm"
  | "tienda"
  | "factura"
  | "ads"
  | "tareas"
  | "calendario"
  | "erp"
  | "drive"
  | "banco"
  | "redes";

export const herramientas: { id: ToolId; nombre: string; grupo: string }[] = [
  { id: "whatsapp", nombre: "WhatsApp", grupo: "Comunicación" },
  { id: "correo", nombre: "Gmail / Outlook", grupo: "Comunicación" },
  { id: "calendario", nombre: "Google Calendar", grupo: "Comunicación" },
  { id: "sheets", nombre: "Excel / Google Sheets", grupo: "Datos" },
  { id: "drive", nombre: "Drive / OneDrive", grupo: "Datos" },
  { id: "erp", nombre: "ERP o sistema propio", grupo: "Datos" },
  { id: "crm", nombre: "CRM (HubSpot, Pipedrive)", grupo: "Comercial" },
  { id: "ads", nombre: "Meta Ads / Google Ads", grupo: "Comercial" },
  { id: "tienda", nombre: "Tienda online (Shopify, Woo)", grupo: "Comercial" },
  { id: "factura", nombre: "Factura electrónica", grupo: "Administración" },
  { id: "banco", nombre: "Banco / SINPE", grupo: "Administración" },
  { id: "tareas", nombre: "Notion / Trello / ClickUp", grupo: "Operación" },
  { id: "redes", nombre: "Redes sociales (Instagram, TikTok, Facebook)", grupo: "Comercial" },
];

/* -------------------------------------------------------------------------
   Los 6 procesos. La columna vertebral del posicionamiento horizontal.
   ------------------------------------------------------------------------- */
export type ProcesoSlug =
  | "ventas"
  | "atencion"
  | "administracion"
  | "operaciones"
  | "datos"
  | "personas";

export const procesos: {
  slug: ProcesoSlug;
  n: string;
  nombre: string;
  titular: string;
  resumen: string;
  sintomas: string[];
}[] = [
  {
    slug: "ventas",
    n: "01",
    nombre: "Captación y ventas",
    titular: "Que ningún lead se enfríe esperando a que alguien lo vea",
    resumen:
      "Los contactos que entran por anuncios, formularios o WhatsApp llegan solos al CRM, con seguimiento y recordatorios que se disparan sin que nadie los active.",
    sintomas: [
      "Los leads de los anuncios se revisan al día siguiente, o dos días después",
      "El seguimiento de una cotización depende de que alguien se acuerde",
      "Nadie sabe cuántos presupuestos quedaron sin respuesta este mes",
    ],
  },
  {
    slug: "atencion",
    n: "02",
    nombre: "Atención al cliente",
    titular: "Dejar de contestar cuarenta veces al día lo mismo",
    resumen:
      "Las preguntas repetidas se responden solas, las citas se agendan sin intervención y lo que sí necesita una persona llega al canal correcto con contexto.",
    sintomas: [
      "El mismo mensaje de WhatsApp se contesta decenas de veces al día",
      "Agendar una cita cuesta cuatro mensajes de ida y vuelta",
      "Las consultas llegan por cuatro canales distintos y se pierden",
    ],
  },
  {
    slug: "administracion",
    n: "03",
    nombre: "Administración y finanzas",
    titular: "Cerrar el mes sin perseguir facturas en tres carpetas",
    resumen:
      "Facturas y recibos se leen y se registran solos, los cobros se recuerdan sin que tengás que hacerlo vos, y la factura electrónica se emite al confirmar el pago.",
    sintomas: [
      "Alguien transcribe facturas a mano a una hoja de cálculo",
      "Los cobros se atrasan porque a nadie le toca recordarlos",
      "El cierre de mes es una reconstrucción arqueológica",
    ],
  },
  {
    slug: "operaciones",
    n: "04",
    nombre: "Operaciones y entrega",
    titular: "El mismo proceso, ejecutado igual todas las veces",
    resumen:
      "Onboarding de cliente, seguimiento de pedidos e inventario dejan de depender de la memoria de quien esté de turno.",
    sintomas: [
      "Cada cliente nuevo se arranca de una forma distinta",
      "El cliente pregunta en qué va su pedido y hay que ir a averiguarlo",
      "El inventario del sistema y el real no coinciden",
    ],
  },
  {
    slug: "datos",
    n: "05",
    nombre: "Datos y reportes",
    titular: "Enterarse de los problemas antes de que reclame el cliente",
    resumen:
      "Los reportes se arman y se envían solos, y las alertas avisan cuando una métrica se sale de rango en lugar de esperar al cierre de mes.",
    sintomas: [
      "El reporte semanal lo arma una persona copiando y pegando",
      "La información vive en cinco archivos que nadie consolida",
      "Los problemas se descubren cuando ya son caros",
    ],
  },
  {
    slug: "personas",
    n: "06",
    nombre: "Personas y procesos internos",
    titular: "Que entrar a trabajar aquí no dependa de la memoria de nadie",
    resumen:
      "Altas de personal, accesos, documentos y solicitudes internas siguen siempre el mismo camino, con registro de lo que pasó.",
    sintomas: [
      "Cada alta de empleado se improvisa",
      "Las vacaciones se piden por WhatsApp y se apuntan en un cuaderno",
      "Nadie sabe qué accesos tiene quién",
    ],
  },
];

/* -------------------------------------------------------------------------
   Niveles de complejidad. Así se cotiza cualquier negocio sin conocer
   su industria: el precio lo fija el flujo, no el sector.
   ------------------------------------------------------------------------- */
/* Plazos: de 2 días a 1 semana para todo lo que tiene precio cerrado
   (N1 a N3). Lo que de verdad es grande (N4, sin precio "desde") no lleva
   promesa de tiempo — se define en el diagnóstico, según lo que se hable
   con cada cliente. Ningún ítem del catálogo puede superar 1 semana; si
   alguno lo hace, hay que bajarlo o pasarlo a N4. */
export const niveles = [
  {
    id: "N1",
    nombre: "Conexión",
    definicion: "Dos aplicaciones, un disparador, sin lógica condicional.",
    ejemplo: "Formulario web → CRM + correo de aviso",
    plazo: "2 a 4 días",
    desde: 145000,
  },
  {
    id: "N2",
    nombre: "Flujo",
    definicion:
      "Tres a cinco aplicaciones, condiciones, reintentos y notificaciones.",
    ejemplo: "Lead de anuncios → CRM → WhatsApp → recordatorios",
    plazo: "4 a 7 días",
    desde: 385000,
  },
  {
    id: "N3",
    nombre: "Inteligente",
    definicion:
      "Lectura de documentos, clasificación, decisiones y agentes de IA.",
    ejemplo: "Foto de factura → datos extraídos → contabilidad",
    plazo: "5 a 7 días",
    desde: 720000,
  },
  {
    id: "N4",
    nombre: "Sistema",
    definicion:
      "Varios flujos conectados, panel propio, migración de datos, API.",
    ejemplo: "Operación completa de pedidos de punta a punta",
    plazo: "Según lo que hablemos",
    desde: null,
  },
] as const;

/* -------------------------------------------------------------------------
   Planes. Solo mensualidad: no se cobra puesta en marcha.
   El campo  queda en null por si algún día se reactiva.
   ------------------------------------------------------------------------- */
export const planes = [
  {
    id: "starter",
    nombre: "Básico",
    para: "Ideal para arrancar y atender 24/7",
    setup: null,
    mensual: 50000,
    /** Días de prueba gratuita, contados desde que la automatización
        elegida por el cliente queda entregada y funcionando (no desde
        la firma). Solo aplica a este plan. `null` = sin prueba. */
    pruebaGratuitaDias: 7,
    destacado: false,
    limites: [
      ["Automatizaciones incluidas", "1 completa"],
      ["Ejecuciones por mes", "2.000"],
      ["Integraciones", "3"],
      ["Cambios incluidos", "—"],
      ["Soporte", "Correo, 48 h hábiles"],
      ["Monitoreo", "Básico"],
    ],
    incluye: [
      "Incluye el Publicador de contenido, completo y andando",
      "Instalación y puesta en marcha sin costo",
      "Prueba gratuita de 7 días desde que queda funcionando",
      "Diagnóstico y mapa de tu operación antes de empezar",
      "Arreglo incluido si una app conectada cambia su interfaz",
      "Sin permanencia forzada — cancelás cuando querés",
    ],
    cta: "directo",
  },
  {
    id: "growth",
    nombre: "Growth",
    para: "Automatiza ventas y seguimientos",
    setup: null,
    mensual: 125000,
    pruebaGratuitaDias: null,
    destacado: true,
    limites: [
      ["Automatización incluida", "1 completa"],
      ["Ejecuciones por mes", "20.000"],
      ["Integraciones", "8"],
      ["Cambios incluidos", "2 h por mes"],
      ["Soporte", "Correo, 24 h"],
      ["Monitoreo", "Con alertas"],
    ],
    incluye: [
      "Incluye el Bot de WhatsApp, completo y andando",
      "Instalación y puesta en marcha sin costo",
      "Revisión mensual de rendimiento",
      "Prioridad en la cola de cambios",
      "2 horas de ajustes a flujos existentes cada mes",
      "Informe mensual de ejecuciones y errores",
      "Soporte por correo con respuesta en 24 horas",
      "Monitoreo con alertas en tiempo real",
    ],
    cta: "llamada",
  },
  {
    id: "scale",
    nombre: "Scale",
    para: "Diseñado a medida para operaciones grandes",
    setup: null,
    /* Ya no se muestra como precio fijo — ver `aCotizar`. Se deja el
       número como referencia interna de "desde cuánto" arranca la
       conversación, no como algo que ve el cliente. */
    mensual: 320000,
    aCotizar: true,
    pruebaGratuitaDias: null,
    destacado: false,
    limites: [
      ["Automatización incluida", "Prospección, a medida"],
      ["Ejecuciones por mes", "Sin límite fijo"],
      ["Integraciones", "Sin límite"],
      ["Cambios incluidos", "Según lo acordado"],
      ["Soporte", "WhatsApp, 8 h hábiles"],
      ["Monitoreo", "Alertas y prioridad"],
    ],
    incluye: [
      "Incluye Prospección e inteligencia de mercado, a la medida de tu operación",
      "Diagnóstico y diseño a medida",
      "Ambiente de pruebas separado antes de publicar cambios",
      "Plan de continuidad documentado",
      "Soporte prioritario por WhatsApp, 8 horas hábiles",
      "Sesión trimestral de revisión estratégica",
    ],
    cta: "llamada",
  },
] as const;

/* -------------------------------------------------------------------------
   LAS AUTOMATIZACIONES QUE SE VENDEN HOY. Una por plan. Esta es la fuente
   de verdad del sitio público (home, /qué-automatizamos, modal de planes).
   Más adelante se agregan; por ahora son estas tres.
   ------------------------------------------------------------------------- */
export type AutomatizacionPublica = {
  slug: string;
  nombre: string;
  /** Nombre del plan que la incluye. */
  plan: "Básico" | "Growth" | "Scale";
  /** Precio mensual, o null = "A cotizar". */
  precio: number | null;
  /** Una línea que la resume. */
  gancho: string;
  /** 2–3 frases de qué hace. */
  descripcion: string;
  /** 3–4 puntos concretos. */
  puntos: string[];
};

export const automatizaciones: AutomatizacionPublica[] = [
  {
    slug: "publicador-de-contenido",
    nombre: "Publicador de contenido",
    plan: "Básico",
    precio: 50000,
    gancho: "Tus redes publican solas, con tu voz.",
    descripcion:
      "Subís tus fotos o videos, los aprobás una vez, y el sistema publica en tus redes por vos. La IA escribe un texto distinto para cada red, con el tono de tu negocio.",
    puntos: [
      "Publica en hasta 3 redes conectadas (Instagram, Facebook, TikTok)",
      "Solo sale lo que vos subiste y aprobaste — nada inventado",
      "Un texto propio por red, no el mismo copiado",
      "Vos elegís el día o lo dejás salir en el próximo turno",
    ],
  },
  {
    slug: "bot-de-whatsapp",
    nombre: "Bot de WhatsApp",
    plan: "Growth",
    precio: 125000,
    gancho: "Un solo agente que atiende, vende y agenda.",
    descripcion:
      "Contesta por WhatsApp con tu información real a cualquier hora, agenda citas, y da seguimiento a los pedidos y cobros. Escala a una persona cuando hace falta.",
    puntos: [
      "Responde consultas con tu catálogo, precios y políticas reales",
      "Agenda citas y confirma sin que muevas un dedo",
      "Da seguimiento a cotizaciones y recordatorios de pago",
      "Pasa la conversación a una persona cuando el caso lo pide",
    ],
  },
  {
    slug: "prospeccion",
    nombre: "Prospección e inteligencia de mercado",
    plan: "Scale",
    precio: null,
    gancho: "Encuentra clientes y estudia a tu competencia por vos.",
    descripcion:
      "Rastrea tu zona y tu rubro: arma listas de clientes potenciales, analiza qué publican y ofrecen tus competidores directos, y te entrega informes accionables.",
    puntos: [
      "Listas de prospectos de tu zona, con datos de contacto",
      "Qué publica la competencia, cada cuánto y qué les funciona",
      "Informes periódicos, no un volcado de datos crudos",
      "Se arma a la medida de tu operación",
    ],
  },
];

/* -------------------------------------------------------------------------
   En qué plan entra cada nivel del catálogo. Se muestra como "Incluido en
   {plan}" en vez del precio de construcción en la grilla del catálogo
   (que puede asustar sin contexto) — el precio real sigue apareciendo tal
   cual al dar clic (checkout o el mensaje de WhatsApp). Como el plan
   incluye "N automatizaciones a elección", cualquier ítem de ese nivel
   puede ser la elegida — el texto es honesto, pero ojo: no es una
   automatización específica ya reservada para cada cliente.
   ------------------------------------------------------------------------- */
export const planPorNivel: Record<"N1" | "N2" | "N3" | "N4", string> = {
  N1: "Básico",
  N2: "Básico",
  N3: "Growth",
  N4: "Scale",
};

/* -------------------------------------------------------------------------
   Auditoría: la sección que la mostraba en /planes se sacó el 30/8/2026 —
   el usuario decidió que en la web y afuera solo se comuniquen los 3
   precios de los planes. Se deja el dato acá sin usar por si se retoma
   más adelante en otra forma; no está importado en ningún componente.
   ------------------------------------------------------------------------- */
export const auditoria = {
  nombre: "Auditoría de Automatización",
  // Bajado de ₡95.000 a ₡50.000 el 27/8/2026 mientras se valida el mercado
  // local. Revisar más adelante junto con el resto de precios cuando se
  // apunte a mercado global.
  precio: 50000,
};

/* -------------------------------------------------------------------------
   Catálogo. Automatizaciones con precio y plazo cerrados.
   `requiere` alimenta el selector de herramientas.
   ------------------------------------------------------------------------- */
export type Automatizacion = {
  id: string;
  nombre: string;
  proceso: ProcesoSlug;
  nivel: "N1" | "N2" | "N3" | "N4";
  plazo: string;
  precio: number | null;
  /** false = el precio se muestra igual, pero el botón pasa a
      "Contratar por WhatsApp" en vez de ir directo al checkout. Así se
      puede lanzar con pocas automatizaciones sin ocultar las demás. */
  disponible: boolean;
  /** Cuánto exige el servidor una vez corriendo, no cuánto costó construirla.
      "programada" = corre en horarios fijos o por eventos raros.
      "moderada"   = reacciona a eventos con cierta frecuencia, o llama IA
                     puntualmente por ejecución.
      "continua"   = tiene que estar escuchando todo el tiempo y/o llama IA
                     por cada interacción. Es lo que decide en qué plan cabe. */
  carga: "programada" | "moderada" | "continua";
  requiere: ToolId[];
  descripcion: string;
  flujo: string[];
  /** Detalle de cada paso, alineado por índice con `flujo`. Opcional:
      si falta, el diagrama se muestra sin explicación paso a paso. */
  detalles?: string[];
  /** Solo aplica dentro de Growth. Growth incluye 1 "principal" (el
      asistente de WhatsApp, en el modo que elijas) + sus 2 "complementos"
      — no es "elegí 3 de un menú de 5": cada modo del asistente es un
      build completo aparte, así que apilar más de un modo no sale gratis
      dentro del mismo plan. Sin valor = no participa de esa regla
      (Básico no la necesita, Scale ya no tiene menú fijo). */
  rol?: "principal" | "complemento";
};

export const catalogo: Automatizacion[] = [
  /* ---- Principales de Growth: el asistente de WhatsApp, por modo.
     Cada modo es un build completo aparte (prompt, lógica y casos
     distintos) aunque los tres hablen por el mismo número — por eso
     cada uno es su propio ítem de catálogo, no variantes de uno solo. */
  {
    id: "whatsapp-agenda",
    disponible: true,
    nombre: "Asistente de WhatsApp: Agenda",
    proceso: "atencion",
    nivel: "N3",
    plazo: "7 días",
    precio: 620000,
    carga: "continua",
    requiere: ["whatsapp", "calendario"],
    rol: "principal",
    descripcion:
      "Responde preguntas de horario y agenda citas nuevas contra tu calendario real, con recordatorio 24 h antes y opción de confirmar o reprogramar en un clic. Lo que no sabe resolver, lo escala a una persona con todo el contexto de la conversación.",
    flujo: [
      "Mensaje entrante o cita agendada",
      "Interpretación de la consulta",
      "Agenda o reprogramación contra el calendario real",
      "Recordatorio 24 h antes",
      "Calendario actualizado",
    ],
    detalles: [
      "Alguien escribe al WhatsApp del negocio pidiendo una cita, o ya la tenía agendada.",
      "Si pide una cita nueva, la agenda directo contra tu calendario real — nunca dos personas en el mismo espacio.",
      "24 horas antes, le llega un recordatorio con opción de confirmar o reprogramar.",
      "Si cancela o reprograma, el calendario queda al día al instante.",
      "Lo que no sabe resolver, lo escala a una persona con todo el contexto de la conversación.",
    ],
  },
  {
    id: "whatsapp-atencion",
    disponible: true,
    nombre: "Asistente de WhatsApp: Atención",
    proceso: "atencion",
    nivel: "N3",
    plazo: "7 días",
    precio: 690000,
    carga: "continua",
    requiere: ["whatsapp", "tienda"],
    rol: "principal",
    descripcion:
      "Responde las preguntas frecuentes del negocio con tu información real, y si conectás tu tienda, consulta inventario o el estado de un pedido en vivo. Lo que no sabe resolver, lo escala a una persona con todo el contexto de la conversación.",
    flujo: [
      "Mensaje entrante",
      "Interpretación de la consulta",
      "Consulta de inventario o pedido si hace falta",
      "Respuesta con datos reales",
      "Escalado a una persona si hace falta",
    ],
    detalles: [
      "Llega un mensaje al WhatsApp del negocio, a cualquier hora.",
      "Se interpreta qué está pidiendo la persona: una pregunta frecuente, disponibilidad, o algo que necesita criterio humano.",
      "Si conectaste tu tienda, consulta el inventario o el estado del pedido en vivo antes de responder.",
      "Contesta con datos reales y actualizados, nunca inventados.",
      "Cuando detecta que hace falta una persona, escala la conversación con todo el contexto de lo ya hablado.",
    ],
  },
  {
    id: "whatsapp-cobro",
    disponible: true,
    nombre: "Asistente de WhatsApp: Cobro",
    proceso: "administracion",
    nivel: "N3",
    plazo: "7 días",
    precio: 690000,
    carga: "continua",
    requiere: ["whatsapp", "banco", "factura"],
    rol: "principal",
    descripcion:
      "Recuerda a cada cliente antes del vencimiento por WhatsApp y da seguimiento hasta que entra el pago. Confirma solo, leyendo el comprobante que el cliente manda por el mismo chat, y emite la factura electrónica al confirmarse (opcional). Requiere que tengas tu propia API de WhatsApp Business configurada.",
    flujo: [
      "Vencimiento próximo",
      "Aviso y seguimiento por WhatsApp",
      "Lectura del comprobante enviado",
      "Pago confirmado y registrado",
      "Factura electrónica (opcional)",
    ],
    detalles: [
      "Antes de que venza el cobro, le llega al cliente un recordatorio con el monto y la orden.",
      "Si no paga, el seguimiento continúa según los días que definas.",
      "En cuanto el cliente manda el comprobante por WhatsApp (foto o captura), se lee solo y se verifica.",
      "El pago queda registrado sin que nadie lo transcriba a mano.",
      "Si activaste la opción, se emite y envía la factura electrónica en el mismo momento.",
    ],
  },
  /* ---- Complementos: livianos, no compiten por el mismo motor
     conversacional que el asistente de WhatsApp. */
  {
    id: "correo-clasificado-ia",
    disponible: true,
    nombre: "Clasificación y borradores de correo con IA",
    proceso: "atencion",
    nivel: "N3",
    plazo: "7 días",
    precio: 780000,
    carga: "continua",
    requiere: ["correo"],
    rol: "complemento",
    descripcion:
      "Cada correo entra clasificado por tipo y urgencia, con un borrador de respuesta listo para revisar, escrito con el contexto real del cliente. Vos aprobás; nadie escribe desde cero.",
    flujo: [
      "Correo entrante",
      "Clasificación por tipo",
      "Borrador de respuesta",
      "Revisión y envío",
    ],
  },
  {
    id: "lectura-facturas",
    disponible: true,
    nombre: "Lectura automática de facturas",
    proceso: "administracion",
    nivel: "N2",
    plazo: "5 días",
    precio: 420000,
    carga: "moderada",
    requiere: ["drive", "sheets"],
    rol: "complemento",
    descripcion:
      "Se deja el PDF o la foto de la factura en una carpeta y salen los datos estructurados: proveedor, fecha, subtotal, impuesto, total — para pagar a tus proveedores, no para que te paguen a vos (eso lo hace el Asistente de WhatsApp: Cobro). En Básico funciona para un proveedor de formato fijo. En Growth soporta cualquier proveedor, formato o moneda, y valida que los totales cuadren antes de registrar: lo dudoso queda marcado para revisión en lugar de inventado.",
    flujo: [
      "Documento en la carpeta",
      "Lectura de los datos",
      "Validación de totales (Growth)",
      "Registro en la hoja",
      "Marcado de excepciones (Growth)",
    ],
    detalles: [
      "Se deja la factura en la carpeta compartida, o llega por correo. En Básico sirve para un proveedor de formato fijo; en Growth, para cualquier proveedor, formato o moneda.",
      "Se extraen los datos del documento: proveedor, fecha, subtotal, impuesto y total.",
      "En Growth se comprueba que los números cuadren entre sí antes de darlos por buenos.",
      "Los datos ya validados se registran en tu hoja de control o contabilidad.",
      "En Growth, lo dudoso queda aparte, señalado para que una persona lo revise — nunca se inventa un dato.",
    ],
  },
  {
    id: "panel-alertas",
    disponible: true,
    nombre: "Panel y alertas de métricas",
    proceso: "datos",
    nivel: "N2",
    plazo: "6 días",
    precio: 320000,
    carga: "moderada",
    requiere: ["sheets", "drive", "correo"],
    rol: "complemento",
    descripcion:
      "Definís los umbrales que importan y el sistema avisa cuando se cruzan, el mismo día — no en el cierre de mes. En Básico consolida uno o dos archivos en un panel una vez al día y manda el resumen los lunes por correo o WhatsApp. En Growth consolida tantas fuentes como tengas, actualizado en vivo, con alerta en el instante que algo se sale de rango.",
    flujo: [
      "Archivos o dato de origen",
      "Normalización",
      "Panel actualizado (diario en Básico, en vivo en Growth)",
      "Comparación con el umbral",
      "Aviso",
    ],
    detalles: [
      "Se leen los archivos o sistemas que definás: ventas, hoja de cálculo, o lo que uses hoy.",
      "Se normalizan solos: mismos formatos, sin duplicados.",
      "En Básico el panel se actualiza una vez al día; en Growth, en vivo, sin importar cuántas fuentes sumes.",
      "Cada umbral que definiste se revisa contra el dato real.",
      "Si algo se sale de rango, el aviso llega el mismo día — en Growth, en el instante.",
    ],
  },
  {
    id: "publicador-contenido",
    disponible: true,
    nombre: "Publicador de contenido",
    proceso: "ventas",
    nivel: "N2",
    plazo: "5 días",
    precio: 380000,
    carga: "programada",
    requiere: ["redes"],
    rol: "complemento",
    descripcion:
      "Publica en hasta 3 redes conectadas, hasta 10 veces al día, únicamente con imágenes o video que ya subiste a tu base de contenido aprobado — no genera nada nuevo, solo publica lo que vos ya aprobaste. Cada red adicional después de las 3 incluidas suma $10/mes.",
    flujo: [
      "Contenido aprobado en la base de datos",
      "Cola de publicación",
      "Publicación en cada red conectada",
      "Registro de publicaciones del día",
    ],
  },
  /* ---- Scale: sin menú fijo, a cotizar. Se dejan como ejemplo de lo
     que se construye a medida, no como SKU con precio cerrado. */
  {
    id: "sync-inventario",
    disponible: true,
    nombre: "Sincronización de tienda, inventario y facturación",
    proceso: "operaciones",
    nivel: "N4",
    plazo: "A cotizar",
    precio: null,
    carga: "continua",
    requiere: ["tienda", "erp", "factura"],
    descripcion:
      "Una sola fuente de verdad para el stock, entre tu tienda, tu contabilidad y tu ERP, en tiempo real y en ambas direcciones. Depende de qué APIs expongan tus sistemas, por eso se cotiza después del diagnóstico. Ejemplo de lo que se construye a medida en Scale.",
    flujo: [
      "Movimiento de stock",
      "Actualización en la tienda",
      "Registro contable",
      "Alertas de mínimos",
    ],
  },
  {
    id: "generador-contenido-ia",
    disponible: true,
    nombre: "Generador de contenido con IA — Pro",
    proceso: "ventas",
    nivel: "N4",
    plazo: "A cotizar",
    precio: null,
    carga: "continua",
    requiere: ["redes"],
    descripcion:
      "Todo lo del Publicador de contenido, pero en vez de solo publicar lo que ya subiste, genera las imágenes, video o el copy con IA entrenada en la voz y la marca de tu negocio. Vos aprobás antes de que salga, o lo dejás en automático. Se cotiza según la marca y el volumen. Ejemplo de lo que se construye a medida en Scale.",
    flujo: [
      "Brief o calendario de contenido",
      "Generación con IA según tu marca",
      "Revisión (opcional)",
      "Publicación en tus redes",
      "Registro de publicaciones",
    ],
  },
];

/* -------------------------------------------------------------------------
   Síntomas para la home. El eje que reemplaza al nicho.

   Van en orden cronológico a propósito: la sección los cuenta como el día
   de trabajo de alguien, no como una lista de features — una historia se
   habita, una lista se escanea y se olvida.

   `horas` es un ESTIMADO, nunca un resultado medido de un cliente real.
   Por eso `cuenta` muestra siempre los supuestos: un número que se puede
   auditar se cree, uno que cae del cielo se descuenta. Cuando haya datos
   reales de clientes, estos estimados se reemplazan por cifras medidas.

   Los dos que no se traducen en horas llevan `horas: null` a propósito.
   Inventarles un número es exactamente lo que haría sonar falso a todo
   el resto: esos se pagan en clientes perdidos, no en tiempo.
   ------------------------------------------------------------------------- */
export const sintomas: {
  id: "copiar" | "repetir" | "cierre" | "tarde" | "reclamo";
  momento: string;
  titulo: string;
  texto: string;
  horas: number | null;
  cuenta: string;
}[] = [
  {
    id: "copiar",
    momento: "8:00 a.m.",
    titulo: "Copiar y pegar",
    texto:
      "Pasar datos de un sistema a otro de forma manual. Una tarea mecánica que no le suma valor real a tu negocio.",
    horas: 11,
    cuenta: "30 min al día × 22 días hábiles",
  },
  {
    id: "repetir",
    momento: "Todo el día",
    titulo: "El modo \"disco rayado\"",
    texto:
      "Responder las mismas dudas por WhatsApp o correo cuarenta veces al día. Mensajes que ya te sabés de memoria.",
    horas: 29,
    cuenta: "40 mensajes × 2 min × 22 días hábiles",
  },
  {
    id: "cierre",
    momento: "Fin de mes",
    titulo: "El caos administrativo",
    texto:
      "Cerrar el mes rastreando facturas perdidas, cruzando datos a mano y consolidando información en tres lugares distintos.",
    horas: 8,
    cuenta: "Un día entero, todos los meses",
  },
  {
    id: "tarde",
    momento: "11:00 p.m.",
    titulo: "El lead que se enfría",
    texto:
      "Un prospecto escribe de noche y lo atendés hasta la mañana siguiente. Para entonces, la urgencia ya pasó (o ya le compró a la competencia).",
    horas: null,
    cuenta: "",
  },
  {
    id: "reclamo",
    momento: "Cuando ya es tarde",
    titulo: "Reaccionar vs. prevenir",
    texto:
      "Te enterás de que un proceso falló cuando el cliente te escribe a quejarse. Ahí ya no estás dando soporte: estás controlando daños.",
    horas: null,
    cuenta: "",
  },
];

/** Suma de los síntomas que sí se cuentan en horas. Se deriva del array
    para que nadie escriba un total a mano que después no cuadre si se
    cambia un supuesto. */
export const horasPerdidasEstimadas = sintomas.reduce(
  (total, s) => total + (s.horas ?? 0),
  0
);

/* -------------------------------------------------------------------------
   Preguntas frecuentes.
   ------------------------------------------------------------------------- */
export const faq = [
  {
    q: "¿Trabajan con negocios como el mío?",
    a: "Lo que se automatiza son procesos: cotizar, dar seguimiento, facturar, reportar. Esos son casi idénticos en cualquier sector; lo que cambia son las herramientas, y trabajamos con las que ya tenés. En el diagnóstico lo confirmamos antes de que pagués nada.",
  },
  {
    q: "¿No sería mejor alguien especializado en mi industria?",
    a: "Para un software vertical, sí. Para automatizar el flujo de trabajo entre las herramientas que ya usás, la especialización útil es técnica, no sectorial. Un flujo de seguimiento de cotizaciones es el mismo en una constructora y en una imprenta.",
  },
  {
    q: "¿Qué pasa con las automatizaciones si dejo de pagar?",
    a: "Corren mientras la mensualidad esté al día — eso es lo que paga el monitoreo, el mantenimiento y los cambios, no un derecho de uso aparte. Si cancelás o la mora pasa el aviso de suspensión, el servicio se da de baja junto con las automatizaciones activas de ese plan. Si preferís no depender de nuestros servidores, también podés comprarla de forma independiente por un pago único de aproximadamente 6 meses de esa mensualidad: te la entregamos documentada para que corra en tu propia infraestructura, sin mantenimiento de nuestra parte.",
  },
  {
    q: "¿Cuánto cuesta agregar una automatización a mi plan?",
    a: `No se cobra construcción aparte, solo sube tu mensualidad — y cuánto sube depende de lo que esa automatización le exige al servidor, no de qué tan compleja fue construirla. Si se activa por horario o eventos puntuales, ${colones(site.pago.costoAgregarPorCarga.programada)}/mes más. Si reacciona a eventos con cierta frecuencia, ${colones(site.pago.costoAgregarPorCarga.moderada)}/mes. Si tiene que estar escuchando todo el tiempo (como un chat) o llama IA en cada interacción, ${colones(site.pago.costoAgregarPorCarga.continua)}/mes. Los sistemas grandes se cotizan aparte.`,
  },
  {
    q: "¿Necesito tener alguien técnico en mi equipo?",
    a: "No. Necesitás una persona que pueda darnos los accesos y responder dudas del proceso durante la implementación. El uso diario es el que ya tienen.",
  },
  {
    q: "¿Qué pasa si una automatización se rompe?",
    a: "Se rompen: las aplicaciones cambian sus interfaces sin avisar. El monitoreo nos alerta antes de que lo notés y el arreglo está incluido en la mensualidad. El tiempo de respuesta depende del plan.",
  },
  {
    q: "¿Dónde quedan mis datos?",
    a: "Los flujos corren en infraestructura propia. Guardamos resúmenes de ejecución para poder mostrarte métricas y diagnosticar fallos, no el contenido completo de tu información. Las credenciales viven en un gestor de contraseñas compartido, nunca en una base de datos nuestra ni en un chat.",
  },
  {
    q: "¿Cómo se paga?",
    a: "Las mensualidades por SINPE Móvil y los proyectos por transferencia bancaria. Los datos de la cuenta te los pasamos al confirmar el pedido. Al recibir el pago se emite la factura electrónica. Si preferís pago anual, son diez meses en lugar de doce.",
  },
  {
    q: "¿Los precios incluyen las licencias de las herramientas?",
    a: "El motor de automatización va incluido. Las licencias de tus propias herramientas (el CRM, la API de WhatsApp, los créditos de IA cuando aplican) las paga el cliente y quedan a tu nombre. Te decimos el costo exacto en el presupuesto, sin sorpresas.",
  },
  {
    q: "¿Cuánto tarda?",
    a: "Entre dos días y una semana para cualquier automatización del catálogo. Si tu proyecto es de verdad grande (varios flujos conectados, panel propio, migración de datos), el plazo se define en el diagnóstico según lo que hablemos.",
  },
];

/* -------------------------------------------------------------------------
   Negocios: una página por negocio real, en vez de solo por proceso.
   Contenido curado en NEGOCIOS-Y-AUTOMATIZACIONES.md (raíz del repo) —
   este archivo es la versión resumida para la web. Empieza con uno solo
   (prestamista) a modo de prueba; si el patrón funciona, se completan
   los demás desde ese mismo documento.
   ------------------------------------------------------------------------- */
export type Negocio = {
  slug: string;
  nombre: string;
  nota: string;
  comoTrabajaHoy: string[];
  dolor: string;
  automatizacionCompleta: string[];
  /** ids del catálogo (`Automatizacion.id`) que resuelven este negocio. */
  catalogoIds: string[];
  /** Plan que sale de combinar las de `catalogoIds` juntas — no se deriva
      solo, porque `planPorNivel` dice en qué plan entra CADA una elegida
      sola, y acá van varias a la vez. Se decide a mano. */
  planSugerido: string;
  queGana: string;
  ojoCon?: string[];
};

/* Tono: directo y corto — un renglón por paso, sin subordinadas. La
   página los muestra en dos columnas enfrentadas (hoy vs. automático), así
   que una frase larga se ve fuera de lugar al lado de su par corta. */
export const negocios: Negocio[] = [
  {
    slug: "prestamista",
    nombre: "Prestamista / financiera informal",
    nota: "Negocio muy común en Costa Rica y casi enteramente manual.",
    comoTrabajaHoy: [
      "«¿Me prestás 200 mil?» — llega por WhatsApp",
      "Negocian monto, plazo e interés por chat",
      "Entrega en persona o por SINPE",
      "Todo se anota en un cuaderno",
      "Cada quincena revisa quién debe pagar",
      "Escribe uno por uno para recordar",
      "Marca el pago a mano al recibir el SINPE",
      "La mora se calcula a mano si alguien se atrasa",
      "A fin de mes intenta sacar cuentas",
    ],
    dolor:
      "Se le pasan cobros. El cuaderno se pierde. No sabe su capital disponible. Su techo es cuánta gente puede recordar.",
    automatizacionCompleta: [
      "Alta del préstamo por WhatsApp: monto, plazo, tasa",
      "Tabla de amortización generada sola",
      "Una fila por préstamo, siempre al día",
      "Recordatorio automático dos días antes de cada cuota",
      "Registra el pago solo al leer el comprobante",
      "Mora escalonada: suave, firme, serio",
      "Panel en vivo: capital, mora, ganancia",
      "Reporte semanal solo, por WhatsApp",
    ],
    catalogoIds: ["whatsapp-cobro", "panel-alertas"],
    planSugerido: "Growth · ₡125.000/mes",
    queGana:
      "Deja de perder cobros, conoce su capital en tiempo real, y atiende varias veces más clientes sin contratar a nadie.",
    ojoCon: [
      "La Ley de usura pone un tope a la tasa — el sistema puede avisar si te pasás, y eso es argumento de venta.",
      "El negocio corre solo; a quién prestarle lo seguís decidiendo vos.",
    ],
  },
  {
    slug: "dental",
    nombre: "Clínica dental / consultorio médico",
    nota: "De las actividades con más mipymes y más saturación del país.",
    comoTrabajaHoy: [
      "El paciente pide cita por WhatsApp o llamada",
      "La asistente revisa la agenda a mano",
      "Propone horarios, va y viene por chat",
      "Anota la cita donde puede",
      "El día antes, si acaso, llama a recordar",
      "Cobra y factura después de atender",
      "Tratamientos de varias sesiones se reagendan uno por uno",
      "La limpieza semestral casi nadie la recuerda",
    ],
    dolor:
      "Ausencias del 15 al 30% sin recordatorio sistemático. La agenda se administra a mano, chat por chat, con el consultorio lleno.",
    automatizacionCompleta: [
      "Bot de WhatsApp agenda solo contra el calendario real",
      "Confirmación al toque, recordatorio a 24h y a 2h",
      "Si cancela, el cupo se ofrece solo a la lista de espera",
      "Factura electrónica automática después de atender",
      "Tratamientos de varias sesiones se agendan solos",
      "Recall a los 6 meses: «te toca limpieza, ¿te agendo?»",
      "Panel de ocupación, ausencias e ingreso por tratamiento",
    ],
    catalogoIds: ["whatsapp-agenda", "whatsapp-cobro", "panel-alertas"],
    planSugerido: "Growth · ₡125.000/mes",
    queGana:
      "Con 100 citas al mes a ₡40.000, bajar las ausencias del 20% al 5% recupera 15 citas — ₡600.000 al mes, contra ₡125.000 del plan.",
    ojoCon: [
      "Los datos de salud son sensibles bajo la Ley 8968 — cuidar dónde se guardan es también un argumento de seriedad.",
    ],
  },
];
