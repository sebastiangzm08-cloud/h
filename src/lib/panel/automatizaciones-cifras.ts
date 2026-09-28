/* ==========================================================================
   Las 2 cifras del MES de cada automatización contratada (tarjetas de
   Automatizaciones, Fase 2 del rediseño). Solo datos reales; si una
   automatización no tiene nada propio que contar, muestra sus acciones del
   mes de la bitácora (`actividad`), que es lo que de verdad hizo.
   ========================================================================== */
import { supabaseServidor } from "@/lib/supabase/servidor";
import { getCifrasAgenteMes } from "./agente";
import type { Asignacion } from "./tipos";

export type Cifra = { valor: number; etiqueta: string };

function inicioMesCR() {
  const dia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Costa_Rica" }).format(new Date());
  return `${dia.slice(0, 7)}-01T06:00:00.000Z`;
}

export async function getCifrasAutomatizaciones(
  asignaciones: Asignacion[]
): Promise<Record<string, Cifra[]>> {
  const sb = await supabaseServidor();
  const mes = inicioMesCR();
  const pares = await Promise.all(
    asignaciones.map(async (a): Promise<[string, Cifra[]]> => {
      const slug = a.automatizacion.slug;
      if (slug === "agente-whatsapp") {
        const c = await getCifrasAgenteMes();
        return [a.id, [
          { valor: c.conversaciones, etiqueta: c.conversaciones === 1 ? "conversación" : "conversaciones" },
          { valor: c.citas, etiqueta: c.citas === 1 ? "cita agendada" : "citas agendadas" },
        ]];
      }
      if (slug === "redes-sociales") {
        const [pub, fila] = await Promise.all([
          sb.from("cola").select("id", { count: "exact", head: true }).eq("asignacion_id", a.id).eq("estado", "publicada").gte("programada_para", mes),
          sb.from("cola").select("id", { count: "exact", head: true }).eq("asignacion_id", a.id).in("estado", ["pendiente", "en_retoque", "programada"]),
        ]);
        return [a.id, [
          { valor: pub.count ?? 0, etiqueta: (pub.count ?? 0) === 1 ? "publicada" : "publicadas" },
          { valor: fila.count ?? 0, etiqueta: "en fila" },
        ]];
      }
      const act = await sb.from("actividad").select("id", { count: "exact", head: true }).eq("asignacion_id", a.id).gte("creada_en", mes);
      return [a.id, [{ valor: act.count ?? 0, etiqueta: (act.count ?? 0) === 1 ? "acción" : "acciones" }]];
    })
  );
  return Object.fromEntries(pares);
}
