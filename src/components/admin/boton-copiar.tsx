"use client";

/* ==========================================================================
   Copia un texto al portapapeles y avisa que lo hizo. Lo usan el alta (datos
   de acceso del cliente nuevo) y las demos (el link).
   ========================================================================== */
import { useState } from "react";
import { BTN_CHICO_SECUNDARIO } from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

export function BotonCopiar({
  texto,
  etiqueta = "Copiar",
  className,
}: {
  texto: string;
  etiqueta?: string;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 1800);
        } catch {
          /* Portapapeles bloqueado (permiso o http sin TLS): no hay más que
             hacer que dejar el texto visible para copiarlo a mano. */
        }
      }}
      className={cn(BTN_CHICO_SECUNDARIO, className)}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        {copiado ? (
          <path d="m5 12 5 5 9-9" />
        ) : (
          <>
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M6 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V6" />
          </>
        )}
      </svg>
      <span aria-live="polite">{copiado ? "¡Copiado!" : etiqueta}</span>
    </button>
  );
}
