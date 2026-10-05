/* ==========================================================================
   Contenido del sitio en INGLÉS (EE. UU.). Misma forma que `content.ts`:
   `planes`, `automatizaciones` y `faq`, con los mismos tipos.

   La oferta para EE. UU. la decidió Sebastián (2026-10-04):
   - UN solo plan, "AI Agent", US$397/mes.
   - Instalación US$500, bonificada si firma el mismo día de su demo.
   - Permanencia mínima de 3 meses.
   - SIN piloto ni prueba gratis. SIN costos de Meta/WhatsApp en el sitio.
   - SIN cifras de resultados ni testimonios.

   Todo lo que diga "agent" tiene que existir en el producto real.
   ========================================================================== */
import type {
  AutomatizacionPublica,
  FaqItem,
  PlanPublico,
} from "@/lib/content";

export const planes: PlanPublico[] = [
  {
    id: "ai-agent",
    nombre: "AI Agent",
    para: "Answers your WhatsApp, books appointments, and hands off what needs a person",
    mensual: 397,
    moneda: "USD",
    setup: {
      monto: 500,
      nota: "Waived if you sign up the same day as your demo.",
    },
    minimoMeses: 3,
    destacado: true,
    limites: [
      ["Included", "AI Agent for WhatsApp"],
      ["Coverage", "24 hours, 7 days"],
      ["Performance review", "Monthly"],
      ["Changes", "Priority queue"],
      ["Your dashboard", "Conversations, calendar, knowledge, results"],
    ],
    incluye: [
      "An AI agent on your WhatsApp, live and working",
      "Answers with the prices, services and hours you provide",
      "Books appointments in your open time slots",
      "Appointment reminders over WhatsApp",
      "Understands the voice notes people send",
      "Hands the chat to a person when the case needs one",
      "Your dashboard: conversations, calendar, knowledge and results",
      "Monthly performance review",
      "Priority in the change queue",
    ],
  },
];

export const automatizaciones: AutomatizacionPublica[] = [
  {
    slug: "ai-agent",
    nombre: "AI Agent for WhatsApp",
    plan: "AI Agent",
    precio: 397,
    gancho: "Answers your WhatsApp, books appointments, hands off what needs a person.",
    descripcion:
      "Replies on WhatsApp at any hour using the information you gave it, books appointments in your open time slots, and passes the chat to a person when the case calls for it. You see everything in your dashboard.",
    puntos: [
      "Replies right away: days, nights and weekends",
      "Answers prices, services and hours from your own data, without making things up",
      "Books appointments in genuinely open slots and sends reminders",
      "Understands the voice notes people send",
      "Hands the conversation to a person when the case calls for it",
      "Your dashboard: conversations, calendar, knowledge and results",
    ],
  },
];

export const faq: FaqItem[] = [
  {
    q: "What does the AI Agent actually do?",
    a: "It handles your WhatsApp around the clock: it answers questions using the prices, services and hours you gave it, books appointments in your open time slots, sends appointment reminders, understands voice notes, and hands off to a person the cases that need one. Every conversation shows up in your dashboard.",
  },
  {
    q: "Who is it for?",
    a: "Businesses that work by appointment and already talk to their customers on WhatsApp: dental and medical clinics, veterinary practices, and other service businesses. On the diagnostic call we confirm whether it fits before you pay anything.",
  },
  {
    q: "What if the agent doesn't know something?",
    a: "It doesn't make it up. If something isn't in what you gave it, it asks or hands the chat to a person, and it's noted in your dashboard so you can teach it once and it won't ask again.",
  },
  {
    q: "Can I see and take over conversations?",
    a: "Yes. In your dashboard you see every conversation, the calendar and the results. Whenever you want, you take a chat over and continue yourself, then hand it back to the agent.",
  },
  {
    q: "Do I need someone technical on my team?",
    a: "No. We need you to tell us your services, prices and hours, and to give us access to your WhatsApp number during setup. Day to day, you work from your dashboard.",
  },
  {
    q: "How long until it's live?",
    a: "Up to about a week, depending on how ready your information is (services, prices, hours) and access to your number. We confirm it on the diagnostic call.",
  },
  {
    q: "How does pricing work?",
    a: "The AI Agent is US$397 per month. There is a one-time setup fee of US$500, waived if you sign up the same day as your demo. The plan has a 3-month minimum commitment, and we put the terms in writing before you sign.",
  },
  {
    q: "What happens if something goes wrong?",
    a: "The status of your WhatsApp connection is visible in your dashboard, and you can message us from there. Fixes are included in the monthly price.",
  },
  {
    q: "Where is my data stored?",
    a: "Conversations, contacts and appointments are stored in a database with per-account access, so each business sees only its own. The agent uses an AI model from an outside provider to write its replies.",
  },
  {
    q: "Will you offer other automations?",
    a: "Today we offer one thing: the AI Agent for WhatsApp. We plan to add others, and when they exist you'll see them here. If you need something different, tell us on the diagnostic call and we'll be straight about whether we can do it.",
  },
];
