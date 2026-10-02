"use client";

import type { ReactNode } from "react";

/**
 * El botón-píldora de una acción rápida. 44 px de alto (objetivo táctil),
 * `flex-none` para que la fila con scroll horizontal no los encoja, y estado
 * `active` además del hover (en celular no hay hover).
 */
export function ChipAccion({
  icono,
  children,
  onClick,
}: {
  icono: ReactNode;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className="inline-flex h-11 flex-none items-center gap-2 rounded-full border border-line-strong bg-surface-2 pr-4 pl-3.5 text-[13px] font-medium whitespace-nowrap text-ink-soft transition-[background-color,border-color,transform] duration-150 hover:border-[var(--panel-acento-borde)] hover:bg-[var(--panel-acento-fondo)] active:scale-[0.97] active:bg-[var(--panel-acento-fondo)]"
    >
      <span className="text-[color:var(--panel-acento-texto)]">{icono}</span>
      {children}
    </button>
  );
}
