/* ==========================================================================
   El hilo de una consulta, del lado del admin: la conversación, la caja de
   respuesta y el botón para cerrarla.
   ========================================================================== */
import Link from "next/link";
import { notFound } from "next/navigation";
import { Caja, CajaHead, PageHead, Pill } from "@/components/panel/ui";
import { Icono } from "@/components/panel/iconos";
import { HiloConsulta } from "@/components/panel/hilo-consulta";
import { ResponderConsulta } from "@/components/panel/responder-consulta";
import { getConsultaAdmin } from "@/lib/panel/admin";
import type { EstadoConsulta } from "@/lib/panel/tipos";
import { BotonCerrarConsulta } from "./boton-cerrar";

const ESTADO: Record<
  EstadoConsulta,
  { texto: string; tono: "warn" | "ok" | "idle" }
> = {
  sin_responder: { texto: "Sin responder", tono: "warn" },
  respondida: { texto: "Respondida", tono: "ok" },
  resuelta: { texto: "Resuelta", tono: "idle" },
};

type Props = { params: Promise<{ id: string }> };

export default async function HiloAdminPage({ params }: Props) {
  const { id } = await params;
  const c = await getConsultaAdmin(id);
  if (!c) notFound();

  return (
    <>
      <Link
        href="/panel/admin/mensajes"
        className="inline-flex items-center gap-1.5 text-[12px] text-ink-mute transition-colors hover:text-ink"
      >
        <Icono nombre="flecha" className="h-3 w-3 rotate-180" />
        Mensajes
      </Link>

      <PageHead titulo={c.asunto} sub={`${c.cliente} · ${c.cuando}`}>
        <Pill tono={ESTADO[c.estado].tono}>{ESTADO[c.estado].texto}</Pill>
      </PageHead>

      <Caja className="max-w-2xl">
        <HiloConsulta lineas={c.lineas} lado="admin" />
      </Caja>

      {c.estado !== "resuelta" ? (
        <Caja className="max-w-2xl">
          <CajaHead eyebrow="Responder" titulo="Contestarle al cliente">
            <BotonCerrarConsulta mensajeId={c.id} />
          </CajaHead>
          <ResponderConsulta mensajeId={c.id} variante="admin" />
        </Caja>
      ) : (
        <Caja className="max-w-2xl text-center">
          <p className="py-3 text-[13px] text-ink-faint">
            Consulta cerrada. Si el cliente necesita algo más, abre una nueva.
          </p>
        </Caja>
      )}
    </>
  );
}
