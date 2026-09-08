"use client";

/* ==========================================================================
   Genera los cobros de un mes de una pasada. El periodo arranca en el mes
   corriente; se puede cambiar a mano (ej. adelantar el de octubre).
   ========================================================================== */
import { useActionState } from "react";
import {
  generarCobrosDelMes,
  type ResultadoAccion,
} from "@/lib/panel/admin-acciones";
import { cn } from "@/lib/utils";

export function GenerarCobros({ periodoActual }: { periodoActual: string }) {
  const [estado, ejecutar, pendiente] = useActionState<
    ResultadoAccion | null,
    FormData
  >(generarCobrosDelMes, null);

  return (
    <form
      action={ejecutar}
      className="flex flex-wrap items-end gap-2.5 rounded-2xl border border-line bg-surface-2 p-4"
    >
      <label className="flex flex-col gap-1">
        <span className="text-[10.5px] font-medium tracking-wide text-ink-mute uppercase">
          Periodo a generar
        </span>
        <input
          name="periodo"
          defaultValue={periodoActual}
          required
          className="h-9 w-44 rounded-lg border border-line bg-surface-3 px-2.5 text-[12.5px] text-ink transition-colors focus:border-line-strong focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={pendiente}
        className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-[12px] font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-50"
      >
        {pendiente ? "Generando…" : "Generar cobros del mes"}
      </button>
      <p className="w-full text-[11px] text-ink-faint">
        Un cobro <span className="text-ink-mute">pendiente</span> por cada
        cliente activo con automatizaciones, por la suma de sus tarifas. No
        duplica: salta a quien ya tenga el de ese periodo.
      </p>
      {estado ? (
        <p
          role={estado.ok ? "status" : "alert"}
          className={cn(
            "w-full rounded-lg px-3 py-2 text-[12px]",
            estado.ok ? "bg-ok/10 text-ok" : "bg-bad/10 text-bad"
          )}
        >
          {estado.ok ? estado.mensaje : estado.error}
        </p>
      ) : null}
    </form>
  );
}
