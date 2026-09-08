"use client";

/* ==========================================================================
   Algo reventó dentro del panel. Mantiene el marco (barra lateral incluida)
   y da dos salidas: reintentar la misma pantalla o volver al inicio. En
   desarrollo muestra el detalle; en producción, solo el digest para
   reportarlo.
   ========================================================================== */
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPanel({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error en el panel:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-start gap-4 py-10">
      <span className="font-mono text-[11px] tracking-[0.14em] text-ink-faint uppercase">
        Algo falló
      </span>
      <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">
        No pudimos cargar esta pantalla
      </h1>
      <p className="max-w-[52ch] text-[13px] text-ink-faint">
        Fue de nuestro lado, no tuyo. Probá de nuevo en un momento; si sigue
        igual, escribinos y lo miramos.
      </p>

      {process.env.NODE_ENV === "development" ? (
        <pre className="max-w-full overflow-x-auto rounded-xl border border-line bg-surface-2 p-4 text-[11.5px] leading-relaxed text-bad">
          {error.message}
        </pre>
      ) : error.digest ? (
        <p className="font-mono text-[11px] text-ink-faint">
          Referencia: {error.digest}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={reset}
          className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft"
        >
          Reintentar
        </button>
        <Link
          href="/panel"
          className="inline-flex h-10 items-center rounded-full border border-line-strong px-5 text-[13px] text-ink transition-colors hover:bg-surface-2"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
