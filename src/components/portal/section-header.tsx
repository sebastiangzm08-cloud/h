import type { ReactNode } from "react";

export function PortalSectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-ink">
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}
