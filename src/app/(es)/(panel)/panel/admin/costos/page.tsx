/* ==========================================================================
   Costos e ingresos. La foto de la plata: lo que entra (real, de las
   automatizaciones activas) contra lo que cuesta la infraestructura
   (estimado, editable acá en el código hasta que valga la pena traerlo de
   algún lado).
   ========================================================================== */
import Link from "next/link";
import { Caja, CajaHead, colones } from "@/components/panel/ui";
import { AdminHead, Aviso, Cifras, TarjetaCifra, Vacio } from "@/components/admin/admin-ui";
import { getClientesAdmin } from "@/lib/panel/admin";
import { cn } from "@/lib/utils";

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

/** Con signo claro: "−₡17.850", no "₡-17.850". */
function colonesConSigno(n: number) {
  return n < 0 ? `−${colones(Math.abs(n))}` : colones(n);
}

/** Barra de proporción. No se anima, así que el ancho directo basta. */
function Barra({ pct }: { pct: number }) {
  return (
    <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
      <span
        className="block h-full rounded-full bg-[var(--panel-acento)]"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </span>
  );
}

export default async function CostosAdmin() {
  const clientes = await getClientesAdmin();
  /* Solo los clientes ACTIVOS pagan; los de prueba no entran al ingreso. */
  const ingreso = clientes
    .filter((c) => c.estado === "activo")
    .reduce((s, c) => s + c.ingresoMensual, 0);
  const costos = COSTOS_FIJOS.reduce((s, c) => s + c.monto, 0);
  const neto = ingreso - costos;
  const margen = ingreso > 0 ? Math.round((neto / ingreso) * 100) : 0;

  /* Los que aportan primero, de mayor a menor; los que no, al final. */
  const porIngreso = [...clientes].sort((a, b) => b.ingresoMensual - a.ingresoMensual);
  const aportan = clientes.filter((c) => c.estado === "activo" && c.ingresoMensual > 0).length;
  const topeCliente = Math.max(1, ...clientes.map((c) => c.ingresoMensual));
  const topeCosto = Math.max(1, ...COSTOS_FIJOS.map((c) => c.monto));

  return (
    <>
      <AdminHead
        titulo="Costos e ingresos"
        descripcion="Ingreso real de las automatizaciones activas; costos estimados de infraestructura."
      />

      <Cifras columnas={4} etiqueta="Resumen de plata">
        <TarjetaCifra
          icono="costos"
          etiqueta="Ingreso mensual"
          valor={colones(ingreso)}
          pie={
            clientes.length === 0
              ? "Sin clientes todavía"
              : `${aportan} de ${clientes.length} ${clientes.length === 1 ? "cliente aporta" : "clientes aportan"}`
          }
        />
        <TarjetaCifra
          icono="facturacion"
          etiqueta="Costos fijos"
          valor={colones(costos)}
          pie="Infraestructura, estimado"
        />
        <TarjetaCifra
          icono="actividad"
          etiqueta="Neto"
          valor={colonesConSigno(neto)}
          pie={ingreso > 0 ? "Ingreso menos costos" : "Sin ingreso todavía"}
          tono={neto < 0 ? "bad" : "ok"}
        />
        <TarjetaCifra
          icono="reporte"
          etiqueta="Margen"
          valor={ingreso > 0 ? `${margen}%` : "—"}
          pie={ingreso > 0 ? "Neto sobre el ingreso" : "Se calcula con el primer ingreso"}
          tono={ingreso > 0 && neto < 0 ? "bad" : "normal"}
        />
      </Cifras>

      <section className="grid gap-[18px] lg:grid-cols-2">
        <Caja>
          <CajaHead eyebrow="Entra" titulo="Ingreso por cliente" />
          {clientes.length === 0 ? (
            <Vacio icono="clientes" titulo="Sin clientes todavía" plano>
              Cuando des de alta el primero y le asignes una automatización, su ingreso aparece acá.
            </Vacio>
          ) : (
            <>
              <ul className="flex flex-col">
                {porIngreso.map((c, i) => (
                  <li key={c.id} className={cn("py-2.5", i > 0 && "border-t border-line")}>
                    <div className="flex items-baseline justify-between gap-3">
                      <Link
                        href={`/panel/admin/clientes/${c.id}`}
                        prefetch={false}
                        className="-my-1.5 inline-flex min-h-11 min-w-0 flex-wrap items-center gap-x-1 text-[13px] text-ink-soft transition-colors hover:text-[color:var(--panel-acento-texto)] sm:min-h-0 sm:py-0"
                      >
                        <span className="break-words">{c.nombreNegocio}</span>{" "}
                        <span className="text-[11.5px] text-ink-faint">
                          · {c.automatizaciones} {c.automatizaciones === 1 ? "automatización" : "automatizaciones"}
                        </span>
                      </Link>
                      <span
                        className={cn(
                          "flex-none font-mono text-[12.5px] tabular-nums",
                          c.ingresoMensual > 0 ? "text-ink" : "text-ink-faint"
                        )}
                      >
                        {c.ingresoMensual > 0 ? colones(c.ingresoMensual) : "—"}
                      </span>
                    </div>
                    {c.ingresoMensual > 0 ? <Barra pct={(c.ingresoMensual / topeCliente) * 100} /> : null}
                  </li>
                ))}
              </ul>
              <p className="mt-1 flex items-baseline justify-between gap-3 border-t border-line-strong pt-3 text-[13px] font-medium text-ink">
                <span>Total por mes</span>
                <span className="font-mono tabular-nums">{colones(ingreso)}</span>
              </p>
            </>
          )}
        </Caja>

        <Caja>
          <CajaHead eyebrow="Sale" titulo="Costos fijos" />
          <ul className="flex flex-col">
            {COSTOS_FIJOS.map((c, i) => (
              <li key={c.concepto} className={cn("py-2.5", i > 0 && "border-t border-line")}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] text-ink-soft">{c.concepto}</span>
                  <span className="flex-none font-mono text-[12.5px] text-ink tabular-nums">{colones(c.monto)}</span>
                </div>
                <Barra pct={(c.monto / topeCosto) * 100} />
              </li>
            ))}
          </ul>
          <p className="mt-1 flex items-baseline justify-between gap-3 border-t border-line-strong pt-3 text-[13px] font-medium text-ink">
            <span>Total por mes</span>
            <span className="font-mono tabular-nums">{colones(costos)}</span>
          </p>
        </Caja>
      </section>

      <Aviso titulo="Los costos son estimados">
        Salen de la verificación de precios del 2026-09-06 y se editan en{" "}
        <code className="rounded bg-surface-3 px-1.5 py-px font-mono text-[11px]">admin/costos/page.tsx</code>. El ingreso,
        en cambio, es real: la suma de las automatizaciones activas de los clientes activos (los de prueba no cuentan).
      </Aviso>
    </>
  );
}
