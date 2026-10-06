"use client";

/* ==========================================================================
   Resultados, versión demostración.

   SOLO lo que se puede medir de esta sesión: cuántos mensajes respondió el
   agente, cuánto tardó de verdad (desde que se envía hasta que se ve la
   respuesta), cuántas consultas pasarían a una persona, cuántas citas anotó y
   qué consultó. Sin proyecciones, sin dinero y sin comparar con nadie.
   ========================================================================== */
import { ResumenCifras } from "@/components/panel/clientes/piezas";
import { HERRAMIENTAS, NOMBRE_HERRAMIENTA } from "@/lib/demo/tipos";
import { cn } from "@/lib/utils";
import { segundosTexto, type Metricas } from "./estado";
import { BotonPanel, Rotulo } from "./piezas";

function Bloque({ rotulo, titulo, children }: { rotulo: string; titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface-2 p-4">
      <Rotulo>{rotulo}</Rotulo>
      <h3 className="mt-1 text-[14.5px] font-semibold tracking-tight text-ink">{titulo}</h3>
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

function Barra({ pct, className }: { pct: number; className?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
      <div
        className={cn("medidor-barra h-full w-full rounded-full", className ?? "bg-[var(--panel-acento)]")}
        style={{ "--pct": Math.max(0, Math.min(1, pct)) } as React.CSSProperties}
      />
    </div>
  );
}

export function VistaResultados({
  metricas,
  restantes,
  tope,
  onIrAlChat,
}: {
  metricas: Metricas;
  restantes: number;
  tope: number;
  onIrAlChat: (texto?: string) => void;
}) {
  const m = metricas;
  const vacio = m.respondidos === 0;
  const maxMs = Math.max(1, ...m.tiempos);
  const ultimos = m.tiempos.slice(-16);
  const consumidos = Math.max(0, tope - restantes);

  return (
    <div className="scroll-fino @container h-full min-h-0 overflow-y-auto overscroll-contain">
      <div className="flex flex-col gap-4 p-4">
        <div>
          <h2 className="text-[17px] font-medium tracking-tight text-ink">Resultados</h2>
          <p className="mt-1 text-[12.5px] leading-snug text-ink-mute">
            Lo que se midió en esta conversación de prueba, mensaje a mensaje.
          </p>
        </div>

        <ResumenCifras
          etiqueta="Cifras de la conversación de prueba"
          className="grid-cols-2 @[560px]:grid-cols-4"
          cifras={[
            { valor: String(m.respondidos), etiqueta: "Mensajes respondidos" },
            {
              valor: m.promedioMs === null ? "—" : segundosTexto(m.promedioMs),
              etiqueta: "Tiempo de respuesta promedio",
            },
            {
              valor: String(m.aPersona),
              etiqueta: "Pasarían a una persona",
              alerta: m.aPersona > 0,
            },
            { valor: String(m.citasConfirmadas), etiqueta: "Citas anotadas" },
          ]}
        />

        {vacio ? (
          <div className="rounded-2xl border border-dashed border-line-strong px-5 py-8 text-center">
            <p className="text-[14px] font-medium text-ink-soft">Todavía no hay nada que medir</p>
            <p className="mx-auto mt-1.5 max-w-[40ch] text-[12.5px] leading-relaxed text-ink-mute">
              Estas cifras salen de su conversación y cambian en vivo: cada respuesta del agente se cuenta y se
              mide el tiempo real que tardó.
            </p>
            <div className="mt-4 flex justify-center">
              <BotonPanel onClick={() => onIrAlChat()}>Escribirle al agente</BotonPanel>
            </div>
          </div>
        ) : (
          <>
            <Bloque rotulo="Esta conversación" titulo="Cuánto tardó cada respuesta">
              <div
                role="img"
                aria-label={`Tiempo de cada respuesta: ${ultimos.map(segundosTexto).join(", ")}`}
                className="flex h-24 items-end gap-2"
              >
                {ultimos.map((ms, i) => (
                  <div key={i} className="flex h-full min-w-0 max-w-14 flex-1 flex-col justify-end" title={segundosTexto(ms)}>
                    <div
                      className="demo-barra w-full rounded-t-[5px] bg-[var(--panel-acento)]"
                      style={{ height: `${Math.max(8, (ms / maxMs) * 100)}%`, "--i": i } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11.5px] text-ink-mute">
                <span>
                  Más rápida <b className="font-medium text-ink">{segundosTexto(m.masRapidaMs ?? 0)}</b>
                </span>
                <span>
                  Más lenta <b className="font-medium text-ink">{segundosTexto(m.masLentaMs ?? 0)}</b>
                </span>
              </p>
              <p className="mt-2 text-[11.5px] leading-snug text-ink-faint">
                Medido desde que usted envía el mensaje hasta que ve la respuesta.
              </p>
            </Bloque>

            <Bloque rotulo="Herramientas" titulo="Qué consultó el agente para contestar">
              <ul className="flex flex-col gap-3">
                {HERRAMIENTAS.map((h) => {
                  const veces = m.herramientas[h];
                  return (
                    <li key={h}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3">
                        <span className={cn("text-[13px]", veces > 0 ? "text-ink" : "text-ink-faint")}>
                          {NOMBRE_HERRAMIENTA[h]}
                        </span>
                        <span className="font-mono text-[12px] text-ink-mute tabular-nums">
                          {veces} de {m.respondidos}
                        </span>
                      </div>
                      <Barra pct={veces / m.respondidos} />
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-[11.5px] leading-snug text-ink-faint">
                Se deduce de lo que la respuesta realmente dice, no de lo que el agente diga de sí mismo.
              </p>
            </Bloque>

            {m.citasPorConfirmar > 0 ? (
              <p className="rounded-xl bg-warn/10 px-4 py-3 text-[12.5px] leading-snug text-warn">
                {m.citasPorConfirmar === 1 ? "Hay 1 cita" : `Hay ${m.citasPorConfirmar} citas`} en coordinación: falta que
                la persona confirme un día y una hora.
              </p>
            ) : null}
          </>
        )}

        <Bloque rotulo="Esta demostración" titulo="Mensajes de prueba">
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="text-[13px] text-ink">
              {restantes > 0 ? `Quedan ${restantes} de ${tope}` : "Se agotaron"}
            </span>
            <span className="font-mono text-[12px] text-ink-mute tabular-nums">
              {consumidos} / {tope}
            </span>
          </div>
          <Barra pct={tope > 0 ? consumidos / tope : 0} className={restantes <= 0 ? "bg-warn" : undefined} />
        </Bloque>
      </div>
    </div>
  );
}
