/* ==========================================================================
   Clases compartidas de las pantallas de Conocimiento y Configuración.

   Viven en un solo lugar para que todos los formularios se vean y se sientan
   igual: mismo campo, mismos botones, mismos estados. Reglas que obedecen:

   - Objetivos táctiles de 44 px (`min-h-11`) y `flex-none` en los botones,
     para que una fila apretada no los encoja.
   - Texto de los campos a 16 px en celular (`text-base`): por debajo de eso,
     iOS hace zoom al enfocar y descuadra toda la pantalla.
   - Un solo color de acción: el violeta del panel (`--panel-acento`).

   OJO: `cn()` es `clsx`, NO `tailwind-merge`. Si a una de estas constantes se
   le agrega otra clase de la misma propiedad (`px-4` sobre un `px-5`), cuál
   gana depende del orden del CSS generado y no de dónde se escribió. Por eso
   el relleno y el tamaño de letra tienen variantes propias (`_CHICO`, `_HORA`)
   en vez de pisarse desde afuera.
   ========================================================================== */

const BASE_CAMPO =
  "campo-hoshi w-full min-h-11 rounded-xl border border-line bg-surface py-2.5 text-base text-ink " +
  "placeholder:text-ink-faint transition-[border-color,box-shadow] duration-150 hover:border-line-strong " +
  "focus:border-[color:var(--panel-acento-borde)] focus:ring-[3px] focus:ring-[color:var(--panel-acento-fondo)] focus:outline-none " +
  "disabled:cursor-not-allowed disabled:opacity-50 sm:text-[13.5px]";

/** Campo de texto, número, área de texto. */
export const CAMPO = `${BASE_CAMPO} px-3.5`;

/** Campo de hora: relleno más chico en celular, para que "08:00 a. m." entre. */
export const CAMPO_HORA = `${BASE_CAMPO} px-2.5 sm:px-3.5`;

/** Lista desplegable: deja sitio a la flechita de la derecha. */
export const CAMPO_LISTA = `${BASE_CAMPO} appearance-none pr-10 pl-3.5`;

/** Etiqueta de un campo. */
export const ETIQUETA = "text-[12px] font-medium text-ink-mute";

/** Línea de ayuda debajo de un campo. */
export const AYUDA = "text-[11.5px] leading-snug text-ink-mute";

const BASE_BOTON =
  "inline-flex min-h-11 flex-none items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap " +
  "transition-[opacity,transform,background-color,color] duration-150 active:scale-[0.98] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50";

const TALLA = "px-5 text-[13.5px]";
const TALLA_CHICA = "px-4 text-[12.5px]";

const PRIMARIO = "bg-[color-mix(in_srgb,var(--panel-acento)_82%,black)] text-white hover:opacity-90";
const SECUNDARIO = "border border-line-strong text-ink-soft hover:bg-surface-3";
const SUAVE =
  "border border-[color:var(--panel-acento-borde)] bg-[var(--panel-acento-fondo)] text-[color:var(--panel-acento-texto)] hover:bg-[var(--panel-acento-borde)]";
const PELIGRO = "bg-bad text-paper hover:opacity-90";

/** Acción principal de un formulario o de una sección. */
export const BTN_PRIMARIO = `${BASE_BOTON} ${TALLA} ${PRIMARIO}`;

/** Acción de apoyo: cancelar, cerrar, volver. */
export const BTN_SECUNDARIO = `${BASE_BOTON} ${TALLA} ${SECUNDARIO}`;

/** Igual que `BTN_SECUNDARIO`, para filas apretadas (copiar, "Ver ahora"). */
export const BTN_SECUNDARIO_CHICO = `${BASE_BOTON} ${TALLA_CHICA} ${SECUNDARIO}`;

/** Acción de sección ("+ Agregar", "Editar"): violeta suave, no compite con Guardar. */
export const BTN_SUAVE = `${BASE_BOTON} ${TALLA} ${SUAVE}`;

/** Acción destructiva ya confirmada. */
export const BTN_PELIGRO = `${BASE_BOTON} ${TALLA} ${PELIGRO}`;
