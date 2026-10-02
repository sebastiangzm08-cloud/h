/* ==========================================================================
   3. Oportunidades — gente que preguntó el precio y no tiene cita en 60 días.

   Misma definición de "Oportunidades" del Inicio (regex de precio sobre sus
   mensajes + sin cita no cancelada), pero mirando 60 días y no solo hoy.
   Componente de servidor: cada fila lleva a la conversación real.
   ========================================================================== */
import Link from "next/link";
import { Caja, CajaHead } from "@/components/panel/ui";
import { relativa } from "@/lib/panel/agente-formato";
import type { Oportunidad, Oportunidades, TramoEdad } from "@/lib/panel/resultados-calculo";
import { cn } from "@/lib/utils";
import { Calculo, Dato, EstadoVacio, IconoChevron, NoDisponible, entero, iniciales } from "./comunes";

const VISIBLES = 8;

const COLOR_TRAMO: Record<TramoEdad["clave"], string> = {
  reciente: "bg-ink-faint/55",
  "1a3": "bg-[var(--panel-acento)]",
  "4a14": "bg-[var(--panel-acento)]/65",
  "15a60": "bg-[var(--panel-acento)]/35",
};

function Etiqueta({ o }: { o: Oportunidad }) {
  const { texto, clase } =
    o.estado === "espera"
      ? { texto: "Te espera", clase: "bg-warn/15 text-warn" }
      : o.recuperable
        ? { texto: "Recuperable", clase: "bg-[var(--panel-acento-fondo)] text-[color:var(--panel-acento-texto)]" }
        : { texto: "Reciente", clase: "bg-surface-3 text-ink-faint" };
  return (
    <span className={cn("rounded-full px-2 py-px font-mono text-[9.5px] tracking-wide whitespace-nowrap uppercase", clase)}>
      {texto}
    </span>
  );
}

function Fila({ o, primera }: { o: Oportunidad; primera: boolean }) {
  const repiteUltimo = o.ultimoMensaje.trim() === "" || o.ultimoMensaje.trim() === o.pregunta.trim();
  return (
    <li className={cn(!primera && "border-t border-line")}>
      <Link
        href={`/panel/agente/conversaciones?c=${o.conversacionId}`}
        prefetch={false}
        className="-mx-2 flex min-h-[64px] items-start gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-surface-3/60"
      >
        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-surface-3 text-[12px] font-semibold text-ink-soft">
          {iniciales(o.nombre)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-ink">{o.nombre}</span>
          <span className="mt-0.5 line-clamp-2 text-[12px] break-words text-ink-mute">
            <span className="text-ink-faint">Preguntó: </span>
            {o.servicio ? <b className="font-medium text-ink-soft">{o.servicio} · </b> : null}“{o.pregunta}”
          </span>
          {repiteUltimo ? null : (
            <span className="block truncate text-[12px] text-ink-faint">Último mensaje: “{o.ultimoMensaje}”</span>
          )}
        </span>
        <span className="flex flex-none flex-col items-end gap-1 pt-0.5">
          <span className="font-mono text-[10.5px] whitespace-nowrap text-ink-faint">{relativa(o.ultimoEn)}</span>
          <Etiqueta o={o} />
        </span>
      </Link>
    </li>
  );
}

export function OportunidadesLista({ datos }: { datos: Oportunidades | null }) {
  if (datos === null) {
    return (
      <Caja>
        <CajaHead eyebrow="Últimos 60 días" titulo="Oportunidades" />
        <NoDisponible que="las oportunidades" />
      </Caja>
    );
  }

  const primeras = datos.lista.slice(0, VISIBLES);
  const resto = datos.lista.slice(VISIBLES);
  const oculto = datos.total - datos.lista.length;
  const sumaTramos = datos.porEdad.reduce((s, t) => s + t.cantidad, 0);

  return (
    <Caja>
      <CajaHead eyebrow="Últimos 60 días" titulo="Oportunidades" />
      <p className="-mt-2 mb-4 text-[12.5px] text-ink-mute">
        Personas que preguntaron el precio y todavía no tienen cita.
      </p>

      {datos.total === 0 ? (
        <EstadoVacio titulo="No hay nadie esperando">
          En los últimos 60 días, todas las personas que preguntaron el precio ya tienen una cita (o todavía no hubo
          ninguna).
        </EstadoVacio>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2.5">
            <Dato
              etiqueta="Sin cita todavía"
              valor={entero(datos.total)}
              nota="Preguntaron el precio y no agendaron"
              notaSoloEscritorio
            />
            <Dato
              etiqueta="Menos de 24 h"
              valor={entero(datos.recientes)}
              nota="Conversación reciente: con el agente o con vos"
              notaSoloEscritorio
            />
            <Dato
              etiqueta="Para recuperar"
              valor={entero(datos.recuperables)}
              nota="Más de 24 h sin respuesta"
              notaSoloEscritorio
              acento
            />
          </div>

          {sumaTramos > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-[12px] text-ink-faint">Cuánto hace que no hablan</p>
              <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
                {datos.porEdad
                  .filter((t) => t.cantidad > 0)
                  .map((t) => (
                    <div
                      key={t.clave}
                      className={cn("h-full", COLOR_TRAMO[t.clave])}
                      style={{ flexGrow: t.cantidad, flexBasis: 0, minWidth: 6 }}
                    />
                  ))}
              </div>
              <ul className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:flex sm:flex-wrap">
                {datos.porEdad.map((t) => (
                  <li key={t.clave} className="flex items-center gap-2 text-[11.5px] text-ink-mute">
                    <span className={cn("h-2.5 w-2.5 flex-none rounded-[3px]", COLOR_TRAMO[t.clave])} aria-hidden="true" />
                    <span className="min-w-0">
                      {t.etiqueta} <b className="font-medium text-ink tabular-nums">{entero(t.cantidad)}</b>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <ul className="mt-4 flex flex-col border-t border-line pt-1">
            {primeras.map((o, i) => (
              <Fila key={o.contactoId} o={o} primera={i === 0} />
            ))}
          </ul>

          {resto.length > 0 ? (
            <details className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center gap-1.5 rounded-xl border border-line text-[12.5px] font-medium text-ink-mute transition-colors hover:border-line-strong hover:text-ink [&::-webkit-details-marker]:hidden group-open:mb-1">
                <span className="group-open:hidden">Ver {entero(resto.length)} más</span>
                <span className="hidden group-open:inline">Ver menos</span>
                <IconoChevron className="h-4 w-4 transition-transform duration-150 group-open:rotate-180" />
              </summary>
              <ul className="flex flex-col">
                {resto.map((o) => (
                  <Fila key={o.contactoId} o={o} primera={false} />
                ))}
              </ul>
            </details>
          ) : null}

          {oculto > 0 ? (
            <p className="mt-3 text-[11.5px] text-ink-faint">
              Se muestran las {entero(datos.lista.length)} más recientes de {entero(datos.total)}.
            </p>
          ) : null}
          {datos.incompleto ? (
            <p className="mt-3 text-[11.5px] text-warn">
              Hay muchísimos mensajes: la lista puede quedar sin las personas más antiguas.
            </p>
          ) : null}
        </>
      )}

      <Calculo>
        <p>
          <b className="font-medium text-ink-mute">Oportunidad:</b> una persona que escribió algo con palabras de precio
          (precio, cuesta, cuánto, vale, colones, tarifa…) en los últimos 60 días y no tiene ninguna cita agendada en
          ese tiempo ni por venir. Es la misma definición de «Oportunidades» del Inicio, solo que mirando 60 días y no
          solamente hoy.
        </p>
        <p>
          Una cita cancelada no cuenta como cita: quien canceló sigue siendo una oportunidad. Una nota de voz cuenta por
          lo que dice.
        </p>
        <p>
          <b className="font-medium text-ink-mute">Hace cuánto:</b> tiempo desde la última actividad de la conversación
          (el último mensaje, de quien sea). Con menos de 24 horas la conversación sigue reciente (con el agente o con vos) y no aparece en Recuperación hasta que pase ese tiempo.
        </p>
      </Calculo>
    </Caja>
  );
}
