/* ==========================================================================
   Plantillas de WhatsApp aprobadas por Meta.

   Un mensaje que el NEGOCIO inicia (nadie escribió antes, o ya pasaron más
   de 24 h desde el último mensaje de la persona) no se puede mandar como
   texto libre — Meta lo rechaza. Hace falta una plantilla ya aprobada.

   Los recordatorios de CITA son justo ese caso: se mandan un día antes,
   normalmente mucho después de la última vez que la persona escribió. Esta
   es la única plantilla que el producto necesita por ahora (los
   recordatorios MANUALES siguen siendo texto libre — ver la nota grande en
   `agente-acciones.ts` / `recordatorios-BUILDER.mjs` sobre esa limitación).

   Mismo nombre/idioma tiene que usarse en 3 lugares: acá (referencia), en
   `admin-acciones.ts` (que la manda a aprobar a la WABA de cada cliente) y
   en `Agencia Hoshizora/n8n-backups/recordatorios-BUILDER.mjs` (que la usa
   para mandar el recordatorio) — ese último vive en otro proyecto/runtime,
   así que no se puede importar este archivo ahí, se duplica el valor a
   mano y hay que tocar los dos lados si algún día cambia.
   ========================================================================== */

export const PLANTILLA_RECORDATORIO_NOMBRE = "recordatorio_cita_hoshizora";
export const PLANTILLA_RECORDATORIO_IDIOMA = "es";
export const PLANTILLA_RECORDATORIO_CUERPO =
  "Hola {{1}}, le recordamos su cita de {{2}} para el {{3}} a las {{4}}. Si necesita cambiarla, escríbanos por acá.";
export const PLANTILLA_RECORDATORIO_EJEMPLO = [
  "Andrea",
  "Limpieza dental",
  "miércoles 18 de septiembre",
  "2:00 p.m.",
];

/* -------------------------------------------------------------------------
   Recordatorios MANUALES (2026-09-15) — la persona sigue escribiendo el
   contenido, nunca el bot, pero ahora elige un TIPO en vez de un cuadro de
   texto 100% libre. Cada tipo es su propia plantilla aprobada, así que
   funciona aunque hayan pasado semanas desde el último mensaje — el "texto
   libre" de siempre se mantiene como opción aparte para lo que no calce en
   ninguno de estos tres, con la advertencia de que solo sirve dentro de las
   24 h (ver `crearRecordatorio` en agente-acciones.ts).

   Si un cliente necesita un tipo que no está acá, se agrega una entrada
   nueva a esta lista — no hay límite de cuántos puede haber.
   ------------------------------------------------------------------------- */
export type TipoRecordatorioManual = "indicacion" | "listo" | "seguimiento";

export type PlantillaRecordatorio = {
  tipo: TipoRecordatorioManual;
  etiqueta: string;
  nombrePlantilla: string;
  cuerpo: string;
  ejemplo: string[];
  /** Campos que llena la persona, en el mismo orden que los {{n}} del cuerpo. */
  campos: { nombre: string; etiqueta: string; placeholder: string }[];
  /** Arma el texto legible que se guarda en `wa_recordatorios.mensaje` (para el historial del panel). */
  armarMensaje: (valores: string[]) => string;
};

export const PLANTILLAS_RECORDATORIO_MANUAL: PlantillaRecordatorio[] = [
  {
    tipo: "indicacion",
    etiqueta: "Indicación (medicamento, cuidado)",
    nombrePlantilla: "recordatorio_indicacion_hoshizora",
    /* Meta rechazó la primera versión ("Le recordamos {{1}} cada {{2}}.") por
       tener demasiadas variables para lo corto que era el texto fijo —
       "proporción entre parámetros y palabras" (encontrado mandándola de
       verdad, no es un límite documentado con un número exacto). Se alargó
       el texto fijo alrededor de las mismas 2 variables hasta que Meta la
       aceptó. */
    cuerpo:
      "Le escribimos para recordarle su indicación de nuestra parte: {{1}}, con una frecuencia de cada {{2}}. Ante cualquier consulta, puede escribirnos por este mismo medio.",
    ejemplo: ["tomarse el antibiótico", "8 horas"],
    campos: [
      { nombre: "que", etiqueta: "Qué debe hacer", placeholder: "tomarse el antibiótico" },
      { nombre: "cada", etiqueta: "Cada cuánto", placeholder: "8 horas" },
    ],
    armarMensaje: ([que, cada]) =>
      `Le escribimos para recordarle su indicación de nuestra parte: ${que}, con una frecuencia de cada ${cada}. Ante cualquier consulta, puede escribirnos por este mismo medio.`,
  },
  {
    tipo: "listo",
    etiqueta: "Ya está listo para retirar",
    nombrePlantilla: "recordatorio_listo_hoshizora",
    cuerpo: "Su {{1}} ya está listo para retirar.",
    ejemplo: ["encargo"],
    campos: [{ nombre: "que", etiqueta: "Qué está listo", placeholder: "encargo" }],
    armarMensaje: ([que]) => `Su ${que} ya está listo para retirar.`,
  },
  {
    tipo: "seguimiento",
    etiqueta: "Seguimiento",
    nombrePlantilla: "recordatorio_seguimiento_hoshizora",
    cuerpo: "¿Cómo le fue con {{1}}? Cualquier cosa, escríbanos por acá.",
    ejemplo: ["el tratamiento"],
    campos: [{ nombre: "que", etiqueta: "Sobre qué", placeholder: "el tratamiento" }],
    armarMensaje: ([que]) => `¿Cómo le fue con ${que}? Cualquier cosa, escríbanos por acá.`,
  },
];
