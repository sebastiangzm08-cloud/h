/* ==========================================================================
   "Próximos recordatorios" de Clientes. Va plegado: con decenas de clientes
   debajo, abrirlo siempre empujaría la lista fuera de la pantalla en el
   celular. Cerrado igual dice cuántos hay y cuál es el próximo.

   Son los que se agendan solos al reservar una cita y los que se programan a
   mano desde una fila. Cancelar uno pide confirmación.
   ========================================================================== */
import { BotonCancelarRecordatorio } from "@/components/panel/agente-recordatorio-form";
import { Icono } from "@/components/panel/iconos";
import type { RecordatorioAgente } from "@/lib/panel/agente";
import { fechaCorta } from "@/lib/panel/agente-formato";

export function RecordatoriosProximos({ recordatorios }: { recordatorios: RecordatorioAgente[] }) {
  if (recordatorios.length === 0) {
    return (
      <section
        aria-label="Próximos recordatorios"
        className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3.5"
      >
        <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-surface-3 text-ink-mute">
          <Icono nombre="campana" className="h-[16px] w-[16px]" />
        </span>
        <p className="min-w-0 text-[12.5px] leading-snug text-ink-mute">
          <b className="block text-[13px] font-medium text-ink">Próximos recordatorios · ninguno</b>
          Acá aparecen los que se agendan solos al reservar una cita y los que programés a mano desde un cliente.
        </p>
      </section>
    );
  }

  const proximo = recordatorios[0];

  return (
    <details className="group rounded-2xl border border-line bg-surface-2">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-surface-3/40 [&::-webkit-details-marker]:hidden">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-[var(--panel-acento-fondo)] text-[color:var(--panel-acento-texto)]">
          <Icono nombre="campana" className="h-[16px] w-[16px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-medium text-ink">
            Próximos recordatorios · {recordatorios.length}
          </span>
          <span className="block truncate text-[12px] text-ink-mute">
            El próximo: {proximo.nombre}, {fechaCorta(proximo.cuando)}
          </span>
        </span>
        <Icono
          nombre="flecha"
          className="h-4 w-4 flex-none text-ink-faint transition-transform duration-200 group-open:rotate-90"
        />
      </summary>

      <ul className="border-t border-line">
        {recordatorios.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-3 border-line px-4 py-3 [&+&]:border-t"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-snug text-ink-soft">
                <span className="font-medium text-ink">{r.nombre}</span> · {r.mensaje}
              </p>
              <p className="mt-1 font-mono text-[11px] leading-snug text-ink-faint">
                {fechaCorta(r.cuando)}
                {r.origen === "cita" ? " · de una cita" : ""}
                {r.repetirCadaHoras ? ` · se repite cada ${r.repetirCadaHoras} h` : ""}
              </p>
            </div>
            <BotonCancelarRecordatorio id={r.id} />
          </li>
        ))}
      </ul>
    </details>
  );
}
