/* ==========================================================================
   El hilo de una consulta, del lado del cliente: la conversación + una caja
   para seguir escribiendo.
   ========================================================================== */
import Link from "next/link";
import { notFound } from "next/navigation";
import { Caja, CajaHead, PageHead, Pill } from "@/components/panel/ui";
import { HiloConsulta } from "@/components/panel/hilo-consulta";
import { ResponderConsulta } from "@/components/panel/responder-consulta";
import { getConsulta } from "@/lib/panel/datos";
import type { EstadoConsulta } from "@/lib/panel/tipos";

const ESTADO: Record<
  EstadoConsulta,
  { texto: string; tono: "warn" | "ok" | "idle" }
> = {
  sin_responder: { texto: "Esperando respuesta", tono: "warn" },
  respondida: { texto: "Respondida", tono: "ok" },
  resuelta: { texto: "Resuelta", tono: "idle" },
};

type Props = { params: Promise<{ id: string }> };

export default async function HiloClientePage({ params }: Props) {
  const { id } = await params;
  const c = await getConsulta(id);
  if (!c) notFound();

  return (
    <>
      <Link
        href="/panel/soporte"
        className="inline-flex items-center gap-1.5 text-[12px] text-ink-mute transition-colors hover:text-ink"
      >
        ‹ Soporte
      </Link>

      <PageHead titulo={c.asunto} sub={c.cuando}>
        <Pill tono={ESTADO[c.estado].tono}>{ESTADO[c.estado].texto}</Pill>
      </PageHead>

      <Caja className="max-w-2xl">
        <HiloConsulta lineas={c.lineas} lado="cliente" />
      </Caja>

      {c.estado === "resuelta" ? (
        <Caja className="max-w-2xl text-center">
          <p className="py-3 text-[13px] text-ink-faint">
            Esta consulta está cerrada. Si necesitás algo más, abrí una nueva.
          </p>
        </Caja>
      ) : (
        <Caja className="max-w-2xl">
          <CajaHead eyebrow="Responder" titulo="Seguí la conversación" />
          <ResponderConsulta mensajeId={c.id} variante="cliente" />
        </Caja>
      )}
    </>
  );
}
