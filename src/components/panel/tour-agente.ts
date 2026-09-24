/* ==========================================================================
   Pasos del recorrido guiado del Agente de WhatsApp.

   Antes vivían dentro de `agente-barra.tsx`, pegados a esa barra. Con la barra
   única del panel (Fase 1 del rediseño) el recorrido apunta a los ítems de
   ESA barra mediante `data-tour="..."`: los ids de acá tienen que existir en
   `NAV_CLIENTE` de `shell.tsx`. Si un paso apunta a algo que no está, el
   recorrido se queda mudo sin poder avanzar — por eso la lista de ids es una
   sola y compartida.
   ========================================================================== */
import type { PasoTour } from "@/components/panel/tour";

export const ID_TOUR_AGENTE = "agente-whatsapp";

export const PASOS_TOUR_AGENTE: PasoTour[] = [
  {
    selector: '[data-tour="resumen"]',
    titulo: "Inicio",
    texto: "De un vistazo: cuántos mensajes entraron, cuántas citas agendó solo y quién necesita que le contestés vos.",
  },
  {
    selector: '[data-tour="conversaciones"]',
    titulo: "Conversaciones",
    texto: "Todo lo que tu agente habla con tus clientes por WhatsApp. Si algo necesita una persona, aparece primero acá.",
  },
  {
    selector: '[data-tour="correo"]',
    titulo: "Correo",
    texto: "Si conectás tu correo, el mismo agente contesta ahí también — mismo tono, mismos datos.",
  },
  {
    selector: '[data-tour="contactos"]',
    titulo: "Clientes",
    texto: "Cada persona que te escribió, con su historial y sus citas — para agendar a mano un walk-in o una llamada también.",
  },
  {
    selector: '[data-tour="citas"]',
    titulo: "Agenda",
    texto: "La agenda que tu agente arma solo, comprobando cupo real antes de confirmar.",
  },
  {
    selector: '[data-tour="que-sabe"]',
    titulo: "Conocimiento",
    texto: "Precios, servicios y datos de tu negocio. Si algo no está acá, tu agente nunca lo inventa — pregunta.",
  },
  {
    selector: '[data-tour="correcciones"]',
    titulo: "Correcciones",
    texto: "Cuando el agente no supo algo, queda anotado acá. Se lo enseñás una vez y no lo vuelve a preguntar.",
  },
  {
    selector: '[data-tour="uso"]',
    titulo: "Uso y límites",
    texto: "Cuánto llevás consumido este mes de tu plan.",
  },
  {
    selector: '[data-tour="como-responde"]',
    titulo: "Configuración",
    texto: "La personalidad de tu agente: de vos o de usted, qué tan formal, y cuándo tiene que frenar y llamarte a vos.",
  },
  {
    selector: '[data-tour="conexion"]',
    titulo: "Conexión de WhatsApp",
    texto: "El estado real de tu número de WhatsApp — acá te enterás primero si el token venció, antes que un cliente. Listo, eso es todo el recorrido.",
  },
];
