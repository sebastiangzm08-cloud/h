/* ==========================================================================
   El hilo de una consulta, del lado del cliente: la conversación + una caja
   para seguir escribiendo.
   ========================================================================== */
import Link from "next/link";
import { notFound } from "next/navigation";
import { Seccion } from "@/components/panel/configuracion/seccion";
import { HiloConsulta } from "@/components/panel/hilo-consulta";
import { ResponderConsulta } from "@/components/panel/responder-consulta";
import { PageHead, Pill } from "@/components/panel/ui";
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
      {/* 44 px de alto de toque: un enlace de 12 px de letra es casi imposible de acertar con el pulgar. */}
      <Link
        href="/panel/soporte"
        className="-my-2 inline-flex min-h-11 items-center gap-1.5 self-start pr-3 text-[12.5px] text-ink-mute transition-colors hover:text-ink"
      >
        ‹ Soporte
      </Link>

      <PageHead titulo={c.asunto} sub={c.cuando}>
        <Pill tono={ESTADO[c.estado].tono}>{ESTADO[c.estado].texto}</Pill>
      </PageHead>

      <Seccion className="max-w-2xl" eyebrow="Conversación" titulo="Lo que se habló">
        <HiloConsulta lineas={c.lineas} lado="cliente" />
      </Seccion>

      {c.estado === "resuelta" ? (
        <Seccion className="max-w-2xl" eyebrow="Cerrada" titulo="Esta consulta está cerrada">
          <p className="text-[13px] text-ink-mute">Si necesitás algo más, abrí una nueva.</p>
          <Link
            href="/panel/soporte/nueva"
            className="mt-3.5 inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 text-[13.5px] font-medium text-ink-soft transition-colors hover:bg-surface-3"
          >
            Nueva consulta
          </Link>
        </Seccion>
      ) : (
        <Seccion className="max-w-2xl" eyebrow="Responder" titulo="Seguí la conversación">
          <div className="campos-celular">
            <ResponderConsulta mensajeId={c.id} variante="cliente" />
          </div>
        </Seccion>
      )}
    </>
  );
}
