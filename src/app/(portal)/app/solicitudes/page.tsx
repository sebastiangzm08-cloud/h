import type { Metadata } from "next";
import { ChatCircleDots } from "@phosphor-icons/react/dist/ssr";
import { PortalSectionHeader } from "@/components/portal/section-header";
import { PortalPlaceholder } from "@/components/portal/placeholder";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Solicitudes — Portal · ${site.nombre}`,
};

export default function SolicitudesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
      <PortalSectionHeader
        eyebrow="Portal"
        title="Solicitudes"
        action={
          <Button variant="primary" size="md">
            Nueva solicitud
          </Button>
        }
      />
      <div className="mt-8">
        <PortalPlaceholder
          icon={ChatCircleDots}
          title="Sin solicitudes abiertas"
          description="Acá vas a ver el estado de cada cambio o reporte de falla que pidas, con el tiempo de respuesta de tu plan."
        />
      </div>
    </div>
  );
}
