/* ==========================================================================
   Contenido del sitio. Textos, procesos, catálogo y planes.
   Los precios son PLACEHOLDER: ajustalos a tu mercado antes de publicar.
   ========================================================================== */

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
   Plan. HOY SE VENDE UNO SOLO: el Agente IA de WhatsApp (desde el 2026-10-04
   el sitio público ya no ofrece Redes ni Prospección: no son reales todavía).
   Solo mensualidad: no se cobra puesta en marcha en Costa Rica.

   El id sigue siendo "growth" a propósito: es el identificador interno del
   plan (órdenes `HZ-PLAN-GROWTH`, panel, facturación). Lo que ve el cliente
   es `nombre`.

   Esta misma forma la usa `content-en.ts` para el sitio en inglés.
   ------------------------------------------------------------------------- */
export type PlanPublico = {
  id: string;
  nombre: string;
  para: string;
  /** Mensualidad en la moneda del plan. */
  mensual: number;
  moneda: "CRC" | "USD";
  /** Costo único de instalación. `null` = sin costo de instalación. */
  setup: { monto: number; nota: string } | null;
  /** Permanencia mínima en meses. `null` = no se muestra ninguna. */
  minimoMeses: number | null;
  destacado: boolean;
  /** Pares [etiqueta, valor] de la ficha técnica (orden/[id]). */
  limites: [string, string][];
  incluye: string[];
};

export const planes: PlanPublico[] = [
  {
    id: "growth",
    nombre: "Agente IA",
    para: "Atiende tu WhatsApp, agenda citas y te pasa lo delicado",
    mensual: 125000,
    moneda: "CRC",
    setup: null,
    minimoMeses: 3,
    destacado: true,
    limites: [
      ["Automatización incluida", "Agente IA de WhatsApp"],
      ["Atención", "24 horas, 7 días"],
      ["Instalación", "Sin costo"],
      ["Revisión de rendimiento", "Mensual"],
      ["Cambios", "Con prioridad"],
      ["Tu panel", "Conversaciones, agenda, conocimiento y resultados"],
    ],
    incluye: [
      "Agente de WhatsApp con IA, completo y andando",
      "Responde con los precios, servicios y horarios que vos cargás",
      "Agenda citas solo, en tus horarios libres",
      "Recordatorios de citas por WhatsApp",
      "Entiende las notas de voz que te mandan",
      "Te pasa la conversación cuando el caso necesita a una persona",
      "Tu panel: conversaciones, agenda, conocimiento y resultados",
      "Instalación y puesta en marcha sin costo",
      "Revisión mensual de rendimiento",
      "Prioridad en la cola de cambios",
    ],
  },
];

/* -------------------------------------------------------------------------
   LA AUTOMATIZACIÓN QUE SE VENDE HOY: el Agente IA de WhatsApp. Fuente de
   verdad del sitio público (home, /que-automatizamos, modal de planes y
   asesor de IA). Si algún día se suman otras, entran acá. Todo lo que diga
   `puntos` tiene que existir en el producto real: no se promete lo que no
   hay.
   ------------------------------------------------------------------------- */
export type AutomatizacionPublica = {
  slug: string;
  nombre: string;
  /** Nombre del plan que la incluye. */
  plan: string;
  /** Precio mensual en la moneda del plan, o null = "A cotizar". */
  precio: number | null;
  /** Una línea que la resume. */
  gancho: string;
  /** 2–3 frases de qué hace. */
  descripcion: string;
  /** 3–6 puntos concretos. */
  puntos: string[];
};

export const automatizaciones: AutomatizacionPublica[] = [
  {
    slug: "agente-ia",
    nombre: "Agente IA de WhatsApp",
    plan: "Agente IA",
    precio: 125000,
    gancho: "Atiende tu WhatsApp, agenda citas y te pasa lo delicado.",
    descripcion:
      "Contesta por WhatsApp a cualquier hora con la información que vos cargaste, agenda citas en tus horarios libres y pasa la conversación a una persona cuando el caso lo pide. Vos ves todo en tu panel.",
    puntos: [
      "Responde al instante, de día, de noche y en fines de semana",
      "Contesta precios, servicios y horarios con tus datos, sin inventar",
      "Agenda citas solo, en horarios realmente libres, y manda recordatorios",
      "Entiende las notas de voz que te mandan",
      "Pasa la conversación a una persona cuando el caso lo pide",
      "Tu panel: conversaciones, agenda, conocimiento y resultados",
    ],
  },
];

/* Ya no apunta a ningún plan vendible: el catálogo de abajo es histórico y
   NO se ofrece en el sitio (el único plan público es el Agente IA). Se deja
   con valores que no coinciden con ningún `planes[].nombre` a propósito, así
   `orden/catalogo-*` responde 404 en vez de mostrar automatizaciones que
   hoy no se venden. */
export const planPorNivel: Record<"N1" | "N2" | "N3" | "N4", string> = {
  N1: "(no se vende)",
  N2: "(no se vende)",
  N3: "(no se vende)",
  N4: "(no se vende)",
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
   Preguntas frecuentes. Todas hablan del Agente IA de WhatsApp, que es lo
   único que se vende hoy. Las que dependen de una decisión del negocio sin
   cerrar (quién paga los mensajes de Meta, permanencia) NO afirman nada: se
   confirma por escrito en el diagnóstico.
   ------------------------------------------------------------------------- */
export type FaqItem = { q: string; a: string };

export const faq: FaqItem[] = [
  {
    q: "¿Qué hace exactamente el Agente IA?",
    a: "Atiende tu WhatsApp a cualquier hora: contesta preguntas con los precios, servicios y horarios que vos cargaste, agenda citas en tus horarios libres, manda recordatorios, entiende las notas de voz y te pasa los casos que necesitan a una persona. Todo lo que habla queda en tu panel.",
  },
  {
    q: "¿Para qué negocios sirve?",
    a: "Está pensado para negocios que atienden por cita y ya reciben a sus clientes por WhatsApp: clínicas dentales y médicas, veterinarias, consultorios y otros servicios. En el diagnóstico confirmamos si te sirve antes de que pagués nada.",
  },
  {
    q: "¿Y si el agente no sabe algo?",
    a: "No lo inventa. Si algo no está en lo que cargaste, pregunta o te pasa la conversación, y queda anotado en tu panel para que se lo enseñés una vez y no lo vuelva a preguntar.",
  },
  {
    q: "¿Puedo ver y tomar las conversaciones?",
    a: "Sí. En tu panel ves cada conversación, la agenda y los resultados. Cuando querés, tomás una conversación y seguís vos; después se la devolvés al agente.",
  },
  {
    q: "¿Necesito alguien técnico en mi equipo?",
    a: "No. Necesitamos que nos cuentes tus servicios, precios y horarios, y que nos des acceso a tu número de WhatsApp durante la puesta en marcha. El uso diario es desde tu panel.",
  },
  {
    q: "¿Cuánto tarda en estar andando?",
    a: "Hasta una semana, según qué tan lista esté tu información (servicios, precios, horarios) y el acceso a tu número. Lo confirmamos en el diagnóstico.",
  },
  {
    q: "¿Qué pasa si algo falla?",
    a: "El estado de la conexión con tu WhatsApp se ve en tu panel, y desde ahí nos escribís. El arreglo está incluido en la mensualidad.",
  },
  {
    q: "¿Qué pasa si dejo de pagar?",
    a: "El agente funciona mientras la mensualidad esté al día: eso es lo que paga el mantenimiento y los cambios, no un derecho de uso aparte. Si cancelás el plan o la mora pasa el aviso de suspensión, el servicio se da de baja.",
  },
  {
    q: "¿Dónde quedan mis datos?",
    a: "Las conversaciones, contactos y citas se guardan en una base de datos con acceso por cuenta: cada negocio ve solamente lo suyo. Para redactar las respuestas se usa un modelo de inteligencia artificial de un proveedor externo.",
  },
  {
    q: "¿Cómo se paga?",
    a: "La mensualidad se paga por SINPE Móvil o transferencia bancaria, según el monto. Los datos de la cuenta te los pasamos al confirmar. Al recibir el pago se emite la factura electrónica. Si preferís pago anual, son diez meses en lugar de doce.",
  },
  {
    q: "¿Qué cuesta además de la mensualidad?",
    a: "La mensualidad cubre el agente funcionando, tu panel y los cambios. Si WhatsApp (Meta) cobra algo por los mensajes, te lo explicamos por escrito en el diagnóstico, antes de que contrates.",
  },
  {
    q: "¿Van a tener otras automatizaciones?",
    a: "Hoy ofrecemos una sola: el Agente IA de WhatsApp. Más adelante vamos a sumar otras y, cuando existan, las vas a ver acá. Si necesitás algo distinto, contanos en el diagnóstico y te decimos con honestidad si lo podemos hacer.",
  },
];
