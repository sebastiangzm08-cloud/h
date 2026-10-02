/* ==========================================================================
   Inicio del panel admin (rediseño, 2026-09-30). El pulso del negocio en una
   pantalla: clientes, plata que entra y que falta por cobrar, y lo que le
   toca a Sebastian hacer hoy.

   Todo sale de las lecturas reales de `lib/panel/admin.ts`:
   - Ingreso mensual = suma de las automatizaciones ACTIVAS de cada cliente.
   - Por cobrar / vencido = cobros sin pagar de la tabla `cobros`.
   - "Necesita tu atención" solo lista lo que existe: si no hay nada, lo dice.
   ========================================================================== */
import Link from "next/link";
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import { Caja, CajaHead, Pill, colones } from "@/components/panel/ui";
import {
  AdminHead,
  Avatar,
  BTN_PRIMARIO,
  Cifras,
  ESTADO_CLIENTE,
  TarjetaCifra,
  Vacio,
  fechaHora,
} from "@/components/admin/admin-ui";
import { relativa } from "@/lib/panel/agente-formato";
import {
  getClientesAdmin,
  getConsultasAdmin,
  getEjecucionesAdmin,
  getPagosAdmin,
  getResumenAdmin,
} from "@/lib/panel/admin";
import { cn } from "@/lib/utils";

const ATAJOS: { href: string; etiqueta: string; detalle: string; icono: NombreIcono }[] = [
  { href: "/panel/admin/alta", etiqueta: "Dar de alta un cliente", detalle: "Cuenta, WhatsApp y agenda", icono: "alta" },
  { href: "/panel/admin/asignar", etiqueta: "Asignar una automatización", detalle: "Sumársela a un cliente", icono: "asignar" },
  { href: "/panel/admin/pagos", etiqueta: "Cobrar el mes", detalle: "Generar y marcar pagos", icono: "facturacion" },
  { href: "/panel/admin/demos", etiqueta: "Crear una demo de venta", detalle: "Un link por prospecto", icono: "demo" },
  { href: "/panel/admin/costos", etiqueta: "Costos e ingresos", detalle: "Lo que entra y lo que sale", icono: "costos" },
];

type Atencion = {
  href: string;
  icono: NombreIcono;
  titulo: string;
  detalle: string;
  tono: "warn" | "bad";
};

export default async function InicioAdmin() {
  const [clientes, pagos, ejecuciones, consultas] = await Promise.all([
    getClientesAdmin(),
    getPagosAdmin(),
    getEjecucionesAdmin(),
    getConsultasAdmin(),
  ]);
  /* Reusa la lista de clientes de arriba para no repetir sus consultas. */
  const r = await getResumenAdmin(clientes);

  /* Una consulta espera si el turno es de Hoshizora: sin responder, o con la
     última línea del cliente. Una ya resuelta nunca cuenta. */
  const esperan = consultas.filter(
    (c) => c.estado !== "resuelta" && (c.estado === "sin_responder" || c.ultimaDe === "cliente")
  ).length;

  const pausados = clientes.filter((c) => c.estado === "pausado").length;
  const morosos = clientes.filter((c) => c.estado === "moroso").length;
  const sinTerminar = clientes.filter(
    (c) => (c.estado === "activo" || c.estado === "prueba") && !c.onboarding.completo
  );
  const vencidos = pagos.cobros.filter((c) => c.estado === "vencido").length;
  const sinPagar = pagos.cobros.filter((c) => c.estado !== "pagado").length;

  const fechaTexto = new Date().toLocaleDateString("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Costa_Rica",
  });
  const fecha = fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);

  /* Lo que de verdad le pide algo a una persona, de lo más urgente a lo menos. */
  const atencion: Atencion[] = [];
  if (vencidos > 0) {
    atencion.push({
      href: "/panel/admin/pagos",
      icono: "facturacion",
      titulo: `${vencidos} ${vencidos === 1 ? "cobro vencido" : "cobros vencidos"}`,
      detalle: `${colones(pagos.resumen.vencido)} sin cobrar`,
      tono: "bad",
    });
  }
  if (r.erroresHoy > 0) {
    atencion.push({
      href: "/panel/admin/ejecuciones?f=error",
      icono: "ejecuciones",
      titulo: `${r.erroresHoy} ${r.erroresHoy === 1 ? "ejecución con error" : "ejecuciones con error"} hoy`,
      detalle: "Revisá el log para ver qué falló",
      tono: "bad",
    });
  }
  if (esperan > 0) {
    atencion.push({
      href: "/panel/admin/mensajes",
      icono: "mensajes",
      titulo: `${esperan} ${esperan === 1 ? "consulta espera" : "consultas esperan"} tu respuesta`,
      detalle: "Clientes que escribieron desde Soporte",
      tono: "warn",
    });
  }
  if (sinTerminar.length > 0) {
    atencion.push({
      href: "/panel/admin/clientes",
      icono: "clientes",
      titulo: `${sinTerminar.length} ${sinTerminar.length === 1 ? "cliente sin terminar" : "clientes sin terminar"} la puesta en marcha`,
      detalle: sinTerminar
        .slice(0, 3)
        .map((c) => c.nombreNegocio)
        .join(", ") + (sinTerminar.length > 3 ? "…" : ""),
      tono: "warn",
    });
  }

  const recientes = ejecuciones.slice(0, 6);
  const nuevos = clientes.slice(0, 5);

  return (
    <>
      <AdminHead
        titulo="Administración"
        descripcion={fecha}
      >
        <Link href="/panel/admin/alta" prefetch={false} className={BTN_PRIMARIO}>
          <Icono nombre="alta" className="h-4 w-4" />
          Dar de alta
        </Link>
      </AdminHead>

      <Cifras columnas={6} etiqueta="Resumen del negocio">
        <TarjetaCifra
          icono="clientes"
          etiqueta="Clientes activos"
          valor={r.clientesActivos}
          pie={
            pausados + morosos > 0
              ? `${r.clientesPrueba} en prueba · ${pausados + morosos} sin servicio`
              : `${r.clientesPrueba} en prueba`
          }
          href="/panel/admin/clientes"
        />
        <TarjetaCifra
          icono="costos"
          etiqueta="Ingreso mensual"
          valor={colones(r.ingresoMensual)}
          pie="De clientes activos (sin los de prueba)"
          href="/panel/admin/costos"
        />
        <TarjetaCifra
          icono="facturacion"
          etiqueta="Por cobrar"
          valor={colones(pagos.resumen.porCobrar)}
          pie={
            vencidos > 0
              ? `${colones(pagos.resumen.vencido)} vencido`
              : sinPagar > 0
                ? `${sinPagar} ${sinPagar === 1 ? "cobro pendiente" : "cobros pendientes"}`
                : "Todo al día"
          }
          tono={vencidos > 0 ? "bad" : "normal"}
          href="/panel/admin/pagos"
        />
        <TarjetaCifra
          icono="mensajes"
          etiqueta="Sin responder"
          valor={esperan}
          pie={esperan > 0 ? "Esperan tu respuesta" : "Bandeja al día"}
          tono={esperan > 0 ? "warn" : "normal"}
          href="/panel/admin/mensajes"
        />
        <TarjetaCifra
          icono="actividad"
          etiqueta="Acciones hoy"
          valor={r.accionesHoy}
          pie={
            r.erroresHoy > 0
              ? `${r.erroresHoy} ${r.erroresHoy === 1 ? "ejecución con error" : "ejecuciones con error"}`
              : "Sin errores"
          }
          tono={r.erroresHoy > 0 ? "bad" : "normal"}
          href="/panel/admin/ejecuciones"
        />
        <TarjetaCifra
          icono="imagen"
          etiqueta="En cola de redes"
          valor={r.enCola}
          pie="Piezas esperando publicarse"
        />
      </Cifras>

      <section className="grid gap-[18px] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-[18px]">
          <Caja>
            <CajaHead eyebrow="Hoy" titulo="Necesita tu atención" />
            {atencion.length === 0 ? (
              <p className="flex items-center gap-3 rounded-xl bg-ok/10 px-4 py-3.5 text-[13px] text-ok">
                <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-ok/15">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                    <path d="m5 12 5 5 9-9" />
                  </svg>
                </span>
                Nada pendiente: sin cobros vencidos, sin errores y la bandeja al día.
              </p>
            ) : (
              <ul className="flex flex-col">
                {atencion.map((a, i) => (
                  <li key={a.href + a.titulo} className={cn(i > 0 && "border-t border-line")}>
                    <Link
                      href={a.href}
                      prefetch={false}
                      className="group -mx-2 flex min-h-14 items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface-3/60"
                    >
                      <span
                        className={cn(
                          "grid h-9 w-9 flex-none place-items-center rounded-xl",
                          a.tono === "bad" ? "bg-bad/15 text-bad" : "bg-warn/15 text-warn"
                        )}
                      >
                        <Icono nombre={a.icono} className="h-[17px] w-[17px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium text-ink">{a.titulo}</span>
                        <span className="block truncate text-[12px] text-ink-mute">{a.detalle}</span>
                      </span>
                      <Icono nombre="flecha" className="h-3.5 w-3.5 flex-none text-ink-faint transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Caja>

          <Caja>
            <CajaHead eyebrow="Sistema" titulo="Últimas ejecuciones">
              <Link
                href="/panel/admin/ejecuciones"
                prefetch={false}
                className="-my-3 inline-flex min-h-11 items-center gap-1 py-3 pl-2 text-xs font-medium whitespace-nowrap text-[color:var(--panel-acento-texto)] transition-opacity hover:opacity-80"
              >
                Ver todas
                <Icono nombre="flecha" className="h-3 w-3" />
              </Link>
            </CajaHead>
            {recientes.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[12.5px] text-ink-faint">
                Todavía no hay ejecuciones registradas. Aparecen cuando n8n corre su primera tarea.
              </p>
            ) : (
              <ul className="flex flex-col">
                {recientes.map((e, i) => (
                  <li
                    key={e.id}
                    className={cn("flex items-center gap-3 py-2.5", i > 0 && "border-t border-line")}
                  >
                    <span
                      className={cn(
                        "h-[7px] w-[7px] flex-none rounded-full",
                        e.estado === "error" ? "bg-bad" : "bg-ok"
                      )}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[12px] text-ink-soft">{e.accion}</span>
                      <span className="block truncate text-[11.5px] text-ink-faint">
                        {e.cliente}
                        {e.estado === "error" ? " · con error" : ""}
                      </span>
                    </span>
                    <time
                      dateTime={e.cuandoIso}
                      title={fechaHora(e.cuandoIso)}
                      className="flex-none font-mono text-[10.5px] whitespace-nowrap text-ink-faint"
                    >
                      {relativa(e.cuandoIso)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </Caja>
        </div>

        <div className="flex min-w-0 flex-col gap-[18px]">
          <Caja>
            <CajaHead eyebrow="Atajos" titulo="Lo que hacés seguido" />
            <ul className="flex flex-col gap-2">
              {ATAJOS.map((a) => (
                <li key={a.href}>
                  <Link
                    href={a.href}
                    prefetch={false}
                    className="group flex min-h-14 items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5 transition-[border-color,transform] hover:border-line-strong active:scale-[0.99]"
                  >
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-surface-3 text-ink-soft">
                      <Icono nombre={a.icono} className="h-[17px] w-[17px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-ink">{a.etiqueta}</span>
                      <span className="block truncate text-[11.5px] text-ink-faint">{a.detalle}</span>
                    </span>
                    <Icono nombre="flecha" className="h-3.5 w-3.5 flex-none text-ink-faint transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </Caja>

          <Caja>
            <CajaHead eyebrow="Clientes" titulo="Los más recientes">
              <Link
                href="/panel/admin/clientes"
                prefetch={false}
                className="-my-3 inline-flex min-h-11 items-center gap-1 py-3 pl-2 text-xs font-medium whitespace-nowrap text-[color:var(--panel-acento-texto)] transition-opacity hover:opacity-80"
              >
                Ver todos
                <Icono nombre="flecha" className="h-3 w-3" />
              </Link>
            </CajaHead>
            {nuevos.length === 0 ? (
              <Vacio icono="clientes" titulo="Todavía no hay clientes" plano>
                Cuando des de alta el primero, aparece acá.
              </Vacio>
            ) : (
              <ul className="flex flex-col">
                {nuevos.map((c, i) => (
                  <li key={c.id} className={cn(i > 0 && "border-t border-line")}>
                    <Link
                      href={`/panel/admin/clientes/${c.id}`}
                      prefetch={false}
                      className="-mx-2 flex min-h-14 items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-3/60"
                    >
                      <Avatar nombre={c.nombreNegocio} className="h-9 w-9 text-[12px]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-ink">{c.nombreNegocio}</span>
                        <span className="block truncate text-[11.5px] text-ink-faint">
                          {c.automatizaciones} {c.automatizaciones === 1 ? "automatización" : "automatizaciones"} · desde {c.desde}
                        </span>
                      </span>
                      <Pill tono={ESTADO_CLIENTE[c.estado].tono}>{ESTADO_CLIENTE[c.estado].texto}</Pill>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Caja>
        </div>
      </section>
    </>
  );
}
