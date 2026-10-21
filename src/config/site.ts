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
  claim: "Tu WhatsApp atiende y agenda, a cualquier hora",
  url: "https://hoshizora.agency",

  /* TEMA DEL SITIO. Cambiá esta palabra y se invierte la web entera:
       "mixto"  → fondo claro con secciones oscuras alternadas
       "oscuro" → todo oscuro
     No hay que tocar ninguna sección: los colores salen de tokens. */
  tema: "oscuro" as "mixto" | "oscuro",

  /* SITIO EN INGLÉS (/en). APAGADO el 2026-10-20 por decisión de Sebastian:
     por ahora solo se vende en Costa Rica. Con false:
       - toda URL /en... redirige (307, temporal) a su par en español;
       - nadie de EE. UU. se manda al inglés ni con ?lang=en;
       - el sitemap y los hreflang dejan de anunciar el inglés;
       - la página de error no ofrece "Back to the English site".
     Las páginas siguen en src/app/(en): poné true y vuelve todo. */
  sitioIngles: false,

  /* Aviso superior de "esto es un borrador". Poné true para volver a mostrarlo. */
  mostrarAvisoBorrador: false,

  /* Evita que Google indexe el sitio mientras está en borrador (precios y
     contenido de ejemplo). Poné false cuando esté listo para lanzar. */
  noIndexar: false,

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
    // APAGADO el 2026-10-20 por decisión de Sebastian: no está en el
    // contrato y choca con el precio fundador y el mínimo de 3 meses. Con
    // false desaparece el selector de /planes y /diagnostico, y las órdenes
    // `*-anual` responden 404. Para volver a ofrecerlo, poné true.
    pagoAnual: false,
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

  /* PRECIO DE FUNDADOR (decisión de Sebastian, 2026-10-20). Solo las
     primeras clínicas, en colones. Se paga desde el primer mes (no hay mes
     gratis) y se mantiene mientras no cancelen: si cancelan, se pierde.

     ⚠️ CADA VEZ QUE SE CIERRA UN FUNDADOR, SUMAR 1 A `ocupados`.
     Cuando ocupados = cupos, el sitio vuelve solo al precio regular y
     muestra "Cupos de fundador agotados". */
  fundador: {
    precio: 50000,
    cupos: 3,
    ocupados: 0,
  },

  /* Días del ciclo de cobro manual (alimenta el flujo de recordatorios) */
  cobro: {
    avisoPrevioDias: 3,
    primerRecordatorioDias: 3,
    avisoSuspensionDias: 2,
  },
} as const;

/** Cupos de fundador que quedan (0 = agotados). */
export function cuposFundador() {
  return Math.max(0, site.fundador.cupos - site.fundador.ocupados);
}

/** Mensualidad que paga hoy una clínica nueva en colones: la de fundador
    mientras queden cupos, la regular después. */
export function mensualVigente(regular: number) {
  return cuposFundador() > 0 ? site.fundador.precio : regular;
}

export function waLink(mensaje: string) {
  return `https://wa.me/${site.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

export function colones(n: number) {
  return "₡" + n.toLocaleString("es-CR");
}

/** Dólares para el sitio en inglés: `US$397`. */
export function dolares(n: number) {
  return "US$" + n.toLocaleString("en-US");
}

/** Precio de un plan en su propia moneda: ₡125.000 o US$397. */
export function precioDe(moneda: "CRC" | "USD", n: number) {
  return moneda === "USD" ? dolares(n) : colones(n);
}
