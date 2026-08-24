import type { Metadata } from "next";
import { PortalSectionHeader } from "@/components/portal/section-header";
import { Button } from "@/components/ui/button";
import { organizacion } from "@/lib/mock-portal";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Ajustes — Portal · ${site.nombre}`,
};

export default function AjustesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
      <PortalSectionHeader eyebrow="Portal" title="Ajustes" />

      <div className="mt-8 max-w-lg">
        <p className="eyebrow mb-4">Perfil de la empresa</p>
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
          <div>
            <label className="text-[0.8125rem] font-medium text-ink-soft">
              Nombre de la empresa
            </label>
            <input
              defaultValue={organizacion.nombre}
              className="mt-2 h-11 w-full rounded-lg border border-line-strong bg-paper px-4 text-[0.9375rem] text-ink outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="text-[0.8125rem] font-medium text-ink-soft">
              Costo por hora de tu equipo (₡)
            </label>
            <input
              type="number"
              defaultValue={organizacion.costoHora}
              className="mt-2 h-11 w-full rounded-lg border border-line-strong bg-paper px-4 text-[0.9375rem] text-ink outline-none focus:border-ink"
            />
            <p className="mt-1.5 text-[0.75rem] text-ink-faint">
              Se usa para calcular el ahorro en dinero del resumen.
            </p>
          </div>
          <Button variant="primary" size="md" className="mt-1 self-start">
            Guardar cambios
          </Button>
        </div>

        <p className="eyebrow mb-4 mt-10">Notificaciones</p>
        <div className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
          {[
            "Una automatización falla",
            "Se acerca al límite del plan",
            "Se resuelve una solicitud",
            "Informe mensual",
          ].map((n) => (
            <label key={n} className="flex items-center justify-between p-4">
              <span className="text-[0.875rem] text-ink-soft">{n}</span>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-[var(--color-ink)]"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
