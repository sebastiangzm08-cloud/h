/* ==========================================================================
   "Preguntó precio" — UN SOLO criterio para el Inicio (`agente.ts`) y para
   Resultados (`resultados-calculo.ts`). Si se cambia, se cambia acá y los dos
   se mueven juntos.

   Regex sobre el texto (o la transcripción del audio) del contacto:
   determinístico y gratis. Va con límites de palabra para que "Valeria" no
   calce con "vale". Sin imports: lo puede usar cualquiera.
   ========================================================================== */
export const REGEX_PREGUNTA_PRECIO = /\b(?:precios?|cuestan?|cu[aá]nto|valen?|cobran|tarifas?)\b|₡|colones/i;

/**
 * Pedazos para el filtro `ilike` de la base. Es un SUPERCONJUNTO del regex de
 * arriba (el `_` calza con la vocal acentuada o no); después se aplica el regex
 * de verdad. Sirve para no bajar todos los mensajes de 60 días nada más para
 * encontrar los que preguntan precio.
 */
export const PREFILTRO_PRECIO = ["precio", "cuesta", "cu_nto", "vale", "₡", "colones", "cobran", "tarifa"];

export function preguntaPrecio(texto: string | null | undefined, transcripcion: string | null | undefined) {
  return REGEX_PREGUNTA_PRECIO.test(texto || transcripcion || "");
}
