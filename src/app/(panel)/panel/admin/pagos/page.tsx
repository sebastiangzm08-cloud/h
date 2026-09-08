/* ==========================================================================
   Pagos. Todos los cobros de todos los clientes en un solo lugar: quién
   debe, hace cuánto, y quién está por caer en la suspensión automática
   (cobro pendiente + 2 días → vencido → servicio pausado por el cron).
   ========================================================================== */
import Link from "next/link";
import type { Metadata } from "next";
import { Caja, CajaHead, PageHead, Pill, colones } from "@/components/panel/ui";
import { getPagosAdmin } from "@/lib/panel/admin";
import { site } from "@/config/site";
import { GenerarCobros } from "./generar-cobros";
import { BotonPago } from "../clientes/[id]/acciones-cliente";

export const metadata: Metadata = { title: "Pagos · Panel Hoshizora" };

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre",
];

function periodoDeHoy(): string {
  const d = new Date();
  return `${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

const ESTADO_COBRO: Record<
  "pendiente" | "pagado" | "vencido",
  { texto: string; tono: "ok" | "warn" | "bad" | "idle" }
> = {
  pagado: { texto: "Pagado", tono: "ok" },
  pendiente: { texto: "Pendiente", tono: "warn" },
  vencido: { texto: "Vencido", tono: "bad" },
};

export default async function PagosAdmin() {
  const { resumen, cobros } = await getPagosAdmin();
  const dias = site.cobro.avisoSuspensionDias;

  const sinPagar = cobros.filter((c) => c.estado !== "pagado");
  const pagados = cobros.filter((c) => c.estado === "pagado");

  return (
    <>
      <PageHead
        titulo="Pagos"
        sub={`${sinPagar.length} sin cobrar`}
        descripcion={`Un cobro pendiente se marca vencido a los ${dias} días y el cron pausa el servicio. Cobralo antes.`}
      />

      <section className="grid gap-3.5 sm:grid-cols-3">
        {[
          {
            et: "Por cobrar",
            v: colones(resumen.porCobrar),
            pie: `${sinPagar.length} ${sinPagar.length === 1 ? "cobro" : "cobros"}`,
          },
          {
            et: "Vencido",
            v: colones(resumen.vencido),
            pie: `${resumen.clientesEnRiesgo} ${resumen.clientesEnRiesgo === 1 ? "cliente" : "clientes"} en riesgo`,
          },
          {
            et: "Cobrado",
            v: colones(resumen.cobrado),
            pie: `${pagados.length} ${pagados.length === 1 ? "pago" : "pagos"}`,
          },
        ].map((d) => (
          <Caja key={d.et} className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
              {d.et}
            </span>
            <span className="text-[20px] font-semibold tracking-tight text-ink tabular-nums">
              {d.v}
            </span>
            <span className="text-[11.5px] text-ink-faint">{d.pie}</span>
          </Caja>
        ))}
      </section>

      <GenerarCobros periodoActual={periodoDeHoy()} />

      {cobros.length === 0 ? (
        <Caja className="text-center">
          <p className="py-8 text-[13px] text-ink-faint">
            Todavía no hay cobros. Generá los del mes con el botón de arriba, o
            creá uno suelto desde la ficha de un cliente.
          </p>
        </Caja>
      ) : (
        <div className="flex flex-col gap-[18px]">
          <Caja>
            <CajaHead
              eyebrow="Sin cobrar"
              titulo={`${sinPagar.length} ${sinPagar.length === 1 ? "cobro" : "cobros"} — lo más viejo arriba`}
            />
            {sinPagar.length === 0 ? (
              <p className="py-4 text-[13px] text-ink-faint">
                Nada pendiente. Todo al día.
              </p>
            ) : (
              <ul className="flex flex-col">
                {sinPagar.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-line py-3 last:border-0"
                  >
                    <Link
                      href={`/panel/admin/clientes/${c.clienteId}`}
                      className="min-w-[150px] flex-1 text-[13px] font-medium text-ink transition-colors hover:text-ink-mute"
                    >
                      {c.cliente}
                    </Link>
                    <span className="text-[12px] text-ink-mute">{c.periodo}</span>
                    <span className="font-mono text-[12.5px] text-ink-soft tabular-nums">
                      {colones(c.monto)}
                    </span>
                    <Pill tono={ESTADO_COBRO[c.estado].tono}>
                      {ESTADO_COBRO[c.estado].texto}
                    </Pill>
                    <span
                      className={
                        c.estado === "vencido"
                          ? "text-[11.5px] text-bad"
                          : "text-[11.5px] text-ink-faint"
                      }
                    >
                      {c.diasDesde === 0
                        ? "hoy"
                        : `hace ${c.diasDesde} ${c.diasDesde === 1 ? "día" : "días"}`}
                    </span>
                    <BotonPago clienteId={c.clienteId} cobroId={c.id} />
                  </li>
                ))}
              </ul>
            )}
          </Caja>

          {pagados.length > 0 ? (
            <Caja>
              <CajaHead eyebrow="Cobrado" titulo="Pagos registrados" />
              <ul className="flex flex-col">
                {pagados.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line py-2.5 text-[12.5px] last:border-0"
                  >
                    <Link
                      href={`/panel/admin/clientes/${c.clienteId}`}
                      className="min-w-[150px] flex-1 text-ink-soft transition-colors hover:text-ink"
                    >
                      {c.cliente}
                    </Link>
                    <span className="text-ink-mute">{c.periodo}</span>
                    <span className="font-mono text-ink-soft tabular-nums">
                      {colones(c.monto)}
                    </span>
                    <span className="text-[11px] text-ink-faint">
                      {c.metodo ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </Caja>
          ) : null}
        </div>
      )}
    </>
  );
}
