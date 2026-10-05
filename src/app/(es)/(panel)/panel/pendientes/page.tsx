/* ==========================================================================
   Pendientes: todo lo que espera algo del cliente, junto y ordenado por
   gravedad. En el Inicio va un resumen de los primeros; acá está la lista
   completa.

   Los avisos salen SOLO acá y en el panel — nunca por correo (decisión del
   2026-09-06). Estas filas las escriben los workflows en la tabla
   `actividad`; el cliente se entera entrando.
   ========================================================================== */
import Link from "next/link";
import { BTN_SECUNDARIO_CHICO } from "@/components/panel/configuracion/estilos";
import { EstadoVacio, Seccion } from "@/components/panel/configuracion/seccion";
import { Icono } from "@/components/panel/iconos";
import { PageHead } from "@/components/panel/ui";
import { getPendientes } from "@/lib/panel/datos";
import type { Pendiente } from "@/lib/panel/tipos";
import { cn } from "@/lib/utils";

const ORDEN = ["urgente", "atencion", "info"] as const;

const META: Record<
  Pendiente["gravedad"],
  { titulo: string; descripcion: string; punto: string }
> = {
  urgente: { titulo: "Urgente", descripcion: "Lo primero que hay que resolver.", punto: "bg-bad" },
  atencion: { titulo: "Requiere atención", descripcion: "Después de lo urgente.", punto: "bg-warn" },
  info: { titulo: "Para cuando puedas", descripcion: "Sin apuro.", punto: "bg-ink-faint" },
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
        <EstadoVacio icono="pendientes" titulo="Nada pendiente">
          Todo lo tuyo está al día.
        </EstadoVacio>
      ) : (
        porGravedad.map(({ g, items }) => (
          <Seccion
            key={g}
            id={`gravedad-${g}`}
            titulo={
              <span className="inline-flex items-center gap-2.5">
                <span className={cn("h-[7px] w-[7px] flex-none rounded-full", META[g].punto)} aria-hidden="true" />
                {META[g].titulo}
                <span className="font-mono text-[11px] font-normal text-ink-mute tabular-nums">{items.length}</span>
              </span>
            }
            descripcion={META[g].descripcion}
            sinRelleno
          >
            <ul className="divide-y divide-line border-t border-line">
              {items.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-2.5 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-[18px]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-snug font-medium break-words text-ink-soft">{p.titulo}</p>
                    <p className="mt-0.5 text-[12px] leading-snug break-words text-ink-mute">{p.detalle}</p>
                  </div>
                  <Link href={p.accion.href} className={cn(BTN_SECUNDARIO_CHICO, "w-full sm:w-auto")}>
                    {p.accion.texto}
                    <Icono nombre="flecha" className="h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </Seccion>
        ))
      )}
    </>
  );
}
