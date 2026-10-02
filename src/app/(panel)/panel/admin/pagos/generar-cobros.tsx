"use client";

/* ==========================================================================
   Genera los cobros de un mes de una pasada. El periodo arranca en el mes
   corriente; se puede cambiar a mano (ej. adelantar el de octubre).
   ========================================================================== */
import { useAccionAdmin } from "@/components/panel/usar-accion-admin";
import { CampoToken } from "@/components/panel/campo-token";
import { Caja, CajaHead } from "@/components/panel/ui";
import { BTN_PRIMARIO, CAMPO, ETIQUETA, MensajeAccion } from "@/components/admin/admin-ui";
import { useEnvio } from "@/components/admin/usar-envio";

export function GenerarCobros({ periodoActual }: { periodoActual: string }) {
  const [estado, ejecutar, pendiente] = useAccionAdmin("generarCobrosDelMes");
  /* El periodo vuelve a su valor de siempre (el mes corriente) al terminar. */
  const envio = useEnvio(estado, ejecutar);

  return (
    <Caja>
      <CajaHead eyebrow="Cada mes" titulo="Generar los cobros del mes" />
      <form {...envio} className="flex flex-col gap-3">
        <CampoToken />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex min-w-0 flex-col gap-1.5 sm:w-64">
            <span className={ETIQUETA}>Periodo a generar</span>
            <input
              name="periodo"
              defaultValue={periodoActual}
              required
              autoComplete="off"
              className={CAMPO}
            />
          </label>
          <button type="submit" disabled={pendiente} className={BTN_PRIMARIO}>
            {pendiente ? "Generando…" : "Generar cobros del mes"}
          </button>
        </div>
        <p className="text-[12px] leading-snug text-ink-faint">
          Un cobro <span className="text-ink-mute">pendiente</span> por cada cliente activo con
          automatizaciones, por la suma de sus tarifas. No duplica: salta a quien ya tenga el de ese
          periodo.
        </p>
        <MensajeAccion estado={estado} />
      </form>
    </Caja>
  );
}
