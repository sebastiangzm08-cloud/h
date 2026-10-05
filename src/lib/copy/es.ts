/* ==========================================================================
   Textos del sitio público en ESPAÑOL (Costa Rica, voseo).

   Es la fuente de verdad de la FORMA: `en.ts` tiene que cumplir el mismo tipo
   (`Copy`). Si agregás un texto acá, TypeScript te obliga a traducirlo.

   Regla dura (Sebastián, 2026-10-04): hoy lo único real es el Agente IA de
   WhatsApp. No se ofrece Redes ni Prospección, no se inventan integraciones
   ni cifras ni testimonios. Si dudás de una función, no la nombres.
   ========================================================================== */

export const es = {
  idioma: "es" as "es" | "en",

  /* ---- Barra de navegación ---- */
  nav: {
    inicio: "/",
    irInicio: "Hoshizora, ir al inicio",
    menuPrincipal: "Principal",
    links: [
      { href: "/que-automatizamos", label: "El Agente IA" },
      { href: "/planes", label: "Plan" },
      { href: "/nosotros", label: "Nosotros" },
      { href: "/contacto", label: "Contacto" },
    ],
    panel: "Panel de socios",
    panelHref: "/acceso",
    cta: { href: "/diagnostico", label: "Agenda tu diagnóstico" },
    abrirMenu: "Abrir menú",
    cerrarMenu: "Cerrar menú",
    selectorIdioma: "Idioma",
    cambiarA: {
      es: "Ver el sitio en español",
      en: "View the site in English",
    },
  },

  /* ---- Pie de página ---- */
  footer: {
    claim: "Tu WhatsApp atiende y agenda, a cualquier hora",
    ubicacion: "San José, Costa Rica",
    columnas: [
      {
        titulo: "Producto",
        links: [
          { href: "/que-automatizamos", label: "El Agente IA" },
          { href: "/planes", label: "Plan y precio" },
          { href: "/mis-herramientas", label: "¿Te sirve? Probá el asesor" },
          { href: "/diagnostico", label: "Diagnóstico gratuito" },
        ],
      },
      {
        titulo: "Agencia",
        links: [
          { href: "/nosotros", label: "Nosotros" },
          { href: "/contacto", label: "Contacto" },
        ],
      },
      {
        titulo: "Legal",
        links: [
          { href: "/legal/privacidad", label: "Privacidad" },
          { href: "/legal/terminos", label: "Términos de servicio" },
          { href: "/legal/sla", label: "Acuerdo de nivel de servicio" },
        ],
      },
    ],
    derechos: "Todos los derechos reservados.",
    notaLegal: "",
  },

  /* ---- Portada: hero ---- */
  hero: {
    insignia: "Agente IA de WhatsApp",
    titulo1: "Tu WhatsApp atiende y agenda.",
    titulo2: "Vos seguís con tu día.",
    bajada:
      "Un agente de IA que contesta a cualquier hora con tus precios y servicios, agenda citas en tus horarios libres y te pasa solo los casos que necesitan a una persona. Para clínicas, veterinarias y negocios que ya atienden por WhatsApp.",
    ctaPrincipal: { href: "/diagnostico", label: "Agenda tu diagnóstico" },
    ctaSecundario: { href: "#agente", label: "Ver cómo funciona" },
    garantias: ["Diagnóstico sin costo", "Instalación sin costo", "Atiende 24/7"],
  },

  /* ---- Cinta de capacidades (reemplaza la de "herramientas") ---- */
  cinta: {
    titulo: "Lo que tu agente hace todos los días",
    items: [
      "Responde 24/7",
      "Precios y servicios con tus datos",
      "Agenda en tus horarios libres",
      "Recordatorios de citas",
      "Entiende notas de voz",
      "Te pasa lo delicado",
      "Panel con conversaciones y resultados",
    ],
  },

  /* ---- Analizador animado del hero ---- */
  analizador: {
    cabecera: "Analizador con IA",
    leyendo: "Armando tu agente",
    recomendacion: "Cómo te ayudaría",
    nombreAgente: "Agente IA de WhatsApp",
    incluido: "Incluido en el plan Agente IA",
    escenarios: [
      {
        rubro: "Clínica dental",
        cita: "Confirmamos las citas una por una por teléfono, todos los días.",
        nodos: ["Mensaje", "Agente IA", "Agenda"],
        resultado: "Agenda las citas y manda el recordatorio por WhatsApp",
      },
      {
        rubro: "Veterinaria",
        cita: "Nos escriben de noche por vacunas y precios, y contestamos hasta el día siguiente.",
        nodos: ["Mensaje", "Agente IA", "Agenda"],
        resultado: "Contesta precios y servicios al instante y agenda la visita",
      },
      {
        rubro: "Consultorio médico",
        cita: "La recepción se pasa el día contestando los mismos horarios y precios.",
        nodos: ["Mensaje", "Agente IA", "Tu equipo"],
        resultado: "Responde con tus datos y te pasa solo los casos delicados",
      },
      {
        rubro: "Clínica estética",
        cita: "Nos mandan notas de voz preguntando precios y no siempre podemos escucharlas.",
        nodos: ["Nota de voz", "Agente IA", "Respuesta"],
        resultado: "Entiende las notas de voz y contesta con tus precios",
      },
      {
        rubro: "Fisioterapia",
        cita: "Se nos pierden pacientes porque contestamos tarde los fines de semana.",
        nodos: ["Mensaje", "Agente IA", "Agenda"],
        resultado: "Atiende fines de semana y agenda en tus horarios libres",
      },
    ],
  },

  /* ---- Portada: el Agente IA (sección de valor) ---- */
  agente: {
    id: "agente",
    eyebrow: "El Agente IA",
    titulo: "Un agente que atiende tu WhatsApp como lo harías vos",
    lead: "Contesta cuando vos no podés: de noche, en fin de semana o con la sala llena. Y cuando un caso necesita a una persona, te lo pasa.",
    verPlan: "Ver el plan y el precio",
    chat: {
      etiqueta: "Ejemplo ilustrativo",
      negocio: "Clínica Dental Sonrisa",
      estado: "Agente IA",
      nota: "Conversación de muestra, con datos inventados para el ejemplo.",
      mensajes: [
        { de: "cliente", texto: "Hola, buenas noches. ¿Cuánto cuesta una limpieza dental?", hora: "11:42 p. m." },
        { de: "agente", texto: "¡Hola! La limpieza dental cuesta ₡30.000 y dura unos 40 minutos. ¿Querés que te busque una cita?", hora: "11:42 p. m." },
        { de: "cliente", texto: "Sí, por favor", hora: "11:43 p. m." },
        { de: "agente", texto: "Tengo estos horarios libres: martes 9:00 a. m., miércoles 2:30 p. m. o jueves 10:00 a. m. ¿Cuál te sirve?", hora: "11:43 p. m." },
        { de: "cliente", texto: "El miércoles", hora: "11:44 p. m." },
        { de: "agente", texto: "Listo, tu cita quedó agendada: miércoles 2:30 p. m. Te voy a escribir un recordatorio antes.", hora: "11:44 p. m." },
      ] as { de: "cliente" | "agente"; texto: string; hora: string }[],
    },
    capacidades: [
      {
        icono: "reloj",
        titulo: "Responde al instante, a cualquier hora",
        texto: "De noche, en fin de semana o con la agenda llena. Nadie espera horas por una respuesta.",
      },
      {
        icono: "libro",
        titulo: "Contesta con tus datos",
        texto: "Precios, servicios y horarios que vos cargaste. Si algo no está, no lo inventa: pregunta.",
      },
      {
        icono: "agenda",
        titulo: "Agenda sola, en tus horarios libres",
        texto: "Ofrece solo horarios realmente libres y confirma la cita. Después manda recordatorios.",
      },
      {
        icono: "persona",
        titulo: "Te pasa los casos delicados",
        texto: "Cuando una conversación necesita a una persona, te la pasa con todo lo que ya se habló.",
      },
    ],
    extras: ["Entiende notas de voz", "Recordatorios de citas", "Tomás el chat cuando querés"],
    pasos: {
      eyebrow: "Cómo trabaja",
      titulo: "Andando en cuatro pasos simples",
      items: [
        {
          t: "Conversamos 30 minutos",
          d: "En el diagnóstico entendemos cómo atendés hoy y qué mensajes se te escapan.",
        },
        {
          t: "Cargamos lo que sabés vos",
          d: "Tus servicios, precios, horarios y las preguntas que más te hacen.",
        },
        {
          t: "Lo conectamos a tu WhatsApp",
          d: "Se conecta al número de tu negocio, para que tus clientes sigan escribiendo ahí.",
        },
        {
          t: "Atiende y vos ves todo",
          d: "Desde el primer día ves cada conversación en tu panel. Si algo no lo sabía, se lo enseñás una vez.",
        },
      ],
    },
    panel: {
      eyebrow: "Tu panel",
      titulo: "Ves qué pasó, sin preguntarle a nadie",
      lead: "Todo lo que hace el agente queda a la vista. Y lo que hace él, lo podés hacer vos a mano.",
      items: [
        {
          icono: "chat",
          t: "Conversaciones",
          d: "Leés todo lo que habló el agente. Cuando querés, tomás el chat y seguís vos.",
        },
        {
          icono: "agenda",
          t: "Agenda",
          d: "Las citas que agendó el agente y las que cargás a mano, en un solo lugar.",
        },
        {
          icono: "libro",
          t: "Conocimiento",
          d: "Tus servicios, precios y horarios, que editás vos. Lo que no esté acá, el agente no lo inventa.",
        },
        {
          icono: "grafica",
          t: "Resultados",
          d: "Dónde se pierden clientes, qué citas hay y a quién conviene volver a escribirle.",
        },
      ],
    },
    cierre: {
      titulo: "¿Querés verlo con tu negocio?",
      texto: "En el diagnóstico, de unos 30 minutos y sin costo, vemos si el agente te sirve y cómo quedaría andando.",
      cta: { href: "/diagnostico", label: "Agenda tu diagnóstico" },
      enlace: { href: "/mis-herramientas", label: "O describí tu negocio y probá el asesor" },
    },
  },

  /* ---- Plan ---- */
  plan: {
    resumen: {
      eyebrow: "Plan",
      titulo: "Un solo plan. Sin costo de instalación.",
      lead: "El Agente IA completo y andando, con tu panel. Pagás mes a mes.",
      verTodo: "Ver el plan completo",
    },
    tarjeta: {
      recomendado: "Un solo plan",
      cta: "Agenda tu diagnóstico",
      verAgente: "Ver qué hace el agente",
      mes: "/ mes",
      anio: "/ año",
      equivale: (meses: number) => `Equivale a ${meses} meses · 2 gratis`,
      setupEtiqueta: "Instalación",
      minimoEtiqueta: "Permanencia mínima",
      minimoValor: (meses: number) => `${meses} meses`,
    },
    periodo: {
      etiqueta: "Período de pago",
      mensual: "Mensual",
      anual: "Anual · 2 meses gratis",
    },
    pagina: {
      eyebrow: "Plan",
      titulo: "Un plan, con el precio a la vista",
      lead: "Un plan de acompañamiento continuo con el Agente IA de WhatsApp incluido. Sin llamada obligatoria para ver cuánto cuesta.",
      comoEmpezamos: "Cómo empezamos",
      pasos: [
        "Agendás el diagnóstico gratuito (unos 30 minutos).",
        "Cargamos tus servicios, precios y horarios y conectamos tu número.",
        "El agente empieza a atender y vos ves todo en tu panel.",
      ],
      nota: "La instalación y puesta en marcha no tienen costo. La permanencia mínima es de 3 meses. Si WhatsApp (Meta) cobra algo por los mensajes, te lo explicamos por escrito en el diagnóstico, antes de contratar. No se cobra impuesto al valor agregado por ahora. El pago anual equivale a diez meses en lugar de doce.",
      otro: "¿Necesitás algo distinto?",
      otroLink: "Agenda un diagnóstico",
      otroResto: "y te decimos con honestidad si lo podemos hacer.",
    },
    modal: {
      etiqueta: (plan: string) => `Incluido en ${plan}`,
      aria: (plan: string) => `Automatización incluida en ${plan}`,
      cerrar: "Cerrar",
      verTodo: "Ver todo lo que hace el agente",
    },
  },

  /* ---- Preguntas frecuentes ---- */
  faq: {
    eyebrow: "Preguntas frecuentes",
    titulo: "Antes de que preguntes",
  },

  /* ---- Cierre de la portada ---- */
  cta: {
    titulo: "Empecemos por lo que más te quita tiempo en WhatsApp",
    texto: "Treinta minutos, sin costo, sin compromiso de contratar nada después.",
    principal: { href: "/diagnostico", label: "Agenda tu diagnóstico" },
    secundario: { href: "/planes", label: "Ver el plan y el precio" },
  },

  /* ---- /que-automatizamos ---- */
  queAutomatizamos: {
    eyebrow: "El Agente IA",
    titulo: "Una automatización, hecha de verdad",
    lead: "Hoy ofrecemos una sola: el Agente IA de WhatsApp. Preferimos que funcione bien a prometerte diez cosas. Cuando sumemos otras, aparecen acá.",
    verPlan: (plan: string) => `Ver el plan ${plan}`,
    otro: "¿Necesitás algo que no está acá?",
    otroLink: "Agenda un diagnóstico",
    otroResto: "y te decimos con honestidad si lo podemos hacer.",
  },

  /* ---- /nosotros ---- */
  nosotros: {
    eyebrow: "Nosotros",
    titulo: "Una agencia, no una fábrica de plantillas",
    lead: "Hoshizora nace para resolver un problema puntual: los negocios que atienden por WhatsApp pierden clientes y horas por no contestar a tiempo. Construimos un agente con IA que lo hace por vos.",
    fundador: "Sebastián Zúñiga",
    fundadorRol: "Fundador, Hoshizora",
    bio: "Armo agentes de WhatsApp con IA para negocios de Costa Rica que ya reciben a sus clientes por ahí y no quieren perderlos por contestar tarde. Hoshizora es eso: una sola cosa, bien hecha, y alguien que responde cuando algo falla.",
    principios: [
      {
        icono: "objetivo",
        t: "Una cosa, bien hecha",
        d: "Hoy ofrecemos una sola automatización: el Agente IA de WhatsApp. Preferimos que funcione de verdad a prometerte diez cosas que no podemos sostener.",
      },
      {
        icono: "plug",
        t: "Contesta con lo que vos le cargás",
        d: "El agente usa tus precios, tus servicios y tus horarios. Si algo no está, no lo inventa: pregunta o te pasa el caso.",
      },
      {
        icono: "mano",
        t: "Trato directo, sin intermediarios",
        d: "Hablás con quien arma tu agente, no con un vendedor. Los ajustes salen rápido porque no hay capas de por medio, y todo queda por escrito antes de empezar: precio cerrado y sin costo de instalación.",
      },
    ],
    cierre: "¿Charlamos sobre tu negocio?",
    cta: { href: "/diagnostico", label: "Agenda tu diagnóstico" },
  },

  /* ---- /contacto ---- */
  contacto: {
    eyebrow: "Contacto",
    titulo: "Contanos qué te está quitando tiempo",
    lead: "Si ya sabés que querés un agente para tu WhatsApp, mejor agendá directo el diagnóstico. Si todavía no estás seguro, este es el camino.",
    correo: "Correo",
    whatsapp: "WhatsApp",
    ubicacion: "Ubicación",
    mensajeWa: "Hola, tengo una consulta sobre el Agente IA de WhatsApp.",
    respuesta:
      "Tiempo de respuesta habitual: dentro de un día hábil por correo, y el mismo día por WhatsApp en horario laboral.",
    form: {
      nombre: "Nombre",
      nombrePh: "Como te gusta que te llamen",
      herramientas: "Cómo atendés hoy tus mensajes",
      opcional: "(opcional)",
      herramientasPh: "WhatsApp Business, el celular de la recepción...",
      mensaje: "Contanos qué te está costando tiempo",
      mensajePh: "Ej: perdemos pacientes porque nadie contesta rápido los fines de semana...",
      errNombre: "Falta el nombre.",
      errMensaje: "Contanos un poco más, al menos dos líneas.",
      enviar: "Enviar por WhatsApp",
      listoTitulo: "Te abrimos WhatsApp con tu mensaje listo",
      listoTexto: "Si no se abrió solo, tocá el botón de abajo.",
      abrir: "Abrir WhatsApp",
      wa: {
        saludo: (n: string) => `Hola, soy ${n}.`,
        usa: (h: string) => `Hoy atiendo así: ${h}.`,
        dolor: (m: string) => `Lo que me está costando tiempo: ${m}`,
      },
    },
  },

  /* ---- /diagnostico ---- */
  diagnostico: {
    eyebrow: "Diagnóstico gratuito",
    titulo: "Contanos cómo atendés tu WhatsApp y te decimos si un agente te sirve",
    lead: "Sin costo y sin compromiso. En media hora vemos por dónde se te escapan mensajes y citas, y cómo quedaría el agente en tu negocio.",
    teLlevas: [
      {
        t: "Dónde se te escapan mensajes y citas",
        d: "Cómo te escribe la gente hoy, a qué hora, y qué se queda sin contestar.",
      },
      {
        t: "Qué puede resolver el agente y qué no",
        d: "Hay casos que necesitan a una persona, y te lo vamos a decir de frente.",
      },
      {
        t: "Cómo quedaría andando",
        d: "Qué hace falta de tu parte, cuánto tarda y cuánto cuesta, por escrito.",
      },
    ],
    wa: {
      directo: "¿Preferís escribir directo, sin llenar nada?",
      abrir: "Abrir WhatsApp",
      mensaje: "Hola, quiero el diagnóstico gratuito.",
      mensajePlan: (plan: string) => `Hola, quiero el diagnóstico gratuito para el plan ${plan}.`,
    },
    contextoPlan: {
      eyebrow: "Estás agendando sobre",
      plan: (nombre: string) => `Plan ${nombre}`,
      confirmar: "Confirmar por WhatsApp",
      mensaje: (nombre: string, anual: boolean, precio: string, sufijo: string) =>
        `Hola, quiero agendar un diagnóstico para el plan ${nombre} (${anual ? "pago anual" : "pago mensual"}, ${precio}${sufijo}).`,
    },
    form: {
      titulo: "Contanos de tu negocio",
      sub: "Tres datos y seguimos por WhatsApp. Así llegamos a la llamada sabiendo de qué hablar.",
      nombre: "Tu nombre",
      nombrePh: "Como te gusta que te llamen",
      negocio: "A qué se dedica",
      negocioPh: "Escribilo o elegí de la lista",
      dolor: "Qué te quita más tiempo",
      dolorPh: "Ej: contestamos tarde los mensajes y se nos van los pacientes",
      errNombre: "Falta tu nombre.",
      errNegocio: "¿A qué se dedica tu negocio?",
      errDolor: "Contanos un poco más, con una línea basta.",
      verMensaje: "Se abre WhatsApp con esto",
      abrir: "Abrir WhatsApp",
      rubros: [
        "Clínica dental o consultorio",
        "Clínica médica",
        "Veterinaria",
        "Clínica estética",
        "Fisioterapia o rehabilitación",
        "Salón de belleza o barbería",
        "Psicología o terapia",
        "Nutrición",
        "Gimnasio o estudio",
        "Academia o escuela",
        "Bufete de abogados",
        "Varias sucursales",
      ],
      wa: {
        saludo: (n: string) => `Hola, soy ${n}.`,
        tengo: (n: string) => `Tengo ${n}.`,
        dolor: (d: string) => `Lo que más tiempo me quita hoy: ${d}.`,
        conPlan: (plan: string) => `Me interesa el plan ${plan} y quiero el diagnóstico gratuito.`,
        sinPlan: "Quiero agendar el diagnóstico gratuito.",
      },
    },
  },

  /* ---- /mis-herramientas (asesor de IA) ---- */
  asesor: {
    paginaEyebrow: "¿Te sirve el agente?",
    paginaTitulo: "Contanos tu negocio y te decimos si el agente te sirve",
    paginaLead:
      "Una frase sobre cómo atendés hoy a tus clientes. Te devolvemos cómo te ayudaría el Agente IA, con honestidad: si no encaja, te lo decimos.",
    eyebrow: "O contanoslo con tus palabras",
    titulo: "Describí tu negocio y te decimos cómo te ayudaría el agente",
    sub: "Un párrafo alcanza. Cuanto más contés sobre cómo atendés hoy, mejor la respuesta.",
    ph: "Ej: Tengo una clínica dental. Agendamos las citas por WhatsApp a mano y nos escriben de noche, cuando nadie contesta...",
    errCorto: "Contanos un poco más sobre tu negocio, al menos una frase.",
    errGeneral: "Algo salió mal, probá de nuevo.",
    errRed: "No se pudo conectar con el asistente. Probá de nuevo.",
    boton: "Ver cómo me ayudaría",
    cargando: "Analizando…",
    cargandoSr: "Generando tu respuesta…",
    usosTitulo: "Esto es lo que haría por tu negocio",
    encaje: {
      si: "Encaja bien",
      parcial: "Encaja en parte",
      no: "Hoy no es lo ideal",
    },
    planTitulo: "El plan",
    cta: "Agenda tu diagnóstico",
    aviso:
      "Generado automáticamente a partir de tu descripción. No sustituye el diagnóstico gratuito, que confirma precios y plazos exactos.",
  },

  /* ---- Aviso de idioma (solo se muestra a visitantes de EE. UU.) ---- */
  aviso: {
    texto: "This site is also available in English.",
    cambiar: "Switch to English",
    cerrar: "Dismiss",
    aria: "Language",
  },

  /* ---- Metadatos ---- */
  meta: {
    home: {
      titulo: "Hoshizora | Agente IA de WhatsApp para clínicas y negocios con citas",
      descripcion:
        "Un agente con IA que atiende tu WhatsApp a cualquier hora, contesta precios y servicios con tus datos, agenda citas en horarios libres y te pasa los casos delicados. Desde Costa Rica. Diagnóstico gratis.",
    },
    plan: {
      titulo: "Plan y precio del Agente IA — Hoshizora",
      descripcion:
        "Un solo plan: el Agente IA de WhatsApp por ₡125.000 al mes, con instalación sin costo, tu panel de conversaciones, agenda y resultados.",
    },
    queAutomatizamos: {
      titulo: "El Agente IA de WhatsApp — Hoshizora",
      descripcion:
        "Qué hace el Agente IA: responde a cualquier hora, contesta con tus datos, agenda citas en horarios libres y te pasa los casos delicados.",
    },
    nosotros: {
      titulo: "Nosotros — Hoshizora",
      descripcion: "Quién está detrás de Hoshizora y cómo trabajamos.",
    },
    contacto: {
      titulo: "Contacto — Hoshizora",
      descripcion: "Escribinos por correo, WhatsApp o dejanos un mensaje.",
    },
    diagnostico: {
      titulo: "Diagnóstico gratuito — Hoshizora",
      descripcion:
        "Media hora para ver por dónde se te escapan mensajes y citas en WhatsApp y cómo quedaría un agente con IA en tu negocio.",
    },
    asesor: {
      titulo: "¿Te sirve el Agente IA? — Hoshizora",
      descripcion:
        "Contanos en una frase cómo atendés a tus clientes y te decimos, con honestidad, cómo te ayudaría el Agente IA de WhatsApp.",
    },
    keywords: [
      "Hoshizora",
      "agente de WhatsApp con IA",
      "agente IA para clínicas",
      "WhatsApp para clínicas dentales",
      "agendar citas por WhatsApp",
      "automatización de WhatsApp Costa Rica",
      "agente IA veterinarias",
    ],
    schemaServicio: "Agente de IA para WhatsApp",
    organizacion: "Agente de IA para WhatsApp que atiende, agenda citas y pasa a una persona los casos delicados.",
  },
};

export type Copy = typeof es;
