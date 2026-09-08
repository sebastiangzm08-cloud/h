/* ==========================================================================
   Inicio del panel admin. El pulso del negocio en una pantalla: clientes,
   plata que entra, y qué está corriendo o fallando.
   ========================================================================== */
import Link from "next/link";
import { Caja, CajaHead, PageHead, colones } from "@/components/panel/ui";
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import {
  getConsultasAdmin,
  getEjecucionesAdmin,
  getResumenAdmin,
} from "@/lib/panel/admin";

function Dato({
  icono,
  etiqueta,
  valor,
  pie,
}: {
  icono: NombreIcono;
  etiqueta: string;
  valor: string;
  pie?: string;
}) {
  return (
    <Caja className="flex flex-col gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-surface-3 text-ink-soft shadow-[inset_0_0_0_1px_rgba(255,255,255,0.11)]">
        <Icono nombre={icono} className="h-4 w-4" />
      </span>
      <span className="mt-1 font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
        {etiqueta}
      </span>
      <span className="text-[20px] font-semibold tracking-tight text-ink tabular-nums">
        {valor}
      </span>
      {pie ? <span className="text-[11.5px] text-ink-faint">{pie}</span> : null}
    </Caja>
  );
}

export default async function InicioAdmin() {
  const [r, ejecuciones, consultas] = await Promise.all([
    getResumenAdmin(),
    getEjecucionesAdmin(),
    getConsultasAdmin(),
  ]);
  const sinResponder = consultas.filter(
    (c) => c.estado === "sin_responder" || c.ultimaDe === "cliente"
  ).length;
  const conError = ejecuciones.filter((e) => e.estado === "error").length;

  return (
    <>
      <PageHead titulo="Administración" descripcion="El estado de Hoshizora de un vistazo." />

      <section className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <Dato
          icono="clientes"
          etiqueta="Clientes"
          valor={String(r.clientesActivos + r.clientesPrueba)}
          pie={`${r.clientesActivos} activos · ${r.clientesPrueba} en prueba`}
        />
        <Dato
          icono="costos"
          etiqueta="Ingreso mensual"
          valor={colones(r.ingresoMensual)}
          pie="De automatizaciones activas"
        />
        <Dato
          icono="ejecuciones"
          etiqueta="Acciones hoy"
          valor={String(r.accionesHoy)}
          pie={conError > 0 ? `${conError} con error` : "Sin errores"}
        />
        <Dato
          icono="mensajes"
          etiqueta="Sin responder"
          valor={String(sinResponder)}
          pie="Mensajes de clientes"
        />
      </section>

      <section className="grid gap-[18px] lg:grid-cols-2">
        <Caja>
          <CajaHead eyebrow="Sistema" titulo="Últimas ejecuciones">
            <Link
              href="/panel/admin/ejecuciones"
              className="text-xs font-medium whitespace-nowrap text-ink-mute transition-colors hover:text-ink"
            >
              Ver todo
            </Link>
          </CajaHead>
          <ul className="flex flex-col">
            {ejecuciones.map((e, i) => (
              <li
                key={e.id}
                className={
                  i === ejecuciones.length - 1
                    ? "flex items-center gap-3 py-2.5"
                    : "flex items-center gap-3 border-b border-line py-2.5"
                }
              >
                <span
                  className={`h-[7px] w-[7px] flex-none rounded-full ${
                    e.estado === "error" ? "bg-bad" : "bg-ok"
                  }`}
                />
                <span className="flex-1 font-mono text-[12px] text-ink-soft">
                  {e.accion}
                </span>
                <time className="font-mono text-[10.5px] text-ink-faint">
                  {e.cuando}
                </time>
              </li>
            ))}
          </ul>
        </Caja>

        <Caja>
          <CajaHead eyebrow="Atajos" titulo="Lo que hacés seguido" />
          <div className="flex flex-col gap-2">
            {[
              { href: "/panel/admin/alta", label: "Dar de alta un cliente", icono: "alta" as const },
              { href: "/panel/admin/asignar", label: "Asignar una automatización", icono: "asignar" as const },
              { href: "/panel/admin/clientes", label: "Ver todos los clientes", icono: "clientes" as const },
              { href: "/panel/admin/costos", label: "Costos e ingresos", icono: "costos" as const },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-3.5 py-3 text-[13px] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
              >
                <Icono nombre={a.icono} className="h-4 w-4 text-ink-mute" />
                {a.label}
                <Icono nombre="flecha" className="ml-auto h-3.5 w-3.5 text-ink-faint" />
              </Link>
            ))}
          </div>
        </Caja>
      </section>
    </>
  );
}
