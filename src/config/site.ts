/* ==========================================================================
   ÚNICO ARCHIVO QUE TENÉS QUE EDITAR PARA PONER TUS DATOS REALES.
   Datos de contacto y cobro cargados con los reales el 27/8/2026.

   OJO: todo lo que esté acá termina dentro del JavaScript que descarga el
   navegador. Aunque no se muestre en pantalla, es público. No poner nunca
   números de cuenta, claves ni nada que no quieras que se lea.
   ========================================================================== */

export const site = {
  nombre: "Hoshizora",
  /* Sin punto final: el footer se lo agrega solo (footer.tsx). Si se le pone
     acá, quedan dos puntos seguidos. */
  claim: "Tu negocio, funcionando solo. Gana tiempo y dinero",
  url: "https://hoshizora.agency",

  /* TEMA DEL SITIO. Cambiá esta palabra y se invierte la web entera:
       "mixto"  → fondo claro con secciones oscuras alternadas
       "oscuro" → todo oscuro
     No hay que tocar ninguna sección: los colores salen de tokens. */
  tema: "oscuro" as "mixto" | "oscuro",

  /* Aviso superior de "esto es un borrador". Poné true para volver a mostrarlo. */
  mostrarAvisoBorrador: false,

  /* Evita que Google indexe el sitio mientras está en borrador (precios y
     contenido de ejemplo). Poné false cuando esté listo para lanzar. */
  noIndexar: true,

  contacto: {
    email: "sebastian@hoshizora.agency",
    // Formato internacional sin signos, para el enlace wa.me
    whatsapp: "50660791641",
    whatsappVisible: "+506 6079 1641",
    ubicacion: "San José, Costa Rica",
  },

  /* Datos de cobro. Ver sección 8 del PLAN-WEB.md */
  pago: {
    sinpeMovil: "6374 0215",
    sinpeNombre: "Sebastián Zúñiga Mora",

    /* ⚠️ EL IBAN NO VA ACÁ, A PROPÓSITO.
       Todo lo que vive en este archivo se empaqueta en el JavaScript que se
       descarga el navegador: aunque no se pinte en pantalla, cualquiera lo
       lee viendo el código fuente. No hay forma de tenerlo acá "oculto".
       Los datos de transferencia se mandan por WhatsApp al confirmar el
       pedido, que además es la práctica normal y no cuesta nada. */

    moneda: "CRC",
    // No se cobra IVA por ahora: el prestador del servicio (Sebastián Zúñiga
    // Mora) aún no está registrado formalmente como contribuyente ante
    // Tributación, así que no corresponde cargarlo. No es que "ya vaya
    // incluido" en el precio — legalmente son cosas distintas. Cuando exista
    // inscripción formal, revisar este flag y el IVA sí empezaría a cobrarse
    // aparte (ver orden/[id]/page.tsx, que usa este campo para mostrar u
    // ocultar "+ IVA" junto al monto).
    ivaIncluido: true,
    iva: 0.13,
    // Antes existía un aumento del 20% a partir del segundo año — se
    // eliminó el 30/8/2026 por pedido del usuario. El precio del plan es
    // el mismo siempre, no hay "precio introductorio" que después suba.
    // Pago anual: se cobran estos meses en vez de 12 (dos meses gratis).
    mesesPagoAnual: 10,
    // Agregar una automatización a un plan ya activo no cobra
    // construcción aparte: solo sube la mensualidad, según cuánto
    // exige del servidor (campo `carga` en el catálogo), no según
    // su nivel de complejidad.
    costoAgregarPorCarga: {
      programada: 15000,
      moderada: 30000,
      continua: 50000,
    },
  },

  /* Días del ciclo de cobro manual (alimenta el flujo de recordatorios) */
  cobro: {
    avisoPrevioDias: 3,
    primerRecordatorioDias: 3,
    avisoSuspensionDias: 2,
  },
} as const;

export function waLink(mensaje: string) {
  return `https://wa.me/${site.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

export function colones(n: number) {
  return "₡" + n.toLocaleString("es-CR");
}
