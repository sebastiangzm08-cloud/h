/* ==========================================================================
   Mensajes: las consultas que abren los clientes desde su pantalla de
   Soporte. Se responden dentro del panel, sin correo.
   ========================================================================== */
import Link from "next/link";
import { Caja, PageHead, Pill } from "@/components/panel/ui";
import { Icono } from "@/components/panel/iconos";
import { getConsultasAdmin } from "@/lib/panel/admin";
import type { EstadoConsulta } from "@/lib/panel/tipos";

const ESTADO: Record<
  EstadoConsulta,
  { texto: string; tono: "warn" | "ok" | "idle" }
> = {
  sin_responder: { texto: "Sin responder", tono: "warn" },
  respondida: { texto: "Respondida", tono: "ok" },
  resuelta: { texto: "Resuelta", tono: "idle" },
};

export default async function MensajesAdmin() {
  const consultas = await getConsultasAdmin();
  const pendientes = consultas.filter(
    (c) => c.estado === "sin_responder" || c.ultimaDe === "cliente"
  ).length;

  return (
    <>
      <PageHead
        titulo="Mensajes"
        sub={`${consultas.length} en total`}
        descripcion={
          pendientes > 0
            ? `${pendientes} esperan tu respuesta.`
            : "Nada pendiente de responder."
        }
      />

      {consultas.length === 0 ? (
        <Caja className="text-center">
          <p className="py-8 text-[13px] text-ink-faint">
            Ningún cliente ha escrito todavía.
          </p>
        </Caja>
      ) : (
        <div className="flex flex-col gap-2.5">
          {consultas.map((c) => {
            const espera = c.ultimaDe === "cliente" && c.estado !== "resuelta";
            return (
              <Link
                key={c.id}
                href={`/panel/admin/mensajes/${c.id}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-line bg-surface-2 p-[18px] transition-colors hover:border-line-strong"
              >
                <div className="min-w-[220px] flex-1">
                  <h2 className="text-[13.5px] font-medium text-ink">
                    {c.asunto}
                  </h2>
                  <p className="mt-0.5 text-[11.5px] text-ink-faint">
                    {c.cliente} · {c.cuando}
                  </p>
                </div>
                {espera ? <Pill tono="warn">Te toca responder</Pill> : null}
                <Pill tono={ESTADO[c.estado].tono}>{ESTADO[c.estado].texto}</Pill>
                <Icono nombre="flecha" className="h-3.5 w-3.5 text-ink-faint" />
              </Link>
            );
          })}
        </div>
      )}

      <p className="flex items-center gap-2 text-[11.5px] text-ink-faint">
        <Icono nombre="soporte" className="h-3.5 w-3.5" />
        <span>
          Cuando exista el Agente de WhatsApp, sus conversaciones caen en esta
          misma bandeja.
        </span>
      </p>
    </>
  );
}
