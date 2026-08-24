import type { Metadata } from "next";
import { CreditCard } from "@phosphor-icons/react/dist/ssr";
import { PortalSectionHeader } from "@/components/portal/section-header";
import { organizacion } from "@/lib/mock-portal";
import { colones, site } from "@/config/site";

export const metadata: Metadata = {
  title: `Pagos y facturas — Portal · ${site.nombre}`,
};

const historial = [
  { periodo: "Agosto 2026", monto: 125000, estado: "Pagado", fecha: "05 ago" },
  { periodo: "Julio 2026", monto: 125000, estado: "Pagado", fecha: "05 jul" },
  { periodo: "Junio 2026", monto: 125000, estado: "Pagado", fecha: "06 jun" },
];

export default function PagosPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
      <PortalSectionHeader eyebrow="Portal" title="Pagos y facturas" />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <div className="flex items-center gap-2 text-ink-faint">
              <CreditCard size={16} />
              <span className="eyebrow">Plan actual</span>
            </div>
            <p className="mt-3 text-[1.25rem] font-semibold tracking-tight text-ink">
              {organizacion.plan}
            </p>
            <p className="mt-1 text-[0.875rem] tnum text-ink-mute">
              {colones(organizacion.montoProximoCobro)} / mes
            </p>
            <div className="mt-5 border-t border-line pt-5">
              <p className="text-[0.8125rem] text-ink-faint">Método de pago</p>
              <p className="mt-1 text-[0.875rem] text-ink-soft">
                SINPE Móvil
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <p className="eyebrow mb-4">Historial</p>
          <div className="overflow-hidden rounded-2xl border border-line">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-surface-2 text-[0.75rem] text-ink-faint uppercase">
                  <th className="px-5 py-3 font-normal tracking-wide">Periodo</th>
                  <th className="px-5 py-3 font-normal tracking-wide">Monto</th>
                  <th className="px-5 py-3 font-normal tracking-wide">Estado</th>
                  <th className="px-5 py-3 font-normal tracking-wide">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-paper">
                {historial.map((h) => (
                  <tr key={h.periodo}>
                    <td className="px-5 py-4 text-[0.875rem] text-ink-soft">
                      {h.periodo}
                    </td>
                    <td className="px-5 py-4 text-[0.875rem] tnum text-ink">
                      {colones(h.monto)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-ok/10 px-2.5 py-0.5 text-[0.75rem] text-ok">
                        {h.estado}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[0.8125rem] tnum text-ink-faint">
                      {h.fecha}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
