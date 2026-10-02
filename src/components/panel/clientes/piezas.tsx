/* ==========================================================================
   Piezas compartidas de Clientes, Agenda y Correo (Fase 4a del rediseño,
   2026-09-30). Mismo lenguaje que el Inicio: tarjetas `rounded-2xl`, acento
   violeta solo en lo activo, verde/ámbar/rojo como INFORMACIÓN.

   Sin estado ni hooks: sirve tanto en componentes de servidor como de
   cliente. REGLA del celular que se respeta acá: objetivos táctiles de 44 px
   (`min-h-11`) que en escritorio bajan a 32, inputs a 16 px, y nada de
   anchos fijos que hagan desbordar a 360 px.
   ========================================================================== */
import Link from "next/link";
import type { ReactNode } from "react";
import type { EstadoContacto } from "@/lib/panel/agente";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
   Estructura de la pantalla
   ------------------------------------------------------------------------- */

/** Mismo contenedor que usa el resto del panel en `<main>`: márgenes, ancho
    máximo y el espacio de abajo que respeta la barra del iPhone. */
export function PaginaPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex w-full max-w-[1180px] flex-none flex-col gap-[22px] px-4 pt-5 pb-[max(2.75rem,env(safe-area-inset-bottom))] sm:px-[26px] sm:pt-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function EncabezadoPantalla({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3.5">
      <div className="min-w-0">
        <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.03em] text-balance text-ink sm:text-[30px]">
          {titulo}
        </h1>
        {descripcion ? (
          <p className="mt-1 max-w-[62ch] text-[14px] leading-snug text-ink-mute">{descripcion}</p>
        ) : null}
      </div>
      {children}
    </header>
  );
}

/** Aviso de datos de ejemplo: mientras el SQL del agente no esté corrido las
    pantallas muestran una clínica ficticia, y hay que decirlo. */
export function AvisoDatosEjemplo({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      role="note"
      className="rounded-xl border border-dashed border-line-strong bg-surface px-4 py-3 text-[12.5px] leading-snug text-ink-faint"
    >
      Datos de ejemplo. Se vuelven reales en cuanto se corra{" "}
      <code className="font-mono text-ink-mute">supabase/agente-whatsapp.sql</code> y el agente empiece a recibir
      mensajes.
    </div>
  );
}

/** Estado vacío honesto: dice qué falta y qué hacer, no solo "no hay nada". */
export function EstadoVacio({
  titulo,
  children,
  accion,
}: {
  titulo: string;
  children?: ReactNode;
  accion?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-5 py-10 text-center">
      <p className="text-[14px] font-medium text-ink-soft">{titulo}</p>
      {children ? (
        <p className="mx-auto mt-1.5 max-w-[46ch] text-[12.5px] leading-relaxed text-ink-faint">{children}</p>
      ) : null}
      {accion ? <div className="mt-4 flex justify-center">{accion}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------
   Cifras de arriba
   ------------------------------------------------------------------------- */

export type Cifra = {
  valor: string;
  etiqueta: string;
  href?: string;
  /** Ámbar: esto le toca a una persona. */
  alerta?: boolean;
};

/** Franja de cifras en una sola caja, con filas finas entre celdas — la misma
    forma que "Cómo va" en la vista del agente. Pasá las columnas en
    `className` (ej. `grid-cols-2 sm:grid-cols-4`). */
export function ResumenCifras({
  cifras,
  className,
  etiqueta,
}: {
  cifras: Cifra[];
  className?: string;
  etiqueta: string;
}) {
  return (
    <ul
      aria-label={etiqueta}
      className={cn("grid gap-px overflow-hidden rounded-2xl border border-line bg-line", className)}
    >
      {cifras.map((c) => {
        const interior = (
          <>
            <span
              className={cn(
                "block font-mono text-[22px] leading-none font-semibold tabular-nums",
                c.alerta ? "text-warn" : "text-ink"
              )}
            >
              {c.valor}
            </span>
            <span className="mt-1.5 block text-[12px] leading-snug text-ink-mute">{c.etiqueta}</span>
          </>
        );
        return (
          <li key={c.etiqueta} className="min-w-0 bg-surface-2">
            {c.href ? (
              <Link
                href={c.href}
                prefetch={false}
                className="block h-full px-4 py-3.5 transition-colors hover:bg-surface-3/60"
              >
                {interior}
              </Link>
            ) : (
              <div className="h-full px-4 py-3.5">{interior}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* -------------------------------------------------------------------------
   Personas y estados
   ------------------------------------------------------------------------- */

/** "María Jiménez" → "MJ". Un teléfono sin letras queda en un punto medio. */
export function iniciales(nombre: string) {
  const palabras = nombre
    .trim()
    .split(/\s+/)
    .filter((p) => /^\p{L}/u.test(p));
  const texto = (palabras[0]?.[0] ?? "") + (palabras[1]?.[0] ?? "");
  return texto.toUpperCase() || "·";
}

export function Avatar({ nombre, className }: { nombre: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid h-10 w-10 flex-none place-items-center rounded-full bg-surface-3 text-[12.5px] font-semibold text-ink-soft",
        className
      )}
    >
      {iniciales(nombre)}
    </span>
  );
}

export type TonoPildora = "acento" | "ok" | "warn" | "bad" | "neutro";

const TONOS_PILDORA: Record<TonoPildora, string> = {
  acento: "bg-[var(--panel-acento-fondo)] text-[color:var(--panel-acento-texto)]",
  ok: "bg-ok/15 text-ok",
  warn: "bg-warn/15 text-warn",
  bad: "bg-bad/15 text-bad",
  neutro: "bg-surface-3 text-ink-mute",
};

/** Pastilla de estado. El color dice algo: violeta = en marcha, verde =
    listo, ámbar = te toca a vos, rojo = no pasó, gris = sin novedad. */
export function Pildora({
  tono = "neutro",
  children,
  className,
}: {
  tono?: TonoPildora;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10.5px] leading-none tracking-[0.04em] whitespace-nowrap uppercase",
        TONOS_PILDORA[tono],
        className
      )}
    >
      <span className="h-[5px] w-[5px] flex-none rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export const ESTADOS_CLIENTE: Record<EstadoContacto, { texto: string; tono: TonoPildora }> = {
  nuevo: { texto: "Contacto nuevo", tono: "neutro" },
  pregunto_precio: { texto: "Preguntó precio", tono: "warn" },
  agendado: { texto: "Cita agendada", tono: "acento" },
  cliente: { texto: "Cliente", tono: "ok" },
  perdido: { texto: "No volvió", tono: "bad" },
};

export function PildoraCliente({ estado }: { estado: string }) {
  const e = ESTADOS_CLIENTE[estado as EstadoContacto] ?? ESTADOS_CLIENTE.nuevo;
  return <Pildora tono={e.tono}>{e.texto}</Pildora>;
}

/** Etiqueta libre del contacto. */
export function Etiqueta({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-surface-3 px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.04em] text-ink-faint uppercase">
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------
   Botones. Se arman con tres piezas: base + tono + tamaño.
   ------------------------------------------------------------------------- */

export const BOTON_BASE =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

export const BOTON = {
  primario: "bg-ink text-paper hover:bg-ink-soft",
  secundario: "border border-line-strong text-ink-soft hover:border-ink-faint hover:bg-surface-3",
  peligro: "border border-bad/35 text-bad hover:bg-bad/10",
  exito: "border border-ok/40 bg-ok/10 text-ok hover:bg-ok/15",
} as const;

/** Botón dentro de una tarjeta o fila: 44 px en celular, compacto en la tabla. */
export const TAM_FILA =
  "min-h-11 rounded-xl px-3.5 text-[13.5px] xl:min-h-8 xl:rounded-lg xl:px-3 xl:text-[12px]";

/** Igual que `TAM_FILA` pero con menos relleno a los lados: para tres botones
    en una sola línea de celular (a 360 px a cada uno le tocan ~92 px). */
export const TAM_FILA_TRES =
  "min-h-11 rounded-xl px-2 text-[13px] xl:min-h-8 xl:rounded-lg xl:px-3 xl:text-[12px]";

/** Botón de formulario: siempre cómodo de tocar. */
export const TAM_FORM = "min-h-11 rounded-xl px-4 text-[14px]";
