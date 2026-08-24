/* ==========================================================================
   ÚNICO ARCHIVO QUE TENÉS QUE EDITAR PARA PONER TUS DATOS REALES.
   Todo lo marcado como PLACEHOLDER es inventado para el prototipo.
   ========================================================================== */

export const site = {
  nombre: "Hoshizora Studio",
  claim: "Automatización de procesos para negocios que ya usan tecnología",
  url: "https://hoshizora.studio", // PLACEHOLDER

  /* Aviso superior de "esto es un borrador". Poné false para quitarlo. */
  mostrarAvisoBorrador: true,

  /* Evita que Google indexe el sitio mientras está en borrador (precios y
     contenido de ejemplo). Poné false cuando esté listo para lanzar. */
  noIndexar: true,

  contacto: {
    email: "hola@hoshizora.studio", // PLACEHOLDER
    // Formato internacional sin signos, para el enlace wa.me
    whatsapp: "50687124093", // PLACEHOLDER
    whatsappVisible: "+506 8712 4093", // PLACEHOLDER
    ubicacion: "San José, Costa Rica",
  },

  /* Datos de cobro. Ver sección 8 del PLAN-WEB.md */
  pago: {
    sinpeMovil: "8712 4093", // PLACEHOLDER
    sinpeNombre: "Sebastián G. — Hoshizora Studio", // PLACEHOLDER
    iban: "CR00 0000 0000 0000 0000 00", // PLACEHOLDER
    banco: "Banco Nacional", // PLACEHOLDER
    // Tope por transacción de SINPE Móvil de TU banco. Verificalo.
    topeSinpeMovil: 100000,
    moneda: "CRC",
    ivaIncluido: false, // los precios se muestran "+ IVA 13%"
    iva: 0.13,
  },

  /* Días del ciclo de cobro manual (alimenta el flujo de recordatorios) */
  cobro: {
    avisoPrevioDias: 3,
    primerRecordatorioDias: 3,
    avisoSuspensionDias: 10,
  },
} as const;

export function waLink(mensaje: string) {
  return `https://wa.me/${site.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

export function colones(n: number) {
  return "₡" + n.toLocaleString("es-CR");
}
