"use client";

/* ==========================================================================
   Copiar un dato al portapapeles (el número de SINPE, por ejemplo). Es lo que
   más se hace desde el celular con ese dato: copiarlo y pegarlo en la app del
   banco. Si el navegador no deja copiar, el botón lo dice en vez de fingir.
   ========================================================================== */
import { useEffect, useState } from "react";
import { BTN_SECUNDARIO_CHICO } from "./estilos";
import { IconoCheck } from "./iconos-extra";
import { cn } from "@/lib/utils";

type Estado = "reposo" | "copiado" | "fallo";

export function BotonCopiar({
  texto,
  etiqueta,
  className,
}: {
  /** Lo que se copia. */
  texto: string;
  /** Para el lector de pantalla: "Copiar el número de SINPE". */
  etiqueta: string;
  className?: string;
}) {
  const [estado, setEstado] = useState<Estado>("reposo");

  useEffect(() => {
    if (estado === "reposo") return;
    const t = setTimeout(() => setEstado("reposo"), 2200);
    return () => clearTimeout(t);
  }, [estado]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setEstado("copiado");
    } catch {
      setEstado("fallo");
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      aria-label={etiqueta}
      className={cn(BTN_SECUNDARIO_CHICO, className)}
    >
      {estado === "copiado" ? (
        <>
          <IconoCheck className="h-4 w-4 text-ok" />
          <span role="status">Copiado</span>
        </>
      ) : estado === "fallo" ? (
        <span role="status">No se pudo copiar</span>
      ) : (
        "Copiar"
      )}
    </button>
  );
}
