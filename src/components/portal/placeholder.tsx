import type { Icon } from "@phosphor-icons/react";

export function PortalPlaceholder({
  icon: IconCmp,
  title,
  description,
}: {
  icon: Icon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong px-8 py-16 text-center">
      <IconCmp size={26} className="text-ink-faint" />
      <p className="mt-5 text-[1.0625rem] font-medium tracking-tight text-ink">
        {title}
      </p>
      <p className="mt-2 max-w-[40ch] text-[0.875rem] leading-relaxed text-ink-mute">
        {description}
      </p>
    </div>
  );
}
