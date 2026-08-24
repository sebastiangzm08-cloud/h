import type { Metadata } from "next";
import { UsersThree } from "@phosphor-icons/react/dist/ssr";
import { PortalSectionHeader } from "@/components/portal/section-header";
import { Button } from "@/components/ui/button";
import { organizacion } from "@/lib/mock-portal";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Equipo — Portal · ${site.nombre}`,
};

const miembros = [
  { nombre: "Carla Rovira", correo: "carla@losrobles.cr", rol: "Propietaria" },
  { nombre: "Diego Solano", correo: "diego@losrobles.cr", rol: "Administración" },
];

export default function EquipoPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
      <PortalSectionHeader
        eyebrow={organizacion.nombre}
        title="Equipo"
        action={
          <Button variant="primary" size="md">
            <UsersThree size={16} />
            Invitar persona
          </Button>
        }
      />

      <div className="mt-8 flex flex-col divide-y divide-line rounded-2xl border border-line bg-paper">
        {miembros.map((m) => (
          <div key={m.correo} className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-[0.875rem] font-medium text-ink-soft">
                {m.nombre.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-[0.9375rem] font-medium text-ink">
                  {m.nombre}
                </p>
                <p className="text-[0.8125rem] text-ink-faint">{m.correo}</p>
              </div>
            </div>
            <span className="text-[0.8125rem] text-ink-mute">{m.rol}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
