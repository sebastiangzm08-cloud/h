/* ==========================================================================
   Arma las filas de Clientes a partir de lo que ya devuelve `agente.ts`
   (contactos, citas y conversaciones). No hay columna nueva ni consulta
   nueva: se cruzan las que existen.

   Va fuera del componente de la página porque necesita "ahora"
   (`Date.now()`), y una página de React no debe leer el reloj mientras se
   dibuja.
   ========================================================================== */
import type { ClienteFila } from "@/components/panel/clientes/lista-clientes";
import { textoBusqueda } from "@/components/panel/clientes/texto";
import type { CitaAgente, ContactoAgente, ConversacionAgente } from "@/lib/panel/agente";
import { fechaCorta, relativa } from "@/lib/panel/agente-formato";

const SEMANA_MS = 7 * 86_400_000;

export type ClientesArmados = {
  filas: ClienteFila[];
  nuevosSemana: number;
  conCitaProxima: number;
  esperando: number;
};

export function armarClientes(
  contactos: ContactoAgente[],
  citas: CitaAgente[],
  conversaciones: ConversacionAgente[]
): ClientesArmados {
  const ahora = Date.now();

  /* La próxima cita sale de `citas`, no de una columna en `contactos`: si se
     guardara en los dos lados, algún día no coincidirían. Solo cuentan las
     que todavía van a pasar y no están canceladas ni cumplidas (antes se
     colaban las de ayer). Se queda con la más cercana de cada quien.
     La cita sabe el nombre del contacto (o su teléfono si no tiene), no su
     id: por eso se cruza por nombre, igual que antes. */
  const proxima = new Map<string, string>();
  for (const c of citas) {
    if (c.estado !== "confirmada" && c.estado !== "sin_confirmar") continue;
    const cuando = new Date(c.cuando).getTime();
    if (cuando < ahora) continue;
    const actual = proxima.get(c.nombre);
    if (!actual || cuando < new Date(actual).getTime()) proxima.set(c.nombre, c.cuando);
  }

  /* La última conversación de cada quien. */
  const ultima = new Map<string, ConversacionAgente>();
  for (const v of conversaciones) {
    const actual = ultima.get(v.contactoId);
    if (!actual || new Date(v.ultimoEn).getTime() > new Date(actual.ultimoEn).getTime()) {
      ultima.set(v.contactoId, v);
    }
  }

  let conCitaProxima = 0;
  const filas: ClienteFila[] = contactos.map((c) => {
    const cita = proxima.get(c.nombre || c.telefono || "Sin nombre") ?? null;
    if (cita) conCitaProxima += 1;
    const conversacion = ultima.get(c.id) ?? null;
    return {
      id: c.id,
      nombre: c.nombre,
      telefono: c.telefono,
      estado: c.estado,
      etiquetas: c.etiquetas,
      actividad: conversacion ? relativa(conversacion.ultimoEn) : `Registrado ${relativa(c.creadoEn)}`,
      proxima: cita ? fechaCorta(cita) : null,
      conversacionId: conversacion?.id ?? null,
      busqueda: textoBusqueda(c.nombre, c.telefono, c.etiquetas),
    };
  });

  return {
    filas,
    nuevosSemana: contactos.filter((c) => ahora - new Date(c.creadoEn).getTime() < SEMANA_MS).length,
    conCitaProxima,
    esperando: conversaciones.filter((v) => v.estado === "espera").length,
  };
}
