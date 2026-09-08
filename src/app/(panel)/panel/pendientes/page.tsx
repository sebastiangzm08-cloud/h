/* ==========================================================================
   Pendientes: todo lo que espera algo del cliente, junto y ordenado por
   gravedad. En el Inicio va un resumen de los primeros; acá está la lista
   completa.

   Los avisos salen SOLO acá y en el panel — nunca por correo (decisión del
   2026-09-06). Estas filas las escriben los workflows en la tabla
   `actividad`; el cliente se entera entrando.
   ========================================================================== */
import Link from "next/link";
import { Caja, Eyebrow, PageHead } from "@/components/panel/ui";
import { Icono } from "@/components/panel/iconos";
import { getPendientes } from "@/lib/panel/datos";
import type { Pendiente } from "@/lib/panel/tipos";

const ORDEN = ["urgente", "atencion", "info"] as const;

const META: Record<
  Pendiente["gravedad"],
  { titulo: string; punto: string; texto: string }
> = {
  urgente: { titulo: "Urgente", punto: "bg-bad", texto: "text-bad" },
  atencion: { titulo: "Requiere atención", punto: "bg-warn", texto: "text-warn" },
  info: { titulo: "Para cuando puedas", punto: "bg-ink-faint", texto: "text-ink-mute" },
};

export default async function PendientesPage() {
  const pendientes = await getPendientes();
  const porGravedad = ORDEN.map((g) => ({
    g,
    items: pendientes.filter((p) => p.gravedad === g),
  })).filter((grupo) => grupo.items.length > 0);

  return (
    <>
      <PageHead
        titulo="Pendientes"
        sub={`${pendientes.length} en total`}
        descripcion="Lo que espera algo de vos. Se ordena por urgencia y se limpia solo cuando lo resolvés."
      />

      {pendientes.length === 0 ? (
        <Caja className="text-center">
          <p className="py-6 text-[13px] text-ink-faint">
            Nada pendiente. Todo tuyo está al día.
          </p>
        </Caja>
      ) : (
        porGravedad.map(({ g, items }) => (
          <section key={g}>
            <div className="mb-3 flex items-center gap-2">
              <span className={`h-[7px] w-[7px] rounded-full ${META[g].punto}`} />
              <Eyebrow>{META[g].titulo}</Eyebrow>
              <span className="font-mono text-[10.5px] text-ink-faint">
                {items.length}
              </span>
            </div>
            <Caja plano>
              <ul className="flex flex-col">
                {items.map((p, i) => (
                  <li
                    key={p.id}
                    className={
                      i === items.length - 1
                        ? "flex items-start gap-3 px-1.5 py-3"
                        : "flex items-start gap-3 border-b border-line px-1.5 py-3"
                    }
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-ink-soft">{p.titulo}</p>
                      <p className="mt-0.5 text-[11.5px] text-ink-faint">
                        {p.detalle}
                      </p>
                    </div>
                    <Link
                      href={p.accion.href}
                      className="inline-flex flex-none items-center gap-1.5 rounded-full border border-line-strong px-3 py-1 text-[11.5px] text-ink transition-colors hover:bg-surface-2"
                    >
                      {p.accion.texto}
                      <Icono nombre="flecha" className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Caja>
          </section>
        ))
      )}
    </>
  );
}
