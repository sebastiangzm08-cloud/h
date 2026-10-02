import type { ConversacionAgente } from "@/lib/panel/agente";
import type { DatosAcciones } from "@/lib/panel/conversaciones";

/** Lo que recibe CADA acción rápida de la caja de escribir. */
export type PropsAccion = {
  conversacion: ConversacionAgente;
  datos: DatosAcciones;
  /**
   * Pone un texto en la caja de escribir (si ya había algo escrito, lo
   * agrega abajo sin pisarlo). La persona lo edita y lo envía: ninguna
   * acción rápida manda nada sola.
   */
  ponerEnCaja: (texto: string) => void;
};
