/* ==========================================================================
   Íconos que `components/panel/iconos.tsx` no trae (ese archivo es
   compartido con todo el panel, así que no se toca desde acá). Mismo trazo:
   24×24, 1.7, `currentColor`.
   ========================================================================== */
import { cn } from "@/lib/utils";

function Base({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function IconoMas({ className }: { className?: string }) {
  return (
    <Base className={className}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  );
}

export function IconoLapiz({ className }: { className?: string }) {
  return (
    <Base className={className}>
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </Base>
  );
}

export function IconoBasura({ className }: { className?: string }) {
  return (
    <Base className={className}>
      <path d="M4 7h16M10 11v6M14 11v6" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </Base>
  );
}

export function IconoCheck({ className }: { className?: string }) {
  return (
    <Base className={className}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Base>
  );
}

export function IconoAlerta({ className }: { className?: string }) {
  return (
    <Base className={className}>
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 10v4.5M12 17.5h.01" />
    </Base>
  );
}

export function IconoProhibido({ className }: { className?: string }) {
  return (
    <Base className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m5.7 5.7 12.6 12.6" />
    </Base>
  );
}

export function IconoChevron({ className }: { className?: string }) {
  return (
    <Base className={className}>
      <path d="m6 9 6 6 6-6" />
    </Base>
  );
}

/** Rueda de carga. Se detiene si la persona pidió menos movimiento. */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
      className={cn("animate-spin motion-reduce:animate-none", className)}
    >
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}
