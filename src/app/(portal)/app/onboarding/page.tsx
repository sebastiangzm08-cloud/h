import type { Metadata } from "next";
import { CheckCircle, Circle } from "@phosphor-icons/react/dist/ssr";
import { PortalSectionHeader } from "@/components/portal/section-header";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Onboarding — Portal · ${site.nombre}`,
};

const items = [
  { titulo: "Acceso al CRM", hecho: true },
  { titulo: "Acceso a WhatsApp Business API", hecho: true },
  { titulo: "Acceso a la cuenta de Meta Ads", hecho: true },
  { titulo: "Carpeta de Drive compartida", hecho: false },
  { titulo: "Datos de facturación electrónica", hecho: false },
  { titulo: "Contacto del equipo para pruebas", hecho: false },
];

export default function OnboardingPage() {
  const hechos = items.filter((i) => i.hecho).length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
      <PortalSectionHeader
        eyebrow="Portal"
        title={`Arranque · ${hechos} de ${items.length} completados`}
      />

      <div className="mt-8 max-w-xl">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-ink transition-all"
            style={{ width: `${(hechos / items.length) * 100}%` }}
          />
        </div>

        <div className="mt-8 flex flex-col divide-y divide-line rounded-2xl border border-line bg-paper">
          {items.map((item) => (
            <div key={item.titulo} className="flex items-center gap-3 p-4">
              {item.hecho ? (
                <CheckCircle size={19} weight="fill" className="shrink-0 text-ok" />
              ) : (
                <Circle size={19} className="shrink-0 text-ink-faint" />
              )}
              <span
                className={cn(
                  "text-[0.9375rem]",
                  item.hecho ? "text-ink-faint line-through" : "text-ink-soft"
                )}
              >
                {item.titulo}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-5 text-[0.8125rem] leading-relaxed text-ink-faint">
          Los accesos se comparten a través de un gestor de contraseñas, nunca
          por correo o WhatsApp. Te llega una invitación aparte para cada uno.
        </p>
      </div>
    </div>
  );
}
