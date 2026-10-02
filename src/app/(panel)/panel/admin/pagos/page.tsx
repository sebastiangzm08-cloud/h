/* ==========================================================================
   Pagos. Todos los cobros de todos los clientes en un solo lugar: quién
   debe, hace cuánto, y quién está por caer en la suspensión automática
   (cobro pendiente + 2 días → vencido → servicio pausado por el cron).

   Escritorio ancho (xl): tabla. Celular y tablet: cada cobro es una tarjeta
   con el monto, el estado y el botón de "Marcar pagado" abajo.
   ========================================================================== */
import Link from "next/link";
import type { Metadata } from "next";
import { Caja, Eyebrow, Pill, colones } from "@/components/panel/ui";
import {
  AdminHead,
  Cifras,
  Seccion,
  TarjetaCifra,
  Vacio,
} from "@/components/admin/admin-ui";
import { getPagosAdmin } from "@/lib/panel/admin";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import { GenerarCobros } from "./generar-cobros";
import { BotonPago } from "../clientes/[id]/acciones-cliente";

export const metadata: Metadata = { title: "Pagos · Panel Hoshizora" };

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre",
];

function periodoDeHoy(): string {
  /* El mes en Costa Rica, no el del servidor (UTC-6, sin horario de verano). */
  const d = new Date(Date.now() - 6 * 3_600_000);
  return `${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const ESTADO_COBRO: Record<
  "pendiente" | "pagado" | "vencido",
  { texto: string; tono: "ok" | "warn" | "bad" | "idle" }
> = {
  pagado: { texto: "Pagado", tono: "ok" },
  pendiente: { texto: "Pendiente", tono: "warn" },
  vencido: { texto: "Vencido", tono: "bad" },
};

/** Columnas de la tabla de lo que falta cobrar, en pantallas anchas. */
const COLUMNAS = "xl:grid-cols-[minmax(0,1.3fr)_130px_112px_110px_112px_150px]";

function haceCuanto(dias: number) {
  return dias === 0 ? "hoy" : `hace ${dias} ${dias === 1 ? "día" : "días"}`;
}

export default async function PagosAdmin() {
  const { resumen, cobros } = await getPagosAdmin();
  const dias = site.cobro.avisoSuspensionDias;

  const sinPagar = cobros.filter((c) => c.estado !== "pagado");
  const vencidos = cobros.filter((c) => c.estado === "vencido");
  const pagados = cobros.filter((c) => c.estado === "pagado");

  return (
    <>
      <AdminHead
        titulo="Pagos"
        sub={`${sinPagar.length} sin cobrar`}
        descripcion={`Un cobro pendiente se marca vencido a los ${dias} días y el cron pausa el servicio. Cobralo antes.`}
      />

      <Cifras columnas={4} etiqueta="Resumen de pagos">
        <TarjetaCifra
          icono="facturacion"
          etiqueta="Por cobrar"
          valor={colones(resumen.porCobrar)}
          pie={`${sinPagar.length} ${sinPagar.length === 1 ? "cobro" : "cobros"} sin pagar`}
          tono={sinPagar.length > 0 ? "warn" : "normal"}
        />
        <TarjetaCifra
          icono="pendientes"
          etiqueta="Vencido"
          valor={colones(resumen.vencido)}
          pie={
            vencidos.length > 0
              ? `${vencidos.length} ${vencidos.length === 1 ? "cobro vencido" : "cobros vencidos"}`
              : "Nada vencido"
          }
          tono={vencidos.length > 0 ? "bad" : "normal"}
        />
        <TarjetaCifra
          icono="actividad"
          etiqueta="Cobrado"
          valor={colones(resumen.cobrado)}
          pie={`${pagados.length} ${pagados.length === 1 ? "pago registrado" : "pagos registrados"}`}
          tono={pagados.length > 0 ? "ok" : "normal"}
        />
        <TarjetaCifra
          icono="clientes"
          etiqueta="Clientes en riesgo"
          valor={resumen.clientesEnRiesgo}
          pie={resumen.clientesEnRiesgo > 0 ? "Con algo sin pagar" : "Todos al día"}
          tono={resumen.clientesEnRiesgo > 0 ? "warn" : "normal"}
        />
      </Cifras>

      <GenerarCobros periodoActual={periodoDeHoy()} />

      {cobros.length === 0 ? (
        <Vacio icono="facturacion" titulo="Todavía no hay cobros">
          Generá los del mes con el botón de arriba, o creá uno suelto desde la ficha de un cliente.
        </Vacio>
      ) : (
        <>
          <Seccion
            titulo="Sin cobrar"
            sub={`${sinPagar.length} · lo más viejo arriba`}
          >
            {sinPagar.length === 0 ? (
              <p className="flex items-center gap-3 rounded-2xl border border-ok/25 bg-ok/[0.07] px-4 py-3.5 text-[13px] text-ok">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 flex-none" aria-hidden="true">
                  <path d="m5 12 5 5 9-9" />
                </svg>
                Nada pendiente. Todo al día.
              </p>
            ) : (
              <div className="xl:overflow-hidden xl:rounded-2xl xl:border xl:border-line xl:bg-surface-2">
                <div
                  className={cn(
                    "hidden items-center gap-4 border-b border-line bg-surface-3/40 px-5 py-2.5 xl:grid",
                    COLUMNAS
                  )}
                >
                  <Eyebrow>Cliente</Eyebrow>
                  <Eyebrow>Periodo</Eyebrow>
                  <Eyebrow>Monto</Eyebrow>
                  <Eyebrow>Estado</Eyebrow>
                  <Eyebrow>Antigüedad</Eyebrow>
                  <span className="sr-only">Acción</span>
                </div>
                <ul className="flex flex-col gap-2.5 xl:gap-0">
                  {sinPagar.map((c) => (
                    <li
                      key={c.id}
                      className={cn(
                        "rounded-2xl border bg-surface-2 p-4 xl:rounded-none xl:border-0 xl:border-b xl:border-line xl:px-5 xl:py-3 xl:last:border-b-0",
                        c.estado === "vencido" ? "border-bad/35" : "border-line"
                      )}
                    >
                      <div className={cn("grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 xl:gap-y-0", COLUMNAS)}>
                        <div className="col-start-1 row-start-1 min-w-0 xl:col-start-auto xl:row-start-auto">
                          <Link
                            href={`/panel/admin/clientes/${c.clienteId}`}
                            prefetch={false}
                            className="flex min-h-11 items-center text-[13.5px] font-medium break-words text-ink transition-colors hover:text-[color:var(--panel-acento-texto)] xl:min-h-0"
                          >
                            {c.cliente}
                          </Link>
                          <p className="text-[11.5px] text-ink-faint xl:hidden">{c.periodo}</p>
                        </div>
                        <p className="hidden text-[12.5px] text-ink-mute xl:block">{c.periodo}</p>
                        <div className="col-start-1 row-start-2 xl:col-start-auto xl:row-start-auto">
                          <p className="font-mono text-[13px] text-ink-soft tabular-nums">{colones(c.monto)}</p>
                          <p
                            className={cn(
                              "text-[11.5px] xl:hidden",
                              c.estado === "vencido" ? "text-bad" : "text-ink-faint"
                            )}
                          >
                            {haceCuanto(c.diasDesde)}
                          </p>
                        </div>
                        <div className="col-start-2 row-start-1 justify-self-end xl:col-start-auto xl:row-start-auto xl:justify-self-start">
                          <Pill tono={ESTADO_COBRO[c.estado].tono}>{ESTADO_COBRO[c.estado].texto}</Pill>
                        </div>
                        <p
                          className={cn(
                            "hidden text-[12px] xl:block",
                            c.estado === "vencido" ? "text-bad" : "text-ink-faint"
                          )}
                        >
                          {haceCuanto(c.diasDesde)}
                        </p>
                        <div className="col-start-2 row-start-2 justify-self-end xl:col-start-auto xl:row-start-auto">
                          <BotonPago clienteId={c.clienteId} cobroId={c.id} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Seccion>

          {pagados.length > 0 ? (
            <Seccion titulo="Pagos registrados" sub={String(pagados.length)}>
              <Caja>
                <ul className="flex flex-col">
                  {pagados.map((c, i) => (
                    <li
                      key={c.id}
                      className={cn("flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5", i > 0 && "border-t border-line")}
                    >
                      <span className="min-w-0">
                        <Link
                          href={`/panel/admin/clientes/${c.clienteId}`}
                          prefetch={false}
                          className="inline-flex min-h-11 items-center text-[13px] text-ink-soft transition-colors hover:text-[color:var(--panel-acento-texto)] xl:min-h-0"
                        >
                          {c.cliente}
                        </Link>
                        <span className="block text-[11.5px] text-ink-faint">
                          {c.periodo} · {c.metodo ?? "Sin método"}
                        </span>
                      </span>
                      <span className="font-mono text-[12.5px] text-ink tabular-nums">{colones(c.monto)}</span>
                    </li>
                  ))}
                </ul>
              </Caja>
            </Seccion>
          ) : null}
        </>
      )}
    </>
  );
}
