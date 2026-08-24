"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  Lightning,
  ChatCircleDots,
  ClipboardText,
  CreditCard,
  UsersThree,
  Gear,
  SignOut,
} from "@phosphor-icons/react/dist/ssr";
import { ConstellationMark } from "@/components/constellation";
import { organizacion } from "@/lib/mock-portal";
import { cn } from "@/lib/utils";

const links = [
  { href: "/app", label: "Resumen", icon: SquaresFour },
  { href: "/app/automatizaciones", label: "Automatizaciones", icon: Lightning },
  { href: "/app/solicitudes", label: "Solicitudes", icon: ChatCircleDots },
  { href: "/app/onboarding", label: "Onboarding", icon: ClipboardText },
  { href: "/app/pagos", label: "Pagos y facturas", icon: CreditCard },
  { href: "/app/equipo", label: "Equipo", icon: UsersThree },
  { href: "/app/ajustes", label: "Ajustes", icon: Gear },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-line px-6">
        <ConstellationMark className="h-5 w-5 text-ink" />
        <span className="text-[0.875rem] font-semibold tracking-tight">
          Portal
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {links.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.875rem] tracking-tight transition-colors",
                active
                  ? "bg-ink text-paper"
                  : "text-ink-mute hover:bg-surface-2 hover:text-ink"
              )}
            >
              <Icon size={17} weight={active ? "fill" : "regular"} />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-4">
        <div className="rounded-lg bg-surface-2 px-3 py-2.5">
          <p className="truncate text-[0.8125rem] font-medium text-ink">
            {organizacion.nombre}
          </p>
          <p className="text-[0.75rem] text-ink-faint">Plan {organizacion.plan}</p>
        </div>
        <Link
          href="/"
          className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.8125rem] text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <SignOut size={16} />
          Salir al sitio
        </Link>
      </div>
    </aside>
  );
}
