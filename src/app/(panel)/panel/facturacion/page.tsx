/* ==========================================================================
   Facturación.

   El cobro que viene, cómo se paga y el historial. El cobro es manual por
   SINPE (decisión del negocio): acá se muestra, se paga por fuera y queda
   registrado.
   ========================================================================== */
import { Caja, CajaHead, Nota, PageHead, Pill, colones } from "@/components/panel/ui";
import { getFacturacion } from "@/lib/panel/datos";
import type { EstadoCobro } from "@/lib/panel/tipos";
import { site, waLink } from "@/config/site";

const ESTADO: Record<EstadoCobro, { texto: string; tono: "ok" | "warn" | "bad" }> = {
  pagado: { texto: "Pagado", tono: "ok" },
  pendiente: { texto: "Pendiente", tono: "warn" },
  vencido: { texto: "Vencido", tono: "bad" },
};

export default async function FacturacionPage() {
  const f = await getFacturacion();
  const pendiente = f.cobros.find((c) => c.estado !== "pagado");

  return (
    <>
      <PageHead
        titulo="Facturación"
        sub={`Plan ${f.plan}`}
        descripcion="Tu mensualidad, el próximo cobro y lo que ya pagaste."
      />

      <section className="grid gap-[18px] lg:grid-cols-[1fr_1.1fr]">
        <Caja>
          <CajaHead eyebrow="Ahora" titulo="Tu plan" />
          <dl className="text-[13px]">
            {[
              ["Plan", f.plan],
              ["Mensualidad", colones(f.mensualidad)],
              ["Próximo cobro", f.proximoCobro],
              ["Método", f.metodoPago],
            ].map(([k, v], i, arr) => (
              <div
                key={k}
                className={
                  i === arr.length - 1
                    ? "flex justify-between gap-3 py-2.5"
                    : "flex justify-between gap-3 border-b border-line py-2.5"
                }
              >
                <dt className="text-ink-mute">{k}</dt>
                <dd className="text-right font-mono text-ink-soft">{v}</dd>
              </div>
            ))}
          </dl>
          <Nota className="mt-3.5">Pagando por año te ahorrás 2 meses.</Nota>
        </Caja>

        <Caja>
          <CajaHead eyebrow="Pago" titulo="Cómo pagar" />
          {pendiente ? (
            <p className="text-[13px] text-ink-soft">
              Tenés {colones(pendiente.monto)} de {pendiente.periodo}{" "}
              <span className="text-warn">sin pagar</span>.
            </p>
          ) : (
            <p className="text-[13px] text-ink-soft">Estás al día. Nada por pagar.</p>
          )}

          <dl className="mt-3 rounded-xl bg-surface-3 p-3.5 text-[12.5px]">
            <div className="flex justify-between gap-3 border-b border-line py-1.5">
              <dt className="text-ink-mute">SINPE Móvil</dt>
              <dd className="font-mono text-ink-soft">{site.pago.sinpeMovil}</dd>
            </div>
            <div className="flex justify-between gap-3 py-1.5">
              <dt className="text-ink-mute">A nombre de</dt>
              <dd className="font-mono text-ink-soft">{site.pago.sinpeNombre}</dd>
            </div>
          </dl>

          <a
            href={waLink("Hola, ya hice el pago de mi mensualidad. Adjunto el comprobante.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3.5 inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft"
          >
            Enviar comprobante
          </a>
        </Caja>
      </section>

      <section>
        <div className="mb-3">
          <CajaHead eyebrow="Historial" titulo="Cobros" />
        </div>
        <Caja plano>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-left font-mono text-[10px] tracking-wide text-ink-faint uppercase">
                <th className="px-1.5 py-2 font-medium">Periodo</th>
                <th className="px-1.5 py-2 font-medium">Monto</th>
                <th className="px-1.5 py-2 font-medium">Estado</th>
                <th className="px-1.5 py-2 text-right font-medium">Pagado</th>
              </tr>
            </thead>
            <tbody>
              {f.cobros.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="px-1.5 py-2.5 text-ink-soft">{c.periodo}</td>
                  <td className="px-1.5 py-2.5 font-mono text-ink-soft">
                    {colones(c.monto)}
                  </td>
                  <td className="px-1.5 py-2.5">
                    <Pill tono={ESTADO[c.estado].tono}>{ESTADO[c.estado].texto}</Pill>
                  </td>
                  <td className="px-1.5 py-2.5 text-right font-mono text-ink-faint">
                    {c.pagadoEn ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Caja>
      </section>
    </>
  );
}
