/* ==========================================================================
   Contrato compartido de la demo de venta (API + pantalla).

   Sin imports de servidor: lo usan tanto la ruta `/api/demo/[slug]/mensaje`
   como los componentes de `src/components/demo/`.

   REGLA: todo lo que viaja acá sale de lo que la persona escribió o de lo que
   el agente REALMENTE respondió en ese turno. Nada se inventa para llenar el
   panel de la demostración.
   ========================================================================== */

/** Mismas claves que `wa_mensajes.herramientas` en producción. */
export type Herramienta = "servicios" | "precios" | "horario" | "agenda";

export const HERRAMIENTAS: readonly Herramienta[] = ["servicios", "precios", "horario", "agenda"];

export const NOMBRE_HERRAMIENTA: Record<Herramienta, string> = {
  servicios: "Servicios",
  precios: "Precios",
  horario: "Horario",
  agenda: "Agenda",
};

/** Si el agente pasa la conversación a una persona del negocio, y por qué. */
export type Escalada = { motivo: string };

/**
 * Cita de DEMOSTRACIÓN. La demo no tiene calendario ni disponibilidad real:
 * `horario` es el texto tal cual lo dijo la persona.
 * - `propuesta`: se está coordinando, falta que la persona confirme un horario.
 * - `confirmada`: la persona dio un día y hora y los confirmó.
 */
export type CitaDemo = {
  estado: "propuesta" | "confirmada";
  servicio: string;
  horario: string;
};

export type RespuestaDemoOk = {
  ok: true;
  respuesta: string;
  mensajesRestantes: number;
  escalada: Escalada | null;
  cita: CitaDemo | null;
  herramientas: Herramienta[];
  /** Lo que tardó el servidor en generar la respuesta (medido, en ms). */
  tiempoMs: number;
};

export type RespuestaDemoError = {
  ok: false;
  error: string;
  /** `limite`: se acabaron los mensajes de prueba. `no_disponible`: la demo se apagó. */
  codigo?: "limite" | "no_disponible";
};

export type RespuestaDemo = RespuestaDemoOk | RespuestaDemoError;
