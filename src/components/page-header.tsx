import type { ReactNode } from "react";
import { Reveal } from "@/components/reveal";

export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <p className="eyebrow mb-5">{eyebrow}</p>
          <h1 className="max-w-[24ch] text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.03em] text-ink sm:text-[3.25rem]">
            {title}
          </h1>
          {lead && (
            <p className="mt-6 max-w-[56ch] text-[1.0625rem] leading-relaxed text-ink-mute">
              {lead}
            </p>
          )}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
