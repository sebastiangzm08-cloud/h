/* ==========================================================================
   1. Dónde se pierden clientes — el embudo.

   Componente de servidor. Las cifras vienen de `calcularEmbudo` (datos crudos:
   mensajes y citas, nunca `wa_contactos.estado`). Cada "se cae" es una frase
   con su cuenta, calculada sobre conjuntos anidados, para que nunca dé un
   número negativo ni contradiga a la barra de al lado.
   ========================================================================== */
import Link from "next/link";
import { Caja, CajaHead } from "@/components/panel/ui";
import {
  MUESTRA_MINIMA,
  indiceMayorCaida,
  pasosDelEmbudo,
  type Embudo,
  type PasoEmbudo,
} from "@/lib/panel/resultados-calculo";
import { cn } from "@/lib/utils";
import { Calculo, Dato, EstadoVacio, IconoAlerta, IconoFlechaAbajo, NoDisponible, SelectorRango, entero } from "./comunes";

const ETAPAS = [
  {
    clave: "escribio",
    etiqueta: "Escribieron",
    ayuda: "Personas distintas que mandaron al menos un mensaje.",
    barra: "bg-gradient-to-r from-[var(--panel-acento)]/60 to-[var(--panel-acento)]",
  },
  {
    clave: "preguntoPrecio",
    etiqueta: "Preguntaron el precio",
    ayuda: "Escribieron algo como «¿cuánto cuesta?».",
    barra: "bg-gradient-to-r from-[var(--panel-acento)]/60 to-[var(--panel-acento)]",
  },
  {
    clave: "agendo",
    etiqueta: "Agendaron",
    ayuda: "Tienen una cita creada en este período.",
    barra: "bg-gradient-to-r from-[var(--panel-acento)]/60 to-[var(--panel-acento)]",
  },
  {
    clave: "asistio",
    etiqueta: "Asistieron",
    ayuda: "Citas que marcaste como «Cumplida» en Agenda. Las que ya pasaron y no marcaste no figuran acá.",
    barra: "bg-ok",
  },
] as const;

/** Qué significa "se cae" en cada paso, con singular y plural. */
const DETALLE = [
  { uno: "persona no preguntó el precio", varios: "personas no preguntaron el precio" },
  { uno: "persona preguntó el precio y no agendó", varios: "personas preguntaron el precio y no agendaron" },
  { uno: "persona agendó y canceló", varios: "personas agendaron y cancelaron" },
] as const;

const PISTA = [
  "Puede ser gente que solo quería saber el horario o la dirección.",
  "En Oportunidades y Recuperación, más abajo, ves a quiénes.",
  "Revisá esas citas en Agenda.",
] as const;

const FECHA = new Intl.DateTimeFormat("es-CR", { day: "numeric", month: "short", timeZone: "America/Costa_Rica" });

function Caida({ paso, indice, destacada, embudo }: { paso: PasoEmbudo; indice: number; destacada: boolean; embudo: Embudo }) {
  const detalle = DETALLE[indice];
  let contenido: React.ReactNode;

  if (paso.base === 0) {
    contenido = (
      <span className="text-ink-mute">
        {indice === 2 && embudo.citaSinMarcar > 0
          ? `${entero(embudo.citaSinMarcar)} ${embudo.citaSinMarcar === 1 ? "cita con la fecha pasada no figura" : "citas con la fecha pasada no figuran"} como «Cumplida»: no se puede saber si asistieron.`
          : "Todavía no hay personas para comparar en este paso."}
      </span>
    );
  } else if (paso.perdidas === 0) {
    contenido = <b className="font-medium text-ok">No se cae nadie en este paso</b>;
  } else {
    contenido = (
      <>
        <b className={cn("font-medium", destacada ? "text-warn" : "text-ink-soft")}>Se cae {paso.porcentaje}%</b>
        <span className="text-ink-mute">
          {" "}
          · {entero(paso.perdidas)} {paso.perdidas === 1 ? detalle.uno : detalle.varios}
        </span>
      </>
    );
  }

  return (
    <div className="flex items-start gap-2.5 py-2.5 pl-0.5">
      <span
        className={cn(
          "mt-px grid h-5 w-5 flex-none place-items-center rounded-full",
          destacada ? "bg-warn/15 text-warn" : "bg-surface-3 text-ink-faint"
        )}
      >
        <IconoFlechaAbajo className="h-3 w-3" />
      </span>
      <p className="min-w-0 text-[12px] leading-snug">
        {contenido}
        {indice === 2 && paso.base > 0 && (embudo.citaPorVenir > 0 || embudo.citaSinMarcar > 0) ? (
          <span className="text-ink-mute">
            {" "}
            (
            {[
              embudo.citaPorVenir > 0 ? `${entero(embudo.citaPorVenir)} con la cita por venir no cuentan` : "",
              embudo.citaSinMarcar > 0
                ? `${entero(embudo.citaSinMarcar)} con la fecha pasada no figuran como «Cumplida»: no se cuentan ni como asistieron ni como pérdida`
                : "",
            ]
              .filter(Boolean)
              .join("; ")}
            )
          </span>
        ) : null}
        {destacada ? (
          <span className="ml-2 inline-block rounded-full bg-warn/15 px-2 py-px align-middle font-mono text-[9.5px] tracking-wide text-warn uppercase">
            Aquí se pierde más
          </span>
        ) : null}
      </p>
    </div>
  );
}

export function EmbudoClientes({ embudo, rango }: { embudo: Embudo | null; rango: 7 | 30 }) {
  return (
    <Caja>
      <CajaHead eyebrow={`Últimos ${rango} días`} titulo="Dónde se pierden clientes" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <p className="min-w-0 text-[12.5px] text-ink-mute">
          {embudo
            ? `Del ${FECHA.format(new Date(embudo.desdeIso))} al ${FECHA.format(new Date(embudo.hastaIso))}. Los porcentajes son sobre las personas que escribieron.`
            : "Qué pasa con la gente desde que escribe hasta que llega a la cita."}
        </p>
        <SelectorRango rango={rango} />
      </div>

      {embudo === null ? (
        <NoDisponible que="el embudo" />
      ) : embudo.escribio === 0 ? (
        <EstadoVacio titulo="Todavía no hay conversaciones en este período">
          Cuando alguien te escriba por WhatsApp, acá vas a ver cuántos preguntan el precio, cuántos agendan y cuántos
          llegan a la cita.
        </EstadoVacio>
      ) : (
        <Contenido embudo={embudo} />
      )}
    </Caja>
  );
}

function Contenido({ embudo }: { embudo: Embudo }) {
  const pasos = pasosDelEmbudo(embudo);
  const mayor = indiceMayorCaida(pasos);
  const pasoMayor = mayor === null ? null : pasos[mayor];

  return (
    <>
      {pasoMayor && mayor !== null ? (
        <div role="note" className="mb-4 flex items-start gap-3 rounded-xl border border-warn/30 bg-warn/[0.07] px-3.5 py-3">
          <IconoAlerta className="mt-0.5 h-4 w-4 flex-none text-warn" />
          <p className="min-w-0 text-[13px] leading-snug text-ink-soft">
            <b className="font-medium text-ink">
              Aquí se pierde más: entre «{pasoMayor.desde}» y «{pasoMayor.hacia}».
            </b>{" "}
            Se cae el {pasoMayor.porcentaje}% ({entero(pasoMayor.perdidas)} de {entero(pasoMayor.base)} personas).{" "}
            {PISTA[mayor]}
          </p>
        </div>
      ) : null}

      {embudo.escribio < MUESTRA_MINIMA ? (
        <p className="mb-4 rounded-xl bg-surface-3 px-3.5 py-2.5 text-[12px] leading-snug text-ink-mute">
          Son pocas personas ({embudo.escribio}): cada una mueve mucho el porcentaje. Fijate más en las cantidades que
          en los %.
        </p>
      ) : null}

      <ol className="flex flex-col">
        {ETAPAS.map((etapa, i) => {
          const cantidad = embudo[etapa.clave];
          const pct = embudo.escribio > 0 ? Math.round((cantidad / embudo.escribio) * 100) : 0;
          const ancho = cantidad > 0 ? Math.max(2, pct) : 0;
          return (
            <li key={etapa.clave}>
              {i > 0 ? (
                <Caida paso={pasos[i - 1]} indice={i - 1} destacada={mayor === i - 1} embudo={embudo} />
              ) : null}
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 text-[13.5px] font-medium text-ink">{etapa.etiqueta}</span>
                  <span className="flex-none text-right whitespace-nowrap tabular-nums">
                    <b className="text-[22px] leading-none font-semibold tracking-[-0.02em] text-ink">{entero(cantidad)}</b>
                    <span className="ml-1.5 font-mono text-[11.5px] text-ink-faint">{pct}%</span>
                  </span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
                  <div className={cn("h-full rounded-full", etapa.barra)} style={{ width: `${ancho}%` }} />
                </div>
                <p className="mt-1.5 text-[11.5px] leading-snug text-ink-mute">{etapa.ayuda}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {embudo.agendo > 0 || embudo.agendaronSinPreguntar > 0 ? (
        <div className="mt-5 border-t border-line pt-4">
          <p className="mb-2.5 text-[12.5px] font-medium text-ink-mute">Qué pasó con las citas</p>
          <div className="grid grid-cols-2 gap-2.5 sm:max-xl:grid-cols-4">
            <Dato etiqueta="Cita por venir" valor={entero(embudo.citaPorVenir)} nota="Todavía no cuenta como pérdida" />
            <Dato etiqueta="Cancelaron" valor={entero(embudo.citaCancelada)} />
            <Dato
              etiqueta="Pasó la fecha, sin marcar"
              valor={entero(embudo.citaSinMarcar)}
              nota={
                embudo.citaSinMarcar > 0 ? (
                  <Link
                    href="/panel/agente/citas"
                    prefetch={false}
                    className="inline-flex min-h-11 items-center font-medium text-[color:var(--panel-acento-texto)] hover:opacity-80"
                  >
                    Marcalas en Agenda →
                  </Link>
                ) : (
                  "No figuran como «Cumplida»"
                )
              }
            />
            <Dato
              etiqueta="Agendaron sin preguntar el precio en este período"
              valor={entero(embudo.agendaronSinPreguntar)}
              nota="Quizá lo preguntaron antes, o escribieron «quiero una cita»"
            />
          </div>
        </div>
      ) : null}

      {embudo.incompleto ? (
        <p className="mt-3 text-[11.5px] text-warn">
          Hay muchísimos mensajes en este período: las cifras pueden quedar un poco cortas.
        </p>
      ) : null}

      <Calculo>
        <p>
          <b className="font-medium text-ink-mute">Escribieron:</b> personas distintas que mandaron al menos un mensaje
          en el período.
        </p>
        <p>
          <b className="font-medium text-ink-mute">Preguntaron el precio:</b> de esas, las que escribieron palabras como
          precio, cuesta, cuánto, vale, colones o tarifa (el mismo criterio de «Oportunidades» en el Inicio). Una nota
          de voz cuenta por lo que dice.
        </p>
        <p>
          <b className="font-medium text-ink-mute">Agendaron:</b> de las que escribieron, las que tienen una cita creada
          en el período (aunque después la hayan cancelado) o una cita por venir agendada antes.
        </p>
        <p>
          <b className="font-medium text-ink-mute">Asistieron:</b> de las que agendaron, las que tienen una cita marcada
          como «Cumplida» en Agenda. Las citas que ya pasaron y nadie marcó no figuran acá: no se cuentan como asistieron
          ni como pérdida, se muestran aparte.
        </p>
        <p>
          <b className="font-medium text-ink-mute">Se cae:</b> las personas que no pasaron a la siguiente etapa, sobre
          las que estaban en la anterior. En el último paso, lo perdido son las citas canceladas; quien tiene la cita por venir o con la fecha pasada sin marcar queda fuera de la cuenta. Que alguien no
          pase de etapa no siempre es un cliente perdido: quien solo preguntó el horario no necesitaba el precio.
        </p>
        <p>
          Casi todo sale solo de tus mensajes y citas reales, sin etiquetas que mantener. Lo único que depende de vos es
          marcar las citas como «Cumplida»: sin eso no aparecen en «Asistieron» ni en Ventas. Las personas que escribieron
          en las últimas 24 horas todavía pueden avanzar.
        </p>
        <p>
          Si lo comparás con el embudo de 7 días del Resumen del agente, pueden diferir un poco: acá «Agendaron» cuenta
          solo a quienes escribieron en el período (el Resumen cuenta también citas agendadas a mano para gente que no
          escribió), y acá se avisa cuando una lectura se corta por el límite de filas.
        </p>
      </Calculo>
    </>
  );
}
