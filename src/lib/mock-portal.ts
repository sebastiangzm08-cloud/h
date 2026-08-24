/* ==========================================================================
   Datos de ejemplo del portal de cliente. En producción esto viene de
   Postgres vía Supabase, alimentado por los webhooks de ejecución de n8n.
   Ver PLAN-WEB.md, sección 10 (modelo de datos).
   ========================================================================== */

export type EstadoAutomatizacion = "activa" | "avisos" | "error" | "pausada";

export type Automatizacion = {
  id: string;
  nombre: string;
  proceso: string;
  estado: EstadoAutomatizacion;
  ejecucionesMes: number;
  ultimaEjecucion: string;
  minutosAhorradosPorEjecucion: number;
  descripcion: string;
  flujo: string[];
};

export type Ejecucion = {
  id: string;
  automatizacionId: string;
  fecha: string;
  estado: "ok" | "error";
  detalle: string;
};

export const organizacion = {
  nombre: "Panadería Los Robles S.A.",
  plan: "Growth",
  limiteEjecuciones: 20000,
  ejecucionesUsadas: 8420,
  costoHora: 3800,
  proximoCobro: "2026-09-05",
  montoProximoCobro: 125000,
  estadoPago: "al_dia" as "al_dia" | "por_vencer" | "vencido",
};

export const automatizaciones: Automatizacion[] = [
  {
    id: "leads-60s",
    nombre: "Lead de anuncios al CRM y WhatsApp",
    proceso: "Captación y ventas",
    estado: "activa",
    ejecucionesMes: 342,
    ultimaEjecucion: "hace 6 minutos",
    minutosAhorradosPorEjecucion: 6,
    descripcion:
      "Cada contacto que deja sus datos en un anuncio de Meta o Google entra al CRM etiquetado por campaña y recibe un primer mensaje automático antes de los dos minutos.",
    flujo: [
      "Formulario del anuncio",
      "Validación y deduplicado",
      "Alta en el CRM",
      "Primer mensaje al cliente",
      "Recordatorio al vendedor si no responde en 30 min",
    ],
  },
  {
    id: "recordatorio-cobros",
    nombre: "Recordatorios de cobro por SINPE",
    proceso: "Administración y finanzas",
    estado: "avisos",
    ejecucionesMes: 58,
    ultimaEjecucion: "hace 2 horas",
    minutosAhorradosPorEjecucion: 12,
    descripcion:
      "Avisa a los clientes con facturas próximas a vencer y escala el mensaje si no se confirma el pago en los días definidos.",
    flujo: [
      "Vencimiento próximo",
      "Aviso con monto y número de orden",
      "Verificación del pago",
      "Escalado por mora",
    ],
  },
  {
    id: "reporte-semanal",
    nombre: "Reporte semanal a WhatsApp",
    proceso: "Datos y reportes",
    estado: "activa",
    ejecucionesMes: 4,
    ultimaEjecucion: "hace 3 días",
    minutosAhorradosPorEjecucion: 45,
    descripcion:
      "Todos los lunes a las siete de la mañana llega el resumen de ventas de la semana con la comparación contra la semana anterior.",
    flujo: ["Lectura de las fuentes", "Cálculo y comparación", "Envío del resumen"],
  },
  {
    id: "ocr-facturas",
    nombre: "Facturas a hoja de cálculo",
    proceso: "Administración y finanzas",
    estado: "error",
    ejecucionesMes: 96,
    ultimaEjecucion: "hace 40 minutos",
    minutosAhorradosPorEjecucion: 8,
    descripcion:
      "Lee las facturas de proveedores que llegan por correo y las registra automáticamente en la hoja de control de gastos.",
    flujo: [
      "Documento en la carpeta",
      "Lectura de los datos",
      "Validación de totales",
      "Registro en la hoja",
    ],
  },
  {
    id: "onboarding-cliente",
    nombre: "Arranque de cliente nuevo",
    proceso: "Operaciones y entrega",
    estado: "pausada",
    ejecucionesMes: 0,
    ultimaEjecucion: "hace 12 días",
    minutosAhorradosPorEjecucion: 35,
    descripcion:
      "Al cerrar una venta se crea la carpeta del cliente, se genera el contrato y se envían los accesos correspondientes.",
    flujo: ["Venta cerrada", "Carpeta y contrato", "Accesos y bienvenida"],
  },
];

export const ejecucionesRecientes: Ejecucion[] = [
  { id: "e1", automatizacionId: "leads-60s", fecha: "Hoy, 10:42", estado: "ok", detalle: "Lead de Meta Ads registrado — María Jiménez" },
  { id: "e2", automatizacionId: "ocr-facturas", fecha: "Hoy, 10:05", estado: "error", detalle: "No se pudo leer el total del documento — revisión manual pendiente" },
  { id: "e3", automatizacionId: "leads-60s", fecha: "Hoy, 09:51", estado: "ok", detalle: "Lead de Google Ads registrado — Comercial Rovira" },
  { id: "e4", automatizacionId: "recordatorio-cobros", fecha: "Hoy, 08:00", estado: "ok", detalle: "Aviso de vencimiento enviado a 4 clientes" },
  { id: "e5", automatizacionId: "leads-60s", fecha: "Ayer, 19:22", estado: "ok", detalle: "Lead de Meta Ads registrado — Taller Esquivel" },
  { id: "e6", automatizacionId: "ocr-facturas", fecha: "Ayer, 15:10", estado: "ok", detalle: "Factura de Distribuidora Central registrada" },
];

export function calcularAhorro() {
  const minutos = automatizaciones.reduce(
    (acc, a) => acc + a.ejecucionesMes * a.minutosAhorradosPorEjecucion,
    0
  );
  const horas = minutos / 60;
  const dinero = horas * organizacion.costoHora;
  return { horas: Math.round(horas * 10) / 10, dinero: Math.round(dinero) };
}

export const estadoLabel: Record<EstadoAutomatizacion, string> = {
  activa: "Activa",
  avisos: "Con avisos",
  error: "Con error",
  pausada: "Pausada",
};

export const estadoColor: Record<EstadoAutomatizacion, string> = {
  activa: "bg-ok",
  avisos: "bg-warn",
  error: "bg-bad",
  pausada: "bg-ink-faint",
};
