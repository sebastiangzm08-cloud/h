/* ==========================================================================
   Costos e ingresos. La foto de la plata: lo que entra (real, de las
   automatizaciones activas) contra lo que cuesta la infraestructura
   (estimado, editable acá en el código hasta que valga la pena traerlo de
   algún lado).
   ========================================================================== */
import { Caja, CajaHead, Eyebrow, PageHead, colones } from "@/components/panel/ui";
import { getClientesAdmin } from "@/lib/panel/admin";

/* Infraestructura de la agencia entera, no por cliente. Ajustá estos
   números cuando cambien los planes que pagás. Fuente: verificación de
   precios del 2026-09-06 (~$34/mes ≈ ₡18.000). */
const COSTOS_FIJOS: { concepto: string; monto: number }[] = [
  { concepto: "VPS (n8n + render)", monto: 4800 },
  { concepto: "Dominio", monto: 550 },
  { concepto: "Publicador / redes", monto: 8000 },
  { concepto: "IA (texto + voz)", monto: 2500 },
  { concepto: "Colchón / varios", monto: 2000 },
];

export default async function CostosAdmin() {
  const clientes = await getClientesAdmin();
  const ingreso = clientes.reduce((s, c) => s + c.ingresoMensual, 0);
  const costos = COSTOS_FIJOS.reduce((s, c) => s + c.monto, 0);
  const neto = ingreso - costos;
  const margen = ingreso > 0 ? Math.round((neto / ingreso) * 100) : 0;

  return (
    <>
      <PageHead
        titulo="Costos e ingresos"
        descripcion="Ingreso real de las automatizaciones activas; costos estimados de infraestructura."
      />

      <section className="grid gap-3.5 sm:grid-cols-3">
        {[
          { et: "Ingreso mensual", v: colones(ingreso), pie: `${clientes.length} clientes` },
          { et: "Costos fijos", v: colones(costos), pie: "Infraestructura, estimado" },
          {
            et: "Neto",
            v: colones(neto),
            pie: ingreso > 0 ? `${margen}% de margen` : "Sin ingreso todavía",
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

      <section className="grid gap-[18px] lg:grid-cols-2">
        <Caja>
          <CajaHead eyebrow="Entra" titulo="Ingreso por cliente" />
          {clientes.length === 0 ? (
            <p className="py-4 text-[13px] text-ink-faint">Sin clientes todavía.</p>
          ) : (
            <dl className="text-[12.5px]">
              {clientes.map((c, i, arr) => (
                <div
                  key={c.id}
                  className={
                    i === arr.length - 1
                      ? "flex justify-between gap-3 py-2"
                      : "flex justify-between gap-3 border-b border-line py-2"
                  }
                >
                  <dt className="text-ink-mute">
                    {c.nombreNegocio}{" "}
                    <span className="text-ink-faint">· {c.automatizaciones} autom.</span>
                  </dt>
                  <dd className="font-mono text-ink-soft">{colones(c.ingresoMensual)}</dd>
                </div>
              ))}
            </dl>
          )}
        </Caja>

        <Caja>
          <CajaHead eyebrow="Sale" titulo="Costos fijos" />
          <dl className="text-[12.5px]">
            {COSTOS_FIJOS.map((c, i, arr) => (
              <div
                key={c.concepto}
                className={
                  i === arr.length - 1
                    ? "flex justify-between gap-3 py-2"
                    : "flex justify-between gap-3 border-b border-line py-2"
                }
              >
                <dt className="text-ink-mute">{c.concepto}</dt>
                <dd className="font-mono text-ink-soft">{colones(c.monto)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] text-ink-faint">
            <Eyebrow>Nota</Eyebrow>
            Estos montos son estimados y se editan en{" "}
            <code className="rounded bg-surface-3 px-1 py-px font-mono text-[10px]">
              admin/costos/page.tsx
            </code>
            .
          </p>
        </Caja>
      </section>
    </>
  );
}
