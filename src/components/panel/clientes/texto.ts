/* ==========================================================================
   Búsqueda de texto de las listas del entorno del agente. Pura, sin
   dependencias de servidor: la usan componentes de cliente.
   ========================================================================== */

/** Minúsculas y sin tildes: "María" y "maria" tienen que coincidir. */
export function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

export function soloDigitos(texto: string) {
  return texto.replace(/\D/g, "");
}

/** Lo que se compara contra la consulta: nombre, teléfono (con y sin
    formato) y etiquetas. Se arma en el servidor y viaja ya listo. */
export function textoBusqueda(nombre: string, telefono: string, etiquetas: string[]) {
  return normalizar([nombre, telefono, soloDigitos(telefono), ...etiquetas].join(" "));
}

/** Cada palabra de la consulta tiene que aparecer. "8712-4409" encuentra el
    teléfono aunque esté guardado con espacios o con "+506". */
export function coincide(busqueda: string, consulta: string) {
  const q = normalizar(consulta);
  if (!q) return true;
  return q.split(/\s+/).every((palabra) => {
    if (busqueda.includes(palabra)) return true;
    const digitos = soloDigitos(palabra);
    return digitos.length >= 3 && busqueda.includes(digitos);
  });
}
