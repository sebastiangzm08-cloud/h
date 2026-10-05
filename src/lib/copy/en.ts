/* ==========================================================================
   Site copy in ENGLISH (United States). Same shape as `es.ts` (type `Copy`).

   Written as natural US marketing English, not a literal translation. Dental,
   medical and veterinary clinics, plus service businesses that already use
   WhatsApp with their customers.

   Offer (decided by Sebastián, 2026-10-04): ONE plan, "AI Agent", US$397 a
   month. Setup US$500, waived if you sign up the same day as your demo.
   3-month minimum commitment. No pilot or free trial shown. No Meta/WhatsApp
   fees shown. No result figures and no testimonials.
   ========================================================================== */
import type { Copy } from "./es";

export const en: Copy = {
  idioma: "en",

  /* ---- Navigation ---- */
  nav: {
    inicio: "/en",
    irInicio: "Hoshizora, go to the home page",
    menuPrincipal: "Main",
    links: [
      { href: "/en/what-we-automate", label: "The AI Agent" },
      { href: "/en/plans", label: "Plan" },
      { href: "/en/about", label: "About" },
      { href: "/en/contact", label: "Contact" },
    ],
    panel: "",
    panelHref: "",
    cta: { href: "/en/diagnostic", label: "Book your diagnostic" },
    abrirMenu: "Open menu",
    cerrarMenu: "Close menu",
    selectorIdioma: "Language",
    cambiarA: {
      es: "Ver el sitio en español",
      en: "View the site in English",
    },
  },

  /* ---- Footer ---- */
  footer: {
    claim: "Your WhatsApp answers and books, around the clock",
    ubicacion: "San José, Costa Rica",
    columnas: [
      {
        titulo: "Product",
        links: [
          { href: "/en/what-we-automate", label: "The AI Agent" },
          { href: "/en/plans", label: "Plan and pricing" },
          { href: "/en/diagnostic", label: "Free diagnostic" },
        ],
      },
      {
        titulo: "Company",
        links: [
          { href: "/en/about", label: "About" },
          { href: "/en/contact", label: "Contact" },
        ],
      },
      {
        titulo: "Legal",
        links: [
          { href: "/legal/privacidad", label: "Privacy policy (Spanish)" },
          { href: "/legal/terminos", label: "Terms of service (Spanish)" },
          { href: "/legal/sla", label: "Service-level agreement (Spanish)" },
        ],
      },
    ],
    derechos: "All rights reserved.",
    notaLegal: "Legal terms available in Spanish.",
  },

  /* ---- Home: hero ---- */
  hero: {
    insignia: "AI Agent for WhatsApp",
    titulo1: "Your WhatsApp answers and books.",
    titulo2: "You get on with your day.",
    bajada:
      "An AI agent that replies at any hour with your prices and services, books appointments in your open slots, and brings you in only when a person is needed. Built for clinics, vet practices and service businesses that already use WhatsApp with customers.",
    ctaPrincipal: { href: "/en/diagnostic", label: "Book your diagnostic" },
    ctaSecundario: { href: "#agente", label: "See how it works" },
    garantias: ["Free diagnostic", "Answers 24/7", "Setup waived on demo day"],
  },

  /* ---- Capabilities ticker ---- */
  cinta: {
    titulo: "What your agent does every day",
    items: [
      "Answers 24/7",
      "Prices and services from your data",
      "Books in your open slots",
      "Appointment reminders",
      "Understands voice notes",
      "Hands off what needs a person",
      "Dashboard with conversations and results",
    ],
  },

  /* ---- Hero analyzer animation ---- */
  analizador: {
    cabecera: "AI analyzer",
    leyendo: "Building your agent",
    recomendacion: "How it would help",
    nombreAgente: "AI Agent for WhatsApp",
    incluido: "Included in the AI Agent plan",
    escenarios: [
      {
        rubro: "Dental clinic",
        cita: "We confirm appointments one by one by phone, every single day.",
        nodos: ["Message", "AI Agent", "Calendar"],
        resultado: "Books the appointments and sends the reminder on WhatsApp",
      },
      {
        rubro: "Vet practice",
        cita: "People text us at night about vaccines and prices, and we answer the next day.",
        nodos: ["Message", "AI Agent", "Calendar"],
        resultado: "Answers prices and services right away and books the visit",
      },
      {
        rubro: "Medical office",
        cita: "Our front desk spends the day answering the same hours and prices.",
        nodos: ["Message", "AI Agent", "Your team"],
        resultado: "Answers from your data and hands you only the sensitive cases",
      },
      {
        rubro: "Aesthetics clinic",
        cita: "People send voice notes asking about prices and we can't always listen to them.",
        nodos: ["Voice note", "AI Agent", "Reply"],
        resultado: "Understands voice notes and answers with your prices",
      },
      {
        rubro: "Physical therapy",
        cita: "We lose patients because we answer late on weekends.",
        nodos: ["Message", "AI Agent", "Calendar"],
        resultado: "Covers weekends and books into your open slots",
      },
    ],
  },

  /* ---- Home: the AI Agent ---- */
  agente: {
    id: "agente",
    eyebrow: "The AI Agent",
    titulo: "An agent that handles your WhatsApp the way you would",
    lead: "It answers when you can't: at night, on weekends, or when the waiting room is full. And when a case needs a person, it hands it to you.",
    verPlan: "See the plan and pricing",
    chat: {
      etiqueta: "Illustrative example",
      negocio: "Bright Smile Dental",
      estado: "AI Agent",
      nota: "Sample conversation with made-up details for illustration.",
      mensajes: [
        { de: "cliente", texto: "Hi, how much is a teeth cleaning?", hora: "11:42 PM" },
        { de: "agente", texto: "Hi there! A cleaning is $120 and takes about 40 minutes. Want me to find you an appointment?", hora: "11:42 PM" },
        { de: "cliente", texto: "Yes please", hora: "11:43 PM" },
        { de: "agente", texto: "I have these openings: Tuesday 9:00 AM, Wednesday 2:30 PM, or Thursday 10:00 AM. Which works?", hora: "11:43 PM" },
        { de: "cliente", texto: "Wednesday", hora: "11:44 PM" },
        { de: "agente", texto: "Done, you're booked for Wednesday at 2:30 PM. I'll send you a reminder beforehand.", hora: "11:44 PM" },
      ],
    },
    capacidades: [
      {
        icono: "reloj",
        titulo: "Replies right away, at any hour",
        texto: "Nights, weekends, or a full schedule. Nobody waits hours for an answer.",
      },
      {
        icono: "libro",
        titulo: "Answers from your own data",
        texto: "The prices, services and hours you gave it. If something isn't there, it doesn't guess: it asks.",
      },
      {
        icono: "agenda",
        titulo: "Books into your open slots",
        texto: "It offers only genuinely open times and confirms the appointment. Then it sends reminders.",
      },
      {
        icono: "persona",
        titulo: "Hands off the sensitive cases",
        texto: "When a conversation needs a person, it passes it to you with everything already said.",
      },
    ],
    extras: ["Understands voice notes", "Appointment reminders", "Take over any chat"],
    pasos: {
      eyebrow: "How it works",
      titulo: "Live in four simple steps",
      items: [
        {
          t: "We talk for 30 minutes",
          d: "On the diagnostic call we learn how you handle messages today and what slips through.",
        },
        {
          t: "We load what you know",
          d: "Your services, prices, hours, and the questions people ask most.",
        },
        {
          t: "We connect your WhatsApp",
          d: "It connects to your business number, so customers keep texting the same place.",
        },
        {
          t: "It answers; you see everything",
          d: "From day one you see every conversation in your dashboard. If it didn't know something, you teach it once.",
        },
      ],
    },
    panel: {
      eyebrow: "Your dashboard",
      titulo: "See what happened without asking anyone",
      lead: "Everything the agent does stays in plain view. And whatever it does, you can do by hand.",
      items: [
        {
          icono: "chat",
          t: "Conversations",
          d: "Read everything the agent said. Whenever you want, take over the chat and continue yourself.",
        },
        {
          icono: "agenda",
          t: "Calendar",
          d: "The appointments the agent booked and the ones you add by hand, in one place.",
        },
        {
          icono: "libro",
          t: "Knowledge",
          d: "Your services, prices and hours, which you edit. What isn't here, the agent doesn't make up.",
        },
        {
          icono: "grafica",
          t: "Results",
          d: "Where customers drop off, what's booked, and who is worth following up with.",
        },
      ],
    },
    cierre: {
      titulo: "Want to see it with your business?",
      texto: "On the diagnostic call, about 30 minutes and free, we check whether the agent fits and what it would look like live.",
      cta: { href: "/en/diagnostic", label: "Book your diagnostic" },
      enlace: { href: "/en/what-we-automate#advisor", label: "Or describe your business and try the advisor" },
    },
  },

  /* ---- Plan ---- */
  plan: {
    resumen: {
      eyebrow: "Plan",
      titulo: "One plan. Simple pricing.",
      lead: "The full AI Agent, live and working, with your dashboard.",
      verTodo: "See the full plan",
    },
    tarjeta: {
      recomendado: "One plan",
      cta: "Book your diagnostic",
      verAgente: "See what the agent does",
      mes: "/ month",
      anio: "/ year",
      equivale: (meses: number) => `Equals ${meses} months`,
      setupEtiqueta: "One-time setup",
      minimoEtiqueta: "Minimum commitment",
      minimoValor: (meses: number) => `${meses} months`,
    },
    periodo: {
      etiqueta: "Billing period",
      mensual: "Monthly",
      anual: "Annual",
    },
    pagina: {
      eyebrow: "Plan",
      titulo: "One plan, with the price in plain sight",
      lead: "One ongoing plan with the AI Agent for WhatsApp included. No need to get on a call just to see what it costs.",
      comoEmpezamos: "How we start",
      pasos: [
        "You book the free diagnostic (about 30 minutes) and see a demo.",
        "We load your services, prices and hours, and connect your number.",
        "The agent starts answering and you see everything in your dashboard.",
      ],
      nota: "Setup is US$500 one time, waived if you sign up the same day as your demo. The plan has a 3-month minimum commitment. All terms are put in writing before you sign.",
      otro: "Need something different?",
      otroLink: "Book a diagnostic",
      otroResto: "and we'll tell you honestly whether we can do it.",
    },
    modal: {
      etiqueta: (plan: string) => `Included in ${plan}`,
      aria: (plan: string) => `Automation included in ${plan}`,
      cerrar: "Close",
      verTodo: "See everything the agent does",
    },
  },

  /* ---- FAQ ---- */
  faq: {
    eyebrow: "Frequently asked questions",
    titulo: "Before you ask",
  },

  /* ---- Home closing CTA ---- */
  cta: {
    titulo: "Let's start with what costs you the most time on WhatsApp",
    texto: "Thirty minutes, free, with no obligation to sign up for anything afterward.",
    principal: { href: "/en/diagnostic", label: "Book your diagnostic" },
    secundario: { href: "/en/plans", label: "See the plan and pricing" },
  },

  /* ---- /en/what-we-automate ---- */
  queAutomatizamos: {
    eyebrow: "The AI Agent",
    titulo: "One automation, built properly",
    lead: "Today we offer one thing: the AI Agent for WhatsApp. We'd rather it work well than promise you ten things. When we add others, they'll show up here.",
    verPlan: (plan: string) => `See the ${plan} plan`,
    otro: "Need something that isn't here?",
    otroLink: "Book a diagnostic",
    otroResto: "and we'll tell you honestly whether we can do it.",
  },

  /* ---- /en/about ---- */
  nosotros: {
    eyebrow: "About",
    titulo: "An agency, not a template factory",
    lead: "Hoshizora exists to solve one specific problem: businesses that run on WhatsApp lose customers and hours by not answering in time. We build an AI agent that does it for you.",
    fundador: "Sebastián Zúñiga",
    fundadorRol: "Founder, Hoshizora",
    bio: "I build AI agents for WhatsApp for businesses that already receive their customers there and don't want to lose them by replying late. Hoshizora is that: one thing, done well, and someone who answers when something breaks.",
    principios: [
      {
        icono: "objetivo",
        t: "One thing, done well",
        d: "Today we offer a single automation: the AI Agent for WhatsApp. We'd rather it truly works than promise ten things we can't sustain.",
      },
      {
        icono: "plug",
        t: "It answers with what you give it",
        d: "The agent uses your prices, your services and your hours. If something isn't there, it doesn't make it up: it asks or hands you the case.",
      },
      {
        icono: "mano",
        t: "Direct contact, no middlemen",
        d: "You talk to the person who builds your agent, not a salesperson. Changes ship fast because there are no layers in between, and everything is in writing before we start.",
      },
    ],
    cierre: "Want to talk about your business?",
    cta: { href: "/en/diagnostic", label: "Book your diagnostic" },
  },

  /* ---- /en/contact ---- */
  contacto: {
    eyebrow: "Contact",
    titulo: "Tell us what's eating your time",
    lead: "If you already know you want an agent for your WhatsApp, book the diagnostic directly. If you're not sure yet, this is the way in.",
    correo: "Email",
    whatsapp: "WhatsApp",
    ubicacion: "Location",
    mensajeWa: "Hi, I have a question about the AI Agent for WhatsApp.",
    respuesta:
      "Typical reply time: within one business day by email, and the same day on WhatsApp during business hours (Costa Rica time).",
    form: {
      nombre: "Name",
      nombrePh: "What should we call you?",
      herramientas: "How you handle messages today",
      opcional: "(optional)",
      herramientasPh: "WhatsApp Business, the front desk phone...",
      mensaje: "Tell us what's costing you time",
      mensajePh: "E.g. we lose patients because nobody replies fast on weekends...",
      errNombre: "Please add your name.",
      errMensaje: "Tell us a bit more, at least a couple of lines.",
      enviar: "Send on WhatsApp",
      listoTitulo: "We opened WhatsApp with your message ready",
      listoTexto: "If it didn't open on its own, tap the button below.",
      abrir: "Open WhatsApp",
      wa: {
        saludo: (n: string) => `Hi, I'm ${n}.`,
        usa: (h: string) => `Here's how I handle messages today: ${h}.`,
        dolor: (m: string) => `What's costing me time: ${m}`,
      },
    },
  },

  /* ---- /en/diagnostic ---- */
  diagnostico: {
    eyebrow: "Free diagnostic",
    titulo: "Tell us how you handle WhatsApp today and we'll tell you if an agent fits",
    lead: "No cost and no obligation. In about half an hour we look at where messages and appointments slip through, show you a demo of the agent, and map out how it would work in your business.",
    teLlevas: [
      {
        t: "Where messages and bookings slip through",
        d: "How people reach you today, at what hours, and what goes unanswered.",
      },
      {
        t: "What the agent can handle, and what it can't",
        d: "Some cases need a person, and we'll tell you straight.",
      },
      {
        t: "What going live looks like",
        d: "What we need from you, how long it takes and what it costs, in writing.",
      },
    ],
    wa: {
      directo: "Prefer to just message us, without filling anything out?",
      abrir: "Open WhatsApp",
      mensaje: "Hi, I'd like the free diagnostic.",
      mensajePlan: (plan: string) => `Hi, I'd like the free diagnostic for the ${plan} plan.`,
    },
    contextoPlan: {
      eyebrow: "You're booking for",
      plan: (nombre: string) => `${nombre} plan`,
      confirmar: "Confirm on WhatsApp",
      mensaje: (nombre: string, anual: boolean, precio: string, sufijo: string) =>
        `Hi, I'd like to book a diagnostic for the ${nombre} plan (${anual ? "annual" : "monthly"}, ${precio}${sufijo}).`,
    },
    form: {
      titulo: "Tell us about your business",
      sub: "Three details and we continue on WhatsApp, so we get on the call knowing what to talk about.",
      nombre: "Your name",
      nombrePh: "What should we call you?",
      negocio: "What kind of business",
      negocioPh: "Type it or pick from the list",
      dolor: "What costs you the most time",
      dolorPh: "E.g. we reply late and patients end up going elsewhere",
      errNombre: "Please add your name.",
      errNegocio: "What does your business do?",
      errDolor: "Tell us a bit more, one line is enough.",
      verMensaje: "WhatsApp opens with this",
      abrir: "Open WhatsApp",
      rubros: [
        "Dental clinic",
        "Medical clinic",
        "Veterinary practice",
        "Med spa or aesthetics clinic",
        "Physical therapy or rehab",
        "Salon or barbershop",
        "Therapy or counseling practice",
        "Nutrition practice",
        "Gym or studio",
        "Tutoring or school",
        "Law firm",
        "Multiple locations",
      ],
      wa: {
        saludo: (n: string) => `Hi, I'm ${n}.`,
        tengo: (n: string) => `I run ${n}.`,
        dolor: (d: string) => `What costs me the most time right now: ${d}.`,
        conPlan: (plan: string) => `I'm interested in the ${plan} plan and I'd like the free diagnostic.`,
        sinPlan: "I'd like to book the free diagnostic.",
      },
    },
  },

  /* ---- AI advisor ---- */
  asesor: {
    paginaEyebrow: "Does the agent fit?",
    paginaTitulo: "Tell us about your business and we'll tell you if the agent fits",
    paginaLead:
      "A sentence or two about how you handle customers today. We'll tell you how the AI Agent would help, honestly: if it doesn't fit, we say so.",
    eyebrow: "Or tell us in your own words",
    titulo: "Describe your business and we'll tell you how the agent would help",
    sub: "A paragraph is plenty. The more you tell us about how you handle customers today, the better the answer.",
    ph: "E.g. I run a dental clinic. We book appointments on WhatsApp by hand, and people text us at night when nobody answers...",
    errCorto: "Tell us a bit more about your business, at least a sentence.",
    errGeneral: "Something went wrong. Please try again.",
    errRed: "We couldn't reach the advisor. Please try again.",
    boton: "See how it would help",
    cargando: "Analyzing…",
    cargandoSr: "Generating your answer…",
    usosTitulo: "Here's what it would do for your business",
    encaje: {
      si: "Good fit",
      parcial: "Partial fit",
      no: "Not ideal today",
    },
    planTitulo: "The plan",
    cta: "Book your diagnostic",
    aviso:
      "Generated automatically from your description. It doesn't replace the free diagnostic, which confirms exact pricing and timing.",
  },

  /* ---- Language notice (shown on the Spanish pages only) ---- */
  aviso: {
    texto: "This site is also available in English.",
    cambiar: "Switch to English",
    cerrar: "Dismiss",
    aria: "Language",
  },

  /* ---- Metadata ---- */
  meta: {
    home: {
      titulo: "Hoshizora | AI Agent for WhatsApp for clinics and appointment-based businesses",
      descripcion:
        "An AI agent that handles your WhatsApp around the clock: answers prices and services from your own data, books appointments in open slots, and hands off sensitive cases to a person. Free diagnostic.",
    },
    plan: {
      titulo: "AI Agent plan and pricing — Hoshizora",
      descripcion:
        "One plan: the AI Agent for WhatsApp at US$397 per month, with your dashboard for conversations, calendar and results. US$500 setup, waived if you sign up the same day as your demo. 3-month minimum.",
    },
    queAutomatizamos: {
      titulo: "The AI Agent for WhatsApp — Hoshizora",
      descripcion:
        "What the AI Agent does: replies at any hour, answers from your own data, books appointments in open slots, and hands off sensitive cases to a person.",
    },
    nosotros: {
      titulo: "About — Hoshizora",
      descripcion: "Who is behind Hoshizora and how we work.",
    },
    contacto: {
      titulo: "Contact — Hoshizora",
      descripcion: "Reach us by email or WhatsApp, or leave a message.",
    },
    diagnostico: {
      titulo: "Free diagnostic — Hoshizora",
      descripcion:
        "Half an hour to see where messages and appointments slip through on WhatsApp, with a demo of how an AI agent would work in your business.",
    },
    asesor: {
      titulo: "Does the AI Agent fit your business? — Hoshizora",
      descripcion:
        "Tell us in a sentence how you handle customers and we'll tell you, honestly, how the AI Agent for WhatsApp would help.",
    },
    keywords: [
      "Hoshizora",
      "AI agent for WhatsApp",
      "WhatsApp AI agent for clinics",
      "WhatsApp appointment booking",
      "AI receptionist for dental clinics",
      "AI agent for veterinary practices",
    ],
    schemaServicio: "AI agent for WhatsApp",
    organizacion: "An AI agent for WhatsApp that answers, books appointments and hands sensitive cases to a person.",
  },
};
