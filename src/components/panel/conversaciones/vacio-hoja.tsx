import Link from "next/link";

/**
 * Estado vacío honesto dentro de una hoja: dice QUÉ falta y lleva directo a
 * donde se carga, en vez de un botón que no hace nada.
 */
export function VacioHoja({
  texto,
  href,
  enlace,
}: {
  texto: string;
  href?: string;
  enlace?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-line-strong px-4 py-5">
      <p className="text-[13.5px] leading-snug text-ink-mute">{texto}</p>
      {href && enlace ? (
        <Link
          href={href}
          className="inline-flex h-11 items-center rounded-xl border border-line-strong px-4 text-[13px] font-medium text-ink-soft transition-colors hover:bg-surface-2 active:bg-surface-3"
        >
          {enlace}
        </Link>
      ) : null}
    </div>
  );
}
