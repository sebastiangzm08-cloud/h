/* ==========================================================================
   El hilo de una consulta, del lado del admin: la conversación, la caja de
   respuesta y el botón para cerrarla.
   ========================================================================== */
import { notFound } from "next/navigation";
import { Caja, CajaHead, Pill } from "@/components/panel/ui";
import { HiloConsulta } from "@/components/panel/hilo-consulta";
import { AdminHead, Aviso, VolverA, fechaHora } from "@/components/admin/admin-ui";
import { ResponderAdmin } from "@/components/admin/responder-admin";
import { getConsultaAdmin } from "@/lib/panel/admin";
import type { EstadoConsulta } from "@/lib/panel/tipos";
import { BotonCerrarConsulta } from "./boton-cerrar";

const ESTADO: Record<EstadoConsulta, { texto: string; tono: "warn" | "ok" | "idle" }> = {
  sin_responder: { texto: "Sin responder", tono: "warn" },
  respondida: { texto: "Respondida", tono: "ok" },
  resuelta: { texto: "Resuelta", tono: "idle" },
};

type Props = { params: Promise<{ id: string }> };

export default async function HiloAdminPage({ params }: Props) {
  const { id } = await params;
  const c = await getConsultaAdmin(id);
  if (!c) notFound();

  const turnoMio = c.estado !== "resuelta" && (c.estado === "sin_responder" || c.ultimaDe === "cliente");

  return (
    <>
      <VolverA href="/panel/admin/mensajes">Mensajes</VolverA>

      <AdminHead
        titulo={c.asunto}
        sub={`${c.cliente} · ${c.creadaEn ? fechaHora(c.creadaEn) : c.cuando}`}
      >
        <Pill tono={turnoMio ? "warn" : ESTADO[c.estado].tono}>
          {turnoMio ? "Te toca responder" : ESTADO[c.estado].texto}
        </Pill>
      </AdminHead>

      <div className="flex max-w-3xl flex-col gap-[18px]">
        <Caja>
          <CajaHead
            eyebrow="Conversación"
            titulo={`${c.lineas.length} ${c.lineas.length === 1 ? "mensaje" : "mensajes"}`}
          />
          <HiloConsulta lineas={c.lineas} lado="admin" />
        </Caja>

        {c.estado !== "resuelta" ? (
          <Caja>
            <CajaHead eyebrow="Responder" titulo="Contestarle al cliente">
              <BotonCerrarConsulta mensajeId={c.id} />
            </CajaHead>
            <ResponderAdmin mensajeId={c.id} />
          </Caja>
        ) : (
          <Aviso tono="ok" titulo="Consulta cerrada">
            Si el cliente necesita algo más, abre una consulta nueva desde Soporte.
          </Aviso>
        )}
      </div>
    </>
  );
}
