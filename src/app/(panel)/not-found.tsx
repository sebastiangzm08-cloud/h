/* ==========================================================================
   404 dentro del panel: mantiene la barra lateral y ofrece la salida.
   ========================================================================== */
import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="flex flex-col items-start gap-4 py-10">
      <span className="font-mono text-[11px] tracking-[0.14em] text-ink-faint uppercase">
        Error 404
      </span>
      <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">
        Esto no existe (o ya no)
      </h1>
      <p className="max-w-[52ch] text-[13px] text-ink-faint">
        El enlace que seguiste no lleva a ninguna parte. Puede que la
        automatización o el cliente que buscabas se haya movido.
      </p>
      <Link
        href="/panel"
        className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
