"use client";

/* ==========================================================================
   Interruptor de tema — claro / automático / oscuro. Vive en el header de
   TODAS las áreas con `.panel-scope` (panel de cliente, admin, y el entorno
   del Agente), así que un solo componente chico en vez de repetir la lógica
   en cada layout.
   ========================================================================== */
import { useEffect, useState } from "react";
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import { TEMA_STORAGE_KEY, esTema, type Tema } from "@/lib/panel/tema";
import { cn } from "@/lib/utils";

const OPCIONES: { valor: Tema; icono: NombreIcono; etiqueta: string }[] = [
  { valor: "claro", icono: "sol", etiqueta: "Tema claro" },
  { valor: "automatico", icono: "automatico", etiqueta: "Tema automático, según tu sistema" },
  { valor: "oscuro", icono: "luna", etiqueta: "Tema oscuro" },
];

export function TemaSelector() {
  /* Arranca en "oscuro" (el default de siempre) y se corrige apenas monta,
     leyendo lo que ya había elegido esta persona — el <script> de abajo ya
     lo aplicó al DOM antes de que React pintara nada, esto solo pone al
     botón correcto en "presionado". */
  const [tema, setTema] = useState<Tema>("oscuro");

  useEffect(() => {
    const guardado = localStorage.getItem(TEMA_STORAGE_KEY);
    if (esTema(guardado)) setTema(guardado);
  }, []);

  function elegir(t: Tema) {
    setTema(t);
    localStorage.setItem(TEMA_STORAGE_KEY, t);
    document.querySelector(".panel-scope")?.setAttribute("data-tema", t);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="flex items-center gap-0.5 rounded-[9px] border border-line bg-surface-2 p-0.5"
    >
      {OPCIONES.map((o) => (
        <button
          key={o.valor}
          type="button"
          role="radio"
          aria-checked={tema === o.valor}
          onClick={() => elegir(o.valor)}
          title={o.etiqueta}
          className={cn(
            "grid h-10 w-10 place-items-center rounded-[8px] transition-colors lg:h-[26px] lg:w-[26px] lg:rounded-[7px]",
            tema === o.valor
              ? "bg-surface-3 text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.11)]"
              : "text-ink-faint hover:text-ink-mute"
          )}
        >
          <Icono nombre={o.icono} className="h-[15px] w-[15px]" />
        </button>
      ))}
    </div>
  );
}
