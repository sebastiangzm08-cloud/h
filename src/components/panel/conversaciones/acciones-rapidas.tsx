"use client";

/* ==========================================================================
   ACCIONES RÁPIDAS de la caja de escribir.

   Cada acción es un componente chico e independiente (su botón + su hoja) y
   TODAS se registran en este único arreglo. Quitar una = borrar su línea
   (y, si se quiere, su archivo). Agregar una = un archivo nuevo y una línea.
   Ninguna sabe de las otras, y ninguna manda nada sola: lo que hacen es
   dejar texto en la caja para que la persona lo revise y lo envíe (la de
   agendar es la excepción visible: agenda de verdad, y lo dice en pantalla).
   ========================================================================== */
import type { ComponentType } from "react";
import { AccionAgendar } from "./accion-agendar";
import { AccionHorarios } from "./accion-horarios";
import { AccionServicios } from "./accion-servicios";
import type { PropsAccion } from "./acciones-tipos";

export const ACCIONES_RAPIDAS: { id: string; Componente: ComponentType<PropsAccion> }[] = [
  { id: "agendar", Componente: AccionAgendar },
  { id: "horarios", Componente: AccionHorarios },
  { id: "servicios", Componente: AccionServicios },
];

/**
 * La fila de acciones: una sola línea con desplazamiento horizontal suave y
 * sin barra visible. En celular la tercera asoma cortada: esa es la pista de
 * que se puede deslizar.
 */
export function BarraAcciones(props: PropsAccion) {
  if (ACCIONES_RAPIDAS.length === 0) return null;
  return (
    <div
      role="group"
      aria-label="Acciones rápidas"
      className="sin-barra flex gap-2 overflow-x-auto overscroll-x-contain px-3 pt-2.5 pb-1 sm:px-5"
    >
      {ACCIONES_RAPIDAS.map(({ id, Componente }) => (
        <Componente key={id} {...props} />
      ))}
    </div>
  );
}
