"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConstellationMark } from "@/components/constellation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/app", label: "Resumen" },
  { href: "/app/automatizaciones", label: "Automatizaciones" },
  { href: "/app/solicitudes", label: "Solicitudes" },
  { href: "/app/onboarding", label: "Onboarding" },
  { href: "/app/pagos", label: "Pagos" },
];

export function MobileTopbar() {
  const pathname = usePathname();
  return (
    <div className="border-b border-line bg-surface lg:hidden">
      <div className="flex h-14 items-center gap-2.5 px-5">
        <ConstellationMark className="h-5 w-5 text-ink" />
        <span className="text-[0.875rem] font-semibold tracking-tight">
          Portal
        </span>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-[0.8125rem] tracking-tight transition-colors",
                active
                  ? "bg-ink text-paper"
                  : "bg-surface-2 text-ink-mute"
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
