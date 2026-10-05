"use client";

import { useId, useState } from "react";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

export function FaqAccordion({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  const base = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line border-t border-b border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        const idBoton = `${base}-q-${i}`;
        const idPanel = `${base}-a-${i}`;
        return (
          <div key={item.q}>
            <h3>
              <button
                id={idBoton}
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left"
                aria-expanded={isOpen}
                aria-controls={idPanel}
              >
                <span className="text-[1.0625rem] font-medium tracking-tight text-ink">
                  {item.q}
                </span>
                <Plus
                  size={18}
                  aria-hidden="true"
                  className={cn(
                    "shrink-0 text-ink-faint transition-transform duration-200 ease-out",
                    isOpen && "rotate-45"
                  )}
                />
              </button>
            </h3>
            <div
              id={idPanel}
              role="region"
              aria-labelledby={idBoton}
              inert={!isOpen}
              className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="min-h-0">
                <p className="max-w-[62ch] pb-6 text-[0.9375rem] leading-relaxed text-ink-mute">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
