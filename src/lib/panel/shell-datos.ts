/* ==========================================================================
   Lo que el armazón del panel necesita saber de un CLIENTE: qué tiene
   contratado (decide el menú), los números de las pastillas y la tarjeta del
   plan. Lo piden los dos layouts que dibujan el armazón — `(panel)` y
   `(agente)` — y por eso vive acá: si cada uno lo armara por su cuenta, el
   menú se vería distinto según por dónde se entró.
   ========================================================================== */
import type { ModulosCliente, PlanTarjeta } from "@/components/panel/shell";
import { getContadoresAgente, getMensajesAgenteMes } from "./agente";
import { getAsignaciones, getContadoresCliente } from "./datos";
import type { Asignacion, Cliente } from "./tipos";

/* Mismo respaldo que la pantalla "Uso y límites" del Agente (y el nodo
   "¿Cuántos van?" del workflow de n8n): si la asignación no trae tope, 4000. */
const TOPE_MENSAJES_AGENTE = 4000;

export type DatosShellCliente = {
  asignaciones: Asignacion[];
  agente: Asignacion | null;
  modulos: ModulosCliente;
  contadores: Record<string, number>;
  plan: PlanTarjeta;
};

export async function getDatosShellCliente(
  clienteId: string | null,
  cliente: Cliente
): Promise<DatosShellCliente> {
  const asignaciones = await getAsignaciones();
  const porSlug = (slug: string) =>
    asignaciones.find((a) => a.automatizacion.slug === slug) ?? null;
  const redes = porSlug("redes-sociales");
  const agente = porSlug("agente-whatsapp");

  const [c, ag, mensajesAgente] = await Promise.all([
    getContadoresCliente(clienteId),
    agente ? getContadoresAgente() : null,
    agente ? getMensajesAgenteMes() : 0,
  ]);

  const contadores: Record<string, number> = {
    "/panel/pendientes": c.pendientes,
  };
  if (ag) {
    contadores["/panel/agente/conversaciones"] = ag.esperando;
    contadores["/panel/agente/correo"] = ag.esperandoCorreo;
    contadores["/panel/agente/correcciones"] = ag.correcciones;
  }

  return {
    asignaciones,
    agente,
    modulos: { redes: Boolean(redes), agente: Boolean(agente) },
    contadores,
    plan: {
      nombre: cliente.plan,
      uso: agente
        ? {
            etiqueta: "Respuestas del agente",
            usado: mensajesAgente,
            tope: agente.limites?.mensajesMes ?? TOPE_MENSAJES_AGENTE,
          }
        : null,
    },
  };
}
