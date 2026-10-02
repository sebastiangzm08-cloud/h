/* ==========================================================================
   2. Ventas — citas marcadas como cumplidas × el monto de la cita, del mes.

   Mismo criterio que "Ingreso de citas cumplidas" del Inicio. Si una cita
   cumplida no trae monto no se inventa uno: se cuenta aparte y se dice. Y si
   hay citas del mes que ya pasaron sin marcar, se avisa que las ventas pueden
   estar quedando cortas (es lo que más suele pasar).
   ========================================================================== */
import Link from "next/link";
import { Caja, CajaHead, colones } from "@/components/panel/ui";
import type { Ventas } from "@/lib/panel/resultados-calculo";
import { Calculo, EstadoVacio, IconoAlerta, NoDisponible, entero } from "./comunes";

const MAX_SERVICIOS = 6;

function citas(n: number, singular: string, plural: string) {
  return `${entero(n)} ${n === 1 ? singular : plural}`;
}

function enlaceAccion(href: string, texto: string) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="mt-0.5 inline-flex min-h-11 items-center gap-1 font-medium text-[color:var(--panel-acento-texto)] hover:opacity-80"
    >
      {texto}
      <span aria-hidden="true">→</span>
    </Link>
  );
}

export function VentasDelMes({ ventas }: { ventas: Ventas | null }) {
  if (ventas === null) {
    return (
      <Caja>
        <CajaHead eyebrow="Este mes" titulo="Ventas" />
        <NoDisponible que="las ventas" />
      </Caja>
    );
  }

  const v = ventas;
  const servicios = v.porServicio.slice(0, MAX_SERVICIOS);
  const resto = v.porServicio.length - servicios.length;

  return (
    <Caja>
      <CajaHead eyebrow="Este mes" titulo={`Ventas de ${v.mes}`} />
      <p className="-mt-2 mb-4 text-[12.5px] text-ink-mute">
        Suma del monto de las citas que marcaste como cumplidas.
      </p>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-8 xl:grid-cols-1 xl:gap-5">
        <div className="min-w-0">
          <p className="text-[34px] leading-none font-semibold tracking-[-0.03em] break-words text-ink tabular-nums sm:text-[40px]">
            {colones(v.total)}
          </p>
          <p className="mt-2 text-[13px] text-ink-mute">
            {v.cumplidas === 0 ? (
              "Todavía no hay citas cumplidas este mes"
            ) : (
              <>
                {citas(v.cumplidas, "cita cumplida", "citas cumplidas")}
                {v.ticketPromedio !== null ? <> · promedio de {colones(v.ticketPromedio)} por cita con monto</> : null}
              </>
            )}
          </p>
          <p className="mt-3 text-[12px] text-ink-mute">
            {v.mesPasadoCumplidas === 0 ? (
              <>Mes pasado ({v.mesPasado}): sin citas marcadas como cumplidas</>
            ) : (
              <>
                Mes pasado ({v.mesPasado}, completo):{" "}
                <b className="font-medium text-ink tabular-nums">{colones(v.mesPasadoTotal)}</b> ·{" "}
                {citas(v.mesPasadoCumplidas, "cita", "citas")}
              </>
            )}
          </p>

          <div className="mt-4 flex flex-col gap-2.5">
            {v.pasadasSinMarcar > 0 ? (
              <div className="flex items-start gap-3 rounded-xl border border-warn/30 bg-warn/[0.07] px-3.5 py-3 text-[12.5px] leading-snug text-ink-soft">
                <IconoAlerta className="mt-0.5 h-4 w-4 flex-none text-warn" />
                <p className="min-w-0">
                  <b className="font-medium text-ink">
                    {citas(v.pasadasSinMarcar, "cita de este mes ya pasó", "citas de este mes ya pasaron")} y{" "}
                    {v.pasadasSinMarcar === 1 ? "sigue sin marcar" : "siguen sin marcar"}.
                  </b>{" "}
                  Si se hicieron, marcalas como cumplidas para que sumen acá.
                  <br />
                  {enlaceAccion("/panel/agente/citas", "Ir a Agenda")}
                </p>
              </div>
            ) : null}

            {v.sinMonto > 0 ? (
              <div className="rounded-xl bg-surface-3 px-3.5 py-3 text-[12.5px] leading-snug text-ink-mute">
                {v.conMonto === 0 ? (
                  <>
                    <b className="font-medium text-ink-soft">
                      {v.sinMonto === 1
                        ? "La cita cumplida no tiene monto"
                        : `Las ${entero(v.sinMonto)} citas cumplidas no tienen monto`}
                    </b>
                    , por eso las ventas dan {colones(0)}. Cargá el precio de tus servicios en Conocimiento para que las
                    próximas sí sumen.
                  </>
                ) : (
                  <>
                    <b className="font-medium text-ink-soft">
                      {citas(v.sinMonto, "cita cumplida no tiene", "citas cumplidas no tienen")} monto
                    </b>{" "}
                    (gratis o sin precio cargado) y no suma{v.sinMonto === 1 ? "" : "n"}. No se inventa un valor.
                  </>
                )}
                <br />
                {enlaceAccion("/panel/agente/que-sabe", "Revisar precios en Conocimiento")}
              </div>
            ) : null}
          </div>
        </div>

        <div className="min-w-0">
          <p className="mb-2.5 text-[12.5px] font-medium text-ink-mute">Por servicio</p>
          {servicios.length === 0 ? (
            <EstadoVacio titulo="Todavía no hay ventas este mes">
              Cuando marqués una cita como «Cumplida» en Agenda, acá aparece el servicio y cuánto dejó.
            </EstadoVacio>
          ) : (
            <ul className="flex flex-col">
              {servicios.map((s, i) => {
                const parte = v.total > 0 ? Math.round((s.total / v.total) * 100) : 0;
                return (
                  <li key={s.servicio} className={i > 0 ? "border-t border-line py-3" : "pb-3"}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 truncate text-[13px] font-medium text-ink">{s.servicio}</span>
                      <span className="flex-none text-[13px] whitespace-nowrap text-ink tabular-nums">
                        {s.total > 0 ? colones(s.total) : <span className="text-ink-faint">Sin monto</span>}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3">
                      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
                        {s.total > 0 ? (
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[var(--panel-acento)]/60 to-[var(--panel-acento)]"
                            style={{ width: `${Math.max(2, parte)}%` }}
                          />
                        ) : null}
                      </div>
                      <span className="flex-none font-mono text-[11px] whitespace-nowrap text-ink-faint">
                        {citas(s.cantidad, "cita", "citas")}
                        {s.total > 0 ? ` · ${parte}%` : ""}
                      </span>
                    </div>
                  </li>
                );
              })}
              {resto > 0 ? (
                <li className="border-t border-line pt-3 text-[12px] text-ink-faint">
                  Y {citas(resto, "servicio más", "servicios más")}.
                </li>
              ) : null}
            </ul>
          )}
        </div>
      </div>

      {v.incompleto ? (
        <p className="mt-3 text-[11.5px] text-warn">
          Hay muchísimas citas cumplidas: la suma puede quedar un poco corta.
        </p>
      ) : null}

      <Calculo>
        <p>
          <b className="font-medium text-ink-mute">Ventas</b> = suma del monto de las citas que ya pasaron y marcaste
          como «Cumplida» este mes (de {v.mes}, hora de Costa Rica). Es el mismo cálculo de «Ingreso de citas cumplidas»
          en el Inicio.
        </p>
        <p>
          El monto es el que tiene cada cita (el precio del servicio cuando se agendó). Una cita sin monto no suma y se
          avisa arriba: nunca se le inventa un valor.
        </p>
        <p>
          Solo cuenta lo que pasó por las citas del agente. No incluye cobros que hagas por otro lado ni propinas, y no
          descuenta nada.
        </p>
      </Calculo>
    </Caja>
  );
}
