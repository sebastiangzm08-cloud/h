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
  | "banco";

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
    plazo: "1 a 2 semanas",
    desde: 385000,
  },
  {
    id: "N3",
    nombre: "Inteligente",
    definicion:
      "Lectura de documentos, clasificación, decisiones y agentes de IA.",
    ejemplo: "Foto de factura → datos extraídos → contabilidad",
    plazo: "2 a 4 semanas",
    desde: 720000,
  },
  {
    id: "N4",
    nombre: "Sistema",
    definicion:
      "Varios flujos conectados, panel propio, migración de datos, API.",
    ejemplo: "Operación completa de pedidos de punta a punta",
    plazo: "4 a 8 semanas",
    desde: null,
  },
] as const;

/* -------------------------------------------------------------------------
   Planes. Setup único + mensualidad.
   ------------------------------------------------------------------------- */
export const planes = [
  {
    id: "starter",
    nombre: "Starter",
    para: "Validar con un proceso",
    setup: 285000,
    mensual: 38000,
    destacado: false,
    limites: [
      ["Automatizaciones activas", "1 a 2"],
      ["Ejecuciones por mes", "2.000"],
      ["Integraciones", "3"],
      ["Cambios incluidos", "—"],
      ["Soporte", "Correo, 72 h"],
      ["Monitoreo", "Básico"],
    ],
    incluye: [
      "Diagnóstico y mapa de procesos",
      "Portal con métricas de ahorro",
      "Documentación y video de uso",
      "Alertas automáticas si un flujo falla",
    ],
    cta: "directo",
  },
  {
    id: "growth",
    nombre: "Growth",
    para: "El negocio ya opera con flujos",
    setup: 850000,
    mensual: 125000,
    destacado: true,
    limites: [
      ["Automatizaciones activas", "Hasta 5"],
      ["Ejecuciones por mes", "20.000"],
      ["Integraciones", "8"],
      ["Cambios incluidos", "2 h por mes"],
      ["Soporte", "Correo, 24 h"],
      ["Monitoreo", "Con alertas"],
    ],
    incluye: [
      "Todo lo de Starter",
      "Revisión mensual de rendimiento",
      "Prioridad en la cola de cambios",
      "Ajustes de flujos existentes sin costo",
    ],
    cta: "llamada",
  },
  {
    id: "scale",
    nombre: "Scale",
    para: "La operación depende de esto",
    setup: 1950000,
    mensual: 340000,
    destacado: false,
    limites: [
      ["Automatizaciones activas", "Hasta 12"],
      ["Ejecuciones por mes", "100.000"],
      ["Integraciones", "Sin límite"],
      ["Cambios incluidos", "8 h por mes"],
      ["Soporte", "WhatsApp, 8 h hábiles"],
      ["Monitoreo", "Alertas y guardia"],
    ],
    incluye: [
      "Todo lo de Growth",
      "Informe mensual con horas ahorradas",
      "Ambiente de pruebas separado",
      "Plan de continuidad documentado",
    ],
    cta: "llamada",
  },
] as const;

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
  requiere: ToolId[];
  descripcion: string;
  flujo: string[];
};

export const catalogo: Automatizacion[] = [
  {
    id: "leads-60s",
    nombre: "Lead de anuncios al CRM y a WhatsApp en 60 segundos",
    proceso: "ventas",
    nivel: "N2",
    plazo: "5 días",
    precio: 420000,
    requiere: ["ads", "crm", "whatsapp"],
    descripcion:
      "Cada contacto que deja sus datos en un anuncio entra al CRM etiquetado por campaña y le llega un primer mensaje antes de que se enfríe. Si nadie lo atiende en el plazo que definás, el sistema insiste.",
    flujo: [
      "Formulario del anuncio",
      "Validación y deduplicado",
      "Alta en el CRM",
      "Primer mensaje al cliente",
      "Recordatorio al vendedor",
    ],
  },
  {
    id: "presupuestos",
    nombre: "Seguimiento de cotizaciones sin respuesta",
    proceso: "ventas",
    nivel: "N2",
    plazo: "5 días",
    precio: 340000,
    requiere: ["crm", "correo"],
    descripcion:
      "Toda cotización enviada entra en una secuencia de seguimiento. A los tres, siete y catorce días sale un mensaje distinto, y se detiene sola cuando el cliente responde.",
    flujo: [
      "Cotización enviada",
      "Espera y verificación de respuesta",
      "Seguimiento escalonado",
      "Aviso al vendedor si hay interés",
    ],
  },
  {
    id: "recordatorio-citas",
    nombre: "Recordatorios de cita con confirmación",
    proceso: "ventas",
    nivel: "N1",
    plazo: "4 días",
    precio: 185000,
    requiere: ["calendario", "whatsapp"],
    descripcion:
      "Recordatorio automático 24 horas antes con opción de confirmar o reprogramar. Las ausencias caen de forma inmediata y medible.",
    flujo: [
      "Cita en el calendario",
      "Recordatorio 24 h antes",
      "Respuesta del cliente",
      "Calendario actualizado",
    ],
  },
  {
    id: "bot-whatsapp",
    nombre: "Asistente de WhatsApp que responde y agenda",
    proceso: "atencion",
    nivel: "N3",
    plazo: "7 días",
    precio: 690000,
    requiere: ["whatsapp", "calendario"],
    descripcion:
      "Responde las preguntas frecuentes con tu propia información, agenda citas contra el calendario real y pasa la conversación a una persona cuando detecta que hace falta.",
    flujo: [
      "Mensaje entrante",
      "Interpretación de la consulta",
      "Respuesta o agenda",
      "Escalado a una persona",
    ],
  },
  {
    id: "correo-clasificado",
    nombre: "Clasificación y borradores del correo de entrada",
    proceso: "atencion",
    nivel: "N3",
    plazo: "10 días",
    precio: 780000,
    requiere: ["correo"],
    descripcion:
      "Cada correo entra etiquetado por tipo y urgencia, con un borrador de respuesta listo para revisar. Vos aprobás; nadie escribe desde cero.",
    flujo: [
      "Correo entrante",
      "Clasificación por tipo",
      "Borrador de respuesta",
      "Revisión y envío",
    ],
  },
  {
    id: "ocr-facturas",
    nombre: "Facturas y recibos a hoja de cálculo con lectura automática",
    proceso: "administracion",
    nivel: "N3",
    plazo: "10 días",
    precio: 740000,
    requiere: ["drive", "sheets"],
    descripcion:
      "Se deja el PDF o la foto en una carpeta y salen los datos estructurados: proveedor, fecha, subtotal, impuesto, total. Lo dudoso queda marcado para revisión en lugar de inventado.",
    flujo: [
      "Documento en la carpeta",
      "Lectura de los datos",
      "Validación de totales",
      "Registro en la hoja",
      "Marcado de excepciones",
    ],
  },
  {
    id: "factura-electronica",
    nombre: "Factura electrónica automática al confirmar el pago",
    proceso: "administracion",
    nivel: "N2",
    plazo: "5 días",
    precio: 395000,
    requiere: ["factura", "banco"],
    descripcion:
      "Al marcar una orden como pagada se emite el comprobante electrónico, se envía al cliente y queda archivado. Pensado para el esquema de Hacienda en Costa Rica.",
    flujo: [
      "Pago confirmado",
      "Emisión del comprobante",
      "Envío al cliente",
      "Archivo y registro",
    ],
  },
  {
    id: "recordatorio-cobros",
    nombre: "Recordatorios de cobro por SINPE",
    proceso: "administracion",
    nivel: "N2",
    plazo: "5 días",
    precio: 310000,
    requiere: ["whatsapp", "sheets"],
    descripcion:
      "Aviso antes del vencimiento, recordatorio a los tres días y aviso de suspensión a los diez, con el monto y el número de orden. Se detiene solo cuando entra el pago.",
    flujo: [
      "Vencimiento próximo",
      "Aviso con monto y orden",
      "Verificación del pago",
      "Escalado por mora",
    ],
  },
  {
    id: "onboarding-cliente",
    nombre: "Arranque de cliente nuevo completo",
    proceso: "operaciones",
    nivel: "N2",
    plazo: "7 días",
    precio: 460000,
    requiere: ["drive", "correo", "tareas"],
    descripcion:
      "Al cerrar una venta se crea la carpeta, se genera el contrato, se envían los accesos y se abre la lista de tareas del equipo. Igual todas las veces.",
    flujo: [
      "Venta cerrada",
      "Carpeta y contrato",
      "Accesos y bienvenida",
      "Tareas asignadas",
    ],
  },
  {
    id: "seguimiento-pedidos",
    nombre: "Avisos de estado de pedido al cliente",
    proceso: "operaciones",
    nivel: "N2",
    plazo: "5 días",
    precio: 380000,
    requiere: ["tienda", "whatsapp"],
    descripcion:
      "El cliente recibe un aviso en cada cambio de estado de su pedido. Las consultas de «en qué va lo mío» bajan de forma notoria.",
    flujo: [
      "Cambio de estado",
      "Mensaje al cliente",
      "Registro del envío",
    ],
  },
  {
    id: "sync-inventario",
    nombre: "Sincronización de tienda, inventario y facturación",
    proceso: "operaciones",
    nivel: "N4",
    plazo: "A cotizar",
    precio: null,
    requiere: ["tienda", "erp", "factura"],
    descripcion:
      "Una sola fuente de verdad para el stock. Depende de qué APIs expongan tus sistemas, por eso se cotiza después del diagnóstico.",
    flujo: [
      "Movimiento de stock",
      "Actualización en la tienda",
      "Registro contable",
      "Alertas de mínimos",
    ],
  },
  {
    id: "reporte-semanal",
    nombre: "Reporte semanal automático a WhatsApp o correo",
    proceso: "datos",
    nivel: "N1",
    plazo: "3 días",
    precio: 165000,
    requiere: ["sheets", "whatsapp"],
    descripcion:
      "Todos los lunes a las siete llega el resumen con los números de la semana y la comparación con la anterior. Nadie lo arma a mano.",
    flujo: [
      "Lectura de las fuentes",
      "Cálculo y comparación",
      "Envío del resumen",
    ],
  },
  {
    id: "consolidar-excel",
    nombre: "Varios archivos de Excel en un panel siempre al día",
    proceso: "datos",
    nivel: "N2",
    plazo: "5 días",
    precio: 350000,
    requiere: ["sheets", "drive"],
    descripcion:
      "Los archivos de cada sucursal, vendedor o mes se consolidan solos en un panel único, con control de duplicados y de formatos que no cuadran.",
    flujo: [
      "Archivos de origen",
      "Normalización",
      "Consolidado",
      "Panel actualizado",
    ],
  },
  {
    id: "alertas-metricas",
    nombre: "Alertas cuando una métrica se sale de rango",
    proceso: "datos",
    nivel: "N1",
    plazo: "3 días",
    precio: 155000,
    requiere: ["sheets", "correo"],
    descripcion:
      "Definís los umbrales y el sistema avisa cuando se cruzan. Se enteran el mismo día, no en el cierre de mes.",
    flujo: ["Lectura del dato", "Comparación con el umbral", "Aviso"],
  },
  {
    id: "alta-empleado",
    nombre: "Alta de personal con accesos y documentos",
    proceso: "personas",
    nivel: "N2",
    plazo: "7 días",
    precio: 420000,
    requiere: ["correo", "drive", "tareas"],
    descripcion:
      "Una sola ficha dispara la creación de cuentas, la carpeta de documentos, el envío del material de inducción y las tareas de quien lo recibe.",
    flujo: [
      "Ficha de ingreso",
      "Creación de accesos",
      "Documentos y firma",
      "Inducción asignada",
    ],
  },
  {
    id: "solicitudes-internas",
    nombre: "Solicitudes de vacaciones y ausencias",
    proceso: "personas",
    nivel: "N1",
    plazo: "4 días",
    precio: 175000,
    requiere: ["correo", "calendario"],
    descripcion:
      "La solicitud entra por un formulario, va a quien tiene que aprobarla y, si se aprueba, cae en el calendario del equipo. Con registro de todo.",
    flujo: [
      "Solicitud",
      "Aprobación",
      "Calendario del equipo",
      "Registro",
    ],
  },
];

/* -------------------------------------------------------------------------
   Síntomas para la home. El eje que reemplaza al nicho.
   ------------------------------------------------------------------------- */
export const sintomas = [
  "Alguien copia los mismos datos de un sistema a otro todos los días.",
  "El mismo mensaje se contesta cuarenta veces al día.",
  "Los contactos que entran de noche se atienden dos días después.",
  "El cierre de mes se hace persiguiendo facturas en tres carpetas.",
  "Los problemas se descubren cuando el cliente ya reclamó.",
];

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
    q: "¿De quién son las automatizaciones si dejo de pagar?",
    a: "Tuyas. Te las entregamos exportadas y documentadas. La mensualidad paga el monitoreo, el mantenimiento y los cambios, no el derecho a usarlas.",
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
    a: "Las mensualidades por SINPE Móvil y los proyectos por transferencia bancaria, según el tope de tu banco. Al confirmar el pago se emite la factura electrónica. Si preferís pago anual, son diez meses en lugar de doce.",
  },
  {
    q: "¿Los precios incluyen las licencias de las herramientas?",
    a: "El motor de automatización va incluido. Las licencias de tus propias herramientas (el CRM, la API de WhatsApp, los créditos de IA cuando aplican) las paga el cliente y quedan a tu nombre. Te decimos el costo exacto en el presupuesto, sin sorpresas.",
  },
  {
    q: "¿Cuánto tarda?",
    a: "Entre dos días y ocho semanas, según el nivel del flujo. La tabla de niveles de la página de planes tiene el detalle.",
  },
];
