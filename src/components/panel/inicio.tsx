/* ==========================================================================
   Piezas del Inicio del cliente (Fase 1 del rediseño, 2026-09-23).

   Componentes de servidor, sin estado: todo sale entero en el primer render,
   sin esperar JavaScript. Ninguna librería de gráficas — son dos series y
   una escala, igual que `grafica.tsx`.

   REGLA: nada de números de relleno. Cada cifra sale de una consulta real
   (`lib/panel/agente.ts`); si no hay datos, la pieza lo dice en vez de
   inventar una curva bonita.
   ========================================================================== */
import Link from "next/link";
import type { ReactNode } from "react";
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import type {
  ActividadWhatsapp,
  CitaAgente,
  ConversacionAgente,
  MovimientoAgente,
} from "@/lib/panel/agente";
import { fechaCorta, relativa } from "@/lib/panel/agente-formato";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
   Cifras de arriba
   ------------------------------------------------------------------------- */

type Delta = { texto: string; /** Va aparte para poder esconderlo en celular. */ sufijo?: string; tono: "sube" | "baja" | "igual" };

/** Compara con la semana anterior. Sin base (0) no hay porcentaje honesto. */
export function comparar(actual: number, anterior: number): Delta {
  if (anterior === 0 && actual === 0) return { texto: "Sin movimiento", tono: "igual" };
  if (anterior === 0) return { texto: "Nuevo esta semana", tono: "sube" };
  const pct = Math.round(((actual - anterior) / anterior) * 100);
  if (pct === 0) return { texto: "Igual que antes", tono: "igual" };
  return {
    texto: `${pct > 0 ? "↑" : "↓"} ${Math.abs(pct)}%`,
    sufijo: " vs. semana anterior",
    tono: pct > 0 ? "sube" : "baja",
  };
}

const TONO_DELTA: Record<Delta["tono"], string> = {
  sube: "text-ok",
  baja: "text-bad",
  igual: "text-ink-faint",
};

export function TarjetaKpi({
  icono,
  etiqueta,
  valor,
  pie,
  href,
  alerta = false,
  className,
}: {
  icono: NombreIcono;
  etiqueta: string;
  valor: number;
  pie: { texto: string; sufijo?: string; clase?: string };
  href: string;
  /** Ámbar: esto le toca a una persona. */
  alerta?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        "group flex min-w-0 flex-col gap-2.5 rounded-2xl border bg-surface-2 p-3.5 transition-colors duration-150 sm:gap-3 sm:p-4",
        "hover:border-line-strong hover:bg-surface-3/60 active:scale-[0.99]",
        alerta ? "border-warn/40" : "border-line",
        className
      )}
    >
      <span className="flex items-center gap-2.5">
        <span
          className={cn(
            "grid h-8 w-8 flex-none place-items-center rounded-xl sm:h-9 sm:w-9",
            alerta
              ? "bg-warn/15 text-warn"
              : "bg-[var(--panel-acento-fondo)] text-[color:var(--panel-acento-texto)]"
          )}
        >
          <Icono nombre={icono} className="h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0 text-[12.5px] leading-tight text-ink-mute">{etiqueta}</span>
      </span>
      <span className="text-[26px] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums sm:text-[28px]">
        {valor.toLocaleString("es-CR")}
      </span>
      <span className={cn("text-[11.5px] leading-snug", pie.clase ?? "text-ink-faint")}>
        {pie.texto}
        {pie.sufijo ? <span className="hidden sm:inline">{pie.sufijo}</span> : null}
      </span>
    </Link>
  );
}

export function pieDelta(actual: number, anterior: number) {
  const d = comparar(actual, anterior);
  return { texto: d.texto, sufijo: d.sufijo, clase: TONO_DELTA[d.tono] };
}

/* -------------------------------------------------------------------------
   Gráfica de barras — Actividad de WhatsApp
   ------------------------------------------------------------------------- */

const ALTO_GRAFICA = 196;

/** Redondea el tope hacia arriba a algo legible: 41 → 50, 96 → 100. */
function topeLegible(max: number) {
  if (max <= 4) return 4;
  const magnitud = Math.pow(10, Math.floor(Math.log10(max)));
  const paso = magnitud / 2;
  return Math.ceil(max / paso) * paso;
}

const DIA_CORTO = new Intl.DateTimeFormat("es-CR", { weekday: "short", timeZone: "UTC" });

/** "2026-09-23" → { dia: "mié", numero: 23 }. Se lee en UTC a mediodía para
    que la zona horaria del servidor no corra el día. */
function partesDia(fecha: string) {
  const d = new Date(`${fecha}T12:00:00Z`);
  const dia = DIA_CORTO.format(d).replace(".", "");
  return { dia: dia.charAt(0).toUpperCase() + dia.slice(1), numero: d.getUTCDate() };
}

export function GraficaWhatsapp({ datos, rango }: { datos: ActividadWhatsapp; rango: 7 | 14 | 30 }) {
  const { dias, incompleto } = datos;
  const total = dias.reduce((s, d) => s + d.recibidos + d.respuestasAgente, 0);

  if (total === 0) {
    return (
      <div className="grid h-[240px] place-items-center rounded-xl border border-dashed border-line text-center">
        <div className="max-w-[34ch] px-4">
          <p className="text-[13px] text-ink-soft">Todavía no hay mensajes en este período</p>
          <p className="mt-1 text-[12px] text-ink-faint">
            Cuando alguien te escriba por WhatsApp, acá vas a ver cómo se mueve el día a día.
          </p>
        </div>
      </div>
    );
  }

  const tope = topeLegible(Math.max(...dias.flatMap((d) => [d.recibidos, d.respuestasAgente])));
  const guias = [tope, tope / 2, 0];
  const hoy = dias[dias.length - 1]?.fecha;
  /* Con 30 días no caben todas las etiquetas: una cada 5. */
  const cadaCuantas = rango === 30 ? 5 : 1;

  return (
    <figure>
      <div className="flex gap-2">
        {/* Escala */}
        <div
          className="flex flex-none flex-col justify-between pb-[34px] text-right font-mono text-[10px] text-ink-faint tabular-nums"
          style={{ height: ALTO_GRAFICA + 34 }}
          aria-hidden="true"
        >
          {guias.map((g) => (
            <span key={g} className="leading-none">
              {g.toLocaleString("es-CR")}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          {/* Líneas de referencia */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-between"
            style={{ height: ALTO_GRAFICA }}
            aria-hidden="true"
          >
            {guias.map((g, i) => (
              <span
                key={g}
                className={cn("block h-px w-full", i === guias.length - 1 ? "bg-line-strong" : "bg-line")}
              />
            ))}
          </div>

          <div
            className="relative flex items-end gap-[3px] sm:gap-1.5"
            style={{ height: ALTO_GRAFICA + 34 }}
            role="group"
            aria-label={`Mensajes recibidos y respuestas del agente por día, últimos ${rango} días`}
          >
            {dias.map((d, i) => {
              const { dia, numero } = partesDia(d.fecha);
              const esHoy = d.fecha === hoy;
              const alto = (n: number) => `${Math.max(n > 0 ? 3 : 0, (n / tope) * ALTO_GRAFICA)}px`;
              const resumen = `${dia} ${numero}: ${d.recibidos} mensajes recibidos, ${d.respuestasAgente} respuestas del agente`;
              return (
                <div
                  key={d.fecha}
                  tabIndex={0}
                  aria-label={resumen}
                  className="group relative flex h-full min-w-0 flex-1 flex-col justify-end rounded-md outline-none focus-visible:bg-surface-3/60"
                >
                  <div className="flex items-end justify-center gap-[2px]" style={{ height: ALTO_GRAFICA }}>
                    <span
                      className="panel-barra block w-full max-w-[22px] rounded-t-[5px] bg-gradient-to-t from-[var(--panel-acento)]/55 to-[var(--panel-acento)] transition-opacity group-hover:opacity-100 group-focus:opacity-100"
                      style={{ height: alto(d.recibidos), opacity: esHoy ? 1 : 0.85, "--i": i } as React.CSSProperties}
                    />
                    <span
                      className="panel-barra block w-full max-w-[22px] rounded-t-[5px] bg-ink-faint/55 transition-opacity group-hover:bg-ink-mute/70"
                      style={{ height: alto(d.respuestasAgente), "--i": i } as React.CSSProperties}
                    />
                  </div>
                  <span
                    className={cn(
                      "mt-2 block h-[26px] text-center font-mono text-[10px] leading-[13px] whitespace-nowrap",
                      esHoy ? "font-medium text-ink" : "text-ink-faint"
                    )}
                    aria-hidden="true"
                  >
                    {i % cadaCuantas === 0 || esHoy ? (
                      rango === 7 ? (
                        <>
                          <span className="block">{dia}</span>
                          <span className="block">{numero}</span>
                        </>
                      ) : (
                        numero
                      )
                    ) : (
                      ""
                    )}
                  </span>

                  {/* Globo con los dos números, al pasar el mouse o enfocar. */}
                  <span
                    role="presentation"
                    className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-lg border border-line-strong bg-surface px-2.5 py-1.5 text-[11px] whitespace-nowrap text-ink-soft shadow-lg group-hover:block group-focus:block"
                  >
                    <span className="block font-medium text-ink">
                      {dia} {numero}
                    </span>
                    <span className="block text-ink-mute">{d.recibidos.toLocaleString("es-CR")} recibidos</span>
                    <span className="block text-ink-mute">
                      {d.respuestasAgente.toLocaleString("es-CR")} respuestas del agente
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11.5px] text-ink-mute">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--panel-acento)]" aria-hidden="true" />
          Mensajes recibidos
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-ink-faint/60" aria-hidden="true" />
          Respuestas del agente
        </span>
        {incompleto ? (
          <span className="text-warn">Se muestran los últimos 1.000 mensajes; los días más viejos pueden salir incompletos.</span>
        ) : null}
      </figcaption>
    </figure>
  );
}

/** Selector 7 / 14 / 30 días. Son enlaces: la pantalla se arma en el servidor. */
export function SelectorRango({ rango }: { rango: 7 | 14 | 30 }) {
  return (
    <nav
      aria-label="Período de la gráfica"
      className="flex items-center gap-0.5 rounded-[9px] border border-line bg-surface p-0.5"
    >
      {([7, 14, 30] as const).map((r) => (
        <Link
          key={r}
          href={r === 7 ? "/panel" : `/panel?rango=${r}`}
          prefetch={false}
          scroll={false}
          aria-current={r === rango ? "true" : undefined}
          className={cn(
            "rounded-[7px] px-3 py-2.5 font-mono text-[11px] whitespace-nowrap transition-colors sm:px-2.5 sm:py-1",
            r === rango ? "bg-surface-3 text-ink" : "text-ink-faint hover:text-ink-mute"
          )}
        >
          {r} días
        </Link>
      ))}
    </nav>
  );
}

/* -------------------------------------------------------------------------
   Listas
   ------------------------------------------------------------------------- */

export function EncabezadoBloque({
  titulo,
  enlace,
  children,
}: {
  titulo: string;
  enlace?: { href: string; texto: string };
  children?: ReactNode;
}) {
  return (
    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5">
      <h2 className="text-[14.5px] font-semibold tracking-tight text-ink">{titulo}</h2>
      <div className="flex items-center gap-3">
        {children}
        {enlace ? (
          <Link
            href={enlace.href}
            prefetch={false}
            className="-my-2.5 inline-flex items-center gap-1 py-2.5 pl-2 text-xs font-medium whitespace-nowrap text-[color:var(--panel-acento-texto)] transition-opacity hover:opacity-80"
          >
            {enlace.texto}
            <Icono nombre="flecha" className="h-3 w-3" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

const ESTADO_CONVERSACION: Record<ConversacionAgente["estado"], { texto: string; clase: string }> = {
  agente: { texto: "IA", clase: "bg-[var(--panel-acento-fondo)] text-[color:var(--panel-acento-texto)]" },
  humano: { texto: "Humano", clase: "bg-ok/15 text-ok" },
  espera: { texto: "Espera", clase: "bg-warn/15 text-warn" },
  cerrada: { texto: "Cerrada", clase: "bg-surface-3 text-ink-faint" },
};

function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  const texto = (partes[0]?.[0] ?? "?") + (partes[1]?.[0] ?? "");
  return texto.toUpperCase();
}

export function ConversacionesRecientes({ items }: { items: ConversacionAgente[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[12.5px] text-ink-faint">
        Cuando alguien te escriba por WhatsApp, la conversación aparece acá.
      </p>
    );
  }
  return (
    <ul className="flex flex-col">
      {items.map((c, i) => {
        const estado = ESTADO_CONVERSACION[c.estado];
        return (
          <li key={c.id} className={cn(i > 0 && "border-t border-line")}>
            <Link
              href={`/panel/agente/conversaciones?c=${c.id}`}
              prefetch={false}
              className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface-3/60"
            >
              <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-surface-3 text-[12px] font-semibold text-ink-soft">
                {iniciales(c.nombre)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-ink">{c.nombre}</span>
                <span className="block truncate text-[12px] text-ink-mute">{c.ultimoMensaje || "—"}</span>
              </span>
              <span className="flex flex-none flex-col items-end gap-1">
                <span className="font-mono text-[10.5px] text-ink-faint">{relativa(c.ultimoEn)}</span>
                <span className={cn("rounded-full px-2 py-px font-mono text-[9.5px] tracking-wide uppercase", estado.clase)}>
                  {estado.texto}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

const ICONO_MOVIMIENTO: Record<MovimientoAgente["tipo"], NombreIcono> = {
  cita: "calendario",
  contacto: "clientes",
  espera: "mensajes",
};

export function Movimientos({ items }: { items: MovimientoAgente[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[12.5px] text-ink-faint">
        Todavía no hay movimientos. Las citas, los contactos nuevos y lo que necesita a una persona aparecen acá.
      </p>
    );
  }
  return (
    <ul className="flex flex-col">
      {items.map((m, i) => (
        <li key={m.id} className={cn("flex items-start gap-3 py-3", i > 0 && "border-t border-line")}>
          <span
            className={cn(
              "mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-lg",
              m.tipo === "espera"
                ? "bg-warn/15 text-warn"
                : "bg-[var(--panel-acento-fondo)] text-[color:var(--panel-acento-texto)]"
            )}
          >
            <Icono nombre={ICONO_MOVIMIENTO[m.tipo]} className="h-[15px] w-[15px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-ink">{m.titulo}</span>
            <span className="block truncate text-[12px] text-ink-mute">{m.detalle}</span>
          </span>
          <time className="flex-none pt-0.5 font-mono text-[10.5px] whitespace-nowrap text-ink-faint" dateTime={m.cuandoIso}>
            {relativa(m.cuandoIso)}
          </time>
        </li>
      ))}
    </ul>
  );
}

export function ProximasCitas({ citas }: { citas: CitaAgente[] }) {
  if (citas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[12.5px] text-ink-faint">
        No hay citas próximas.
      </p>
    );
  }
  return (
    <ul className="flex flex-col">
      {citas.map((c, i) => (
        <li key={c.id} className={cn("flex items-center gap-3 py-2.5", i > 0 && "border-t border-line")}>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-ink">{c.nombre}</span>
            <span className="block truncate text-[12px] text-ink-mute">{c.servicio || "Cita"}</span>
          </span>
          <span className="flex-none font-mono text-[11px] whitespace-nowrap text-ink-soft">{fechaCorta(c.cuando)}</span>
        </li>
      ))}
    </ul>
  );
}
