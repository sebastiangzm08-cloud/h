/* ==========================================================================
   Piezas compartidas de las pantallas de Administración (rediseño, 2026-09-30).

   Mismo lenguaje que el panel del cliente (`components/panel/ui`, tokens
   `--panel-acento*`), pero con lo que solo el admin necesita: cifras
   resumidas arriba, encabezado con acciones, estados vacíos, mensajes de
   resultado de las acciones y las clases de campos y botones.

   Sin estado ni APIs del servidor: lo pueden importar tanto las páginas
   (servidor) como los formularios ("use client"). Nada de datos acá: todo
   lo que se muestra llega por props desde `lib/panel/admin.ts`.

   CELULAR: botones y campos miden 44 px de alto en pantallas chicas y los
   campos usan 16 px (con menos, iOS hace zoom al enfocarlos).
   ========================================================================== */
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import { hora } from "@/lib/panel/agente-formato";
import type { ResultadoAccion } from "@/lib/panel/admin-acciones";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
   Campos y botones (clases)
   ------------------------------------------------------------------------- */

const FOCO_CAMPO =
  "focus:border-[var(--panel-acento)] focus:bg-surface-3 focus:ring-[3px] focus:ring-[var(--panel-acento-fondo)] focus:outline-none";

/** Campo de una línea. 44 px y 16 px en celular; más fino en escritorio. */
export const CAMPO =
  "h-11 w-full min-w-0 rounded-xl border border-line bg-surface-2 px-3.5 text-base text-ink placeholder:text-ink-faint " +
  "transition-[border-color,background-color,box-shadow] disabled:opacity-60 sm:text-[14px] " +
  FOCO_CAMPO;

/** Campo de varias líneas. */
export const CAMPO_AREA =
  "min-h-[104px] w-full min-w-0 resize-y rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-base leading-relaxed text-ink " +
  "placeholder:text-ink-faint transition-[border-color,background-color,box-shadow] disabled:opacity-60 sm:text-[14px] " +
  FOCO_CAMPO;

/** Etiqueta de un campo. */
export const ETIQUETA = "text-[12px] font-medium text-ink-mute";

const BASE_BOTON =
  "inline-flex flex-none items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap " +
  "transition-[opacity,background-color,border-color,color,transform] duration-150 active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-50";

/** La acción principal de una pantalla o de un formulario. */
export const BTN_PRIMARIO =
  BASE_BOTON +
  " h-11 px-5 text-[13.5px] bg-[var(--panel-acento,#7c5cff)] text-white hover:opacity-90";

/** Acción de apoyo, con borde. */
export const BTN_SECUNDARIO =
  BASE_BOTON +
  " h-11 px-5 text-[13px] border border-line-strong text-ink-soft hover:bg-surface-3 hover:text-ink";

/** Versión para dentro de filas y tarjetas: 44 px en celular, 36 en escritorio. */
export const BTN_CHICO_PRIMARIO =
  BASE_BOTON +
  " h-11 px-4 text-[12.5px] bg-[var(--panel-acento,#7c5cff)] text-white hover:opacity-90 sm:h-9";
export const BTN_CHICO_SECUNDARIO =
  BASE_BOTON +
  " h-11 px-4 text-[12.5px] border border-line-strong text-ink-soft hover:bg-surface-3 hover:text-ink sm:h-9";

/** Para lo destructivo o que corta algo (suspender, eliminar). */
export const BTN_PELIGRO =
  BASE_BOTON +
  " h-11 px-5 text-[13px] border border-bad/40 text-bad hover:bg-bad/10";
export const BTN_PELIGRO_SOLIDO =
  BASE_BOTON + " h-11 px-5 text-[13px] bg-bad text-paper hover:opacity-90";

/** Texto que se toca, sin caja (Cancelar, Cerrar). Zona de toque de 44 px. */
export const BTN_TEXTO =
  "inline-flex min-h-11 flex-none items-center rounded-lg px-2.5 text-[12.5px] text-ink-faint transition-colors hover:text-ink-soft";

/** Chip de filtro. El activo lleva el acento del panel. */
export function claseChip(activo: boolean) {
  return cn(
    "inline-flex h-11 flex-none items-center gap-2 rounded-full border px-4 text-[12.5px] whitespace-nowrap transition-colors sm:h-9 sm:px-3.5",
    activo
      ? "border-[var(--panel-acento-borde)] bg-[var(--panel-acento-fondo)] text-[color:var(--panel-acento-texto)]"
      : "border-line text-ink-mute hover:border-line-strong hover:text-ink-soft"
  );
}

/** Selector con flecha visible (el nativo sin `appearance` no dice que se abre). */
export function Selector({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative min-w-0">
      <select {...props} className={cn(CAMPO, "cursor-pointer appearance-none pr-10", className)}>
        {children}
      </select>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-ink-faint"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Encabezados
   ------------------------------------------------------------------------- */

/** Título de pantalla con las acciones a la derecha (se apilan en celular). */
export function AdminHead({
  titulo,
  sub,
  descripcion,
  children,
}: {
  titulo: string;
  sub?: string;
  descripcion?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="min-w-0 flex-1 basis-[260px]">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.02em] break-words text-ink">
            {titulo}
          </h1>
          {sub ? (
            <span className="font-mono text-[11px] tracking-wide text-ink-faint">{sub}</span>
          ) : null}
        </div>
        {descripcion ? (
          <p className="mt-1 max-w-[66ch] text-[13px] leading-snug text-ink-faint">{descripcion}</p>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </header>
  );
}

/** "← Clientes". Zona de toque de 44 px sin empujar el diseño. */
export function VolverA({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="-my-2 inline-flex min-h-11 w-fit items-center gap-1.5 py-2 pr-3 text-[12.5px] text-ink-mute transition-colors hover:text-ink"
    >
      <Icono nombre="flecha" className="h-3 w-3 rotate-180" />
      {children}
    </Link>
  );
}

/** Título de bloque con acción opcional a la derecha. */
export function Seccion({
  titulo,
  sub,
  accion,
  children,
  className,
}: {
  titulo: ReactNode;
  sub?: ReactNode;
  accion?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h2 className="text-[14.5px] font-semibold tracking-tight text-ink">
          {titulo}
          {sub ? (
            <span className="ml-2.5 font-mono text-[11px] font-normal tracking-wide text-ink-faint">
              {sub}
            </span>
          ) : null}
        </h2>
        {accion}
      </div>
      {children}
    </section>
  );
}

/* -------------------------------------------------------------------------
   Cifras resumidas
   ------------------------------------------------------------------------- */

type TonoCifra = "normal" | "warn" | "bad" | "ok";

const BURBUJA: Record<TonoCifra, string> = {
  normal: "bg-[var(--panel-acento-fondo)] text-[color:var(--panel-acento-texto)]",
  warn: "bg-warn/15 text-warn",
  bad: "bg-bad/15 text-bad",
  ok: "bg-ok/15 text-ok",
};

const BORDE: Record<TonoCifra, string> = {
  normal: "border-line",
  warn: "border-warn/40",
  bad: "border-bad/40",
  ok: "border-line",
};

const PIE: Record<TonoCifra, string> = {
  normal: "text-ink-faint",
  warn: "text-warn",
  bad: "text-bad",
  ok: "text-ok",
};

/**
 * Una cifra con su ícono, etiqueta y pie. `tono` pinta el ícono, el borde
 * y el pie: solo se usa cuando a una persona le toca hacer algo.
 */
export function TarjetaCifra({
  icono,
  etiqueta,
  valor,
  pie,
  href,
  tono = "normal",
  className,
}: {
  icono: NombreIcono;
  etiqueta: string;
  valor: string | number;
  pie?: ReactNode;
  /** Con destino, toda la tarjeta es un enlace. */
  href?: string;
  tono?: TonoCifra;
  className?: string;
}) {
  const clases = cn(
    "flex min-w-0 flex-col gap-2.5 rounded-2xl border bg-surface-2 p-3.5 sm:gap-3 sm:p-4",
    BORDE[tono],
    href &&
      "group transition-[border-color,background-color,transform] duration-150 hover:border-line-strong hover:bg-surface-3/60 active:scale-[0.99]",
    className
  );
  const cuerpo = (
    <>
      <span className="flex items-center gap-2.5">
        <span
          className={cn(
            "grid h-8 w-8 flex-none place-items-center rounded-xl sm:h-9 sm:w-9",
            BURBUJA[tono]
          )}
        >
          <Icono nombre={icono} className="h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0 text-[12.5px] leading-tight text-ink-mute">{etiqueta}</span>
      </span>
      <span
        data-valor
        className="text-[22px] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums [overflow-wrap:anywhere] sm:text-[26px]"
      >
        {valor}
      </span>
      {pie ? <span className={cn("text-[11.5px] leading-snug", PIE[tono])}>{pie}</span> : null}
    </>
  );
  return href ? (
    <Link href={href} prefetch={false} className={clases}>
      {cuerpo}
    </Link>
  ) : (
    <div className={clases}>{cuerpo}</div>
  );
}

/** Rejilla de cifras. Si queda una suelta en celular, ocupa el ancho entero. */
export function Cifras({
  children,
  columnas = 4,
  etiqueta = "Resumen",
}: {
  children: ReactNode;
  columnas?: 3 | 4 | 6;
  etiqueta?: string;
}) {
  const cols = {
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    /* Seis en fila (xl): cada tarjeta mide ~150 px, así que la cifra baja a 20 px
       para que un monto como ₡350 000 no se parta en dos renglones. */
    6: "lg:grid-cols-3 xl:grid-cols-6 xl:[&_[data-valor]]:text-[20px]",
  } as const;
  return (
    <section
      aria-label={etiqueta}
      className={cn(
        "grid grid-cols-2 gap-3",
        cols[columnas],
        "[&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1"
      )}
    >
      {children}
    </section>
  );
}

/* -------------------------------------------------------------------------
   Estados: vacío, avisos y resultado de una acción
   ------------------------------------------------------------------------- */

/** Estado vacío que dice qué falta y qué hacer, no solo "no hay nada". */
export function Vacio({
  icono = "catalogo",
  titulo,
  children,
  accion,
  plano = false,
  className,
}: {
  icono?: NombreIcono;
  titulo: string;
  children?: ReactNode;
  accion?: ReactNode;
  /** Sin caja punteada: para cuando ya va dentro de una caja. */
  plano?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3.5 text-center",
        plano ? "py-5" : "rounded-2xl border border-dashed border-line-strong px-5 py-10",
        className
      )}
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-3 text-ink-mute">
        <Icono nombre={icono} className="h-5 w-5" />
      </span>
      <div className="max-w-[46ch]">
        <p className="text-[14px] font-medium text-ink">{titulo}</p>
        {children ? (
          <p className="mt-1 text-[12.5px] leading-snug text-ink-faint">{children}</p>
        ) : null}
      </div>
      {accion}
    </div>
  );
}

type TonoAviso = "neutro" | "ok" | "warn" | "bad";

const AVISO: Record<TonoAviso, { caja: string; titulo: string }> = {
  neutro: { caja: "border-line bg-surface-2", titulo: "text-ink" },
  ok: { caja: "border-ok/30 bg-ok/[0.07]", titulo: "text-ok" },
  warn: { caja: "border-warn/30 bg-warn/[0.07]", titulo: "text-warn" },
  bad: { caja: "border-bad/30 bg-bad/[0.07]", titulo: "text-bad" },
};

/** Aviso en bloque con título opcional. */
export function Aviso({
  tono = "neutro",
  titulo,
  children,
  className,
}: {
  tono?: TonoAviso;
  titulo?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tono === "bad" ? "alert" : undefined}
      className={cn(
        "flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-[13px] leading-snug",
        AVISO[tono].caja,
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
        className={cn("mt-px h-4 w-4 flex-none", AVISO[tono].titulo)}
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16h.01" />
      </svg>
      <div className="min-w-0">
        {titulo ? <p className={cn("font-medium", AVISO[tono].titulo)}>{titulo}</p> : null}
        {children ? <div className={cn("text-ink-mute", titulo && "mt-0.5")}>{children}</div> : null}
      </div>
    </div>
  );
}

/** Resultado de una acción del admin: verde si salió, rojo si no. */
export function MensajeAccion({
  estado,
  className,
}: {
  estado: ResultadoAccion | null;
  className?: string;
}) {
  if (!estado) return null;
  const ok = estado.ok;
  return (
    <p
      role={ok ? "status" : "alert"}
      className={cn(
        "flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-[12.5px] leading-snug",
        ok ? "bg-ok/10 text-ok" : "bg-bad/10 text-bad",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="mt-px h-4 w-4 flex-none"
      >
        {ok ? (
          <path d="m5 12 5 5 9-9" />
        ) : (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </>
        )}
      </svg>
      <span className="min-w-0">{ok ? estado.mensaje : estado.error}</span>
    </p>
  );
}

/* -------------------------------------------------------------------------
   Piezas chicas
   ------------------------------------------------------------------------- */

/** Círculo con las iniciales, como en las conversaciones del cliente. */
export function Avatar({ nombre, className }: { nombre: string; className?: string }) {
  const partes = nombre.trim().split(/\s+/).filter((x) => /^\p{L}/u.test(x));
  const texto = ((partes[0]?.[0] ?? "?") + (partes[1]?.[0] ?? "")).toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid h-10 w-10 flex-none place-items-center rounded-full bg-surface-3 text-[12.5px] font-semibold text-ink-soft",
        className
      )}
    >
      {texto}
    </span>
  );
}

/** Fila "clave ... valor" de una lista de datos. */
export function FilaDato({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-0 last:pb-0 first:pt-0">
      <dt className="flex-none text-[12.5px] text-ink-mute">{k}</dt>
      <dd className="min-w-0 text-right text-[12.5px] text-ink-soft [overflow-wrap:anywhere]">
        {children}
      </dd>
    </div>
  );
}

/** Etiqueta chica sobre un valor, para filas que se vuelven tarjetas. */
export function Dato({
  etiqueta,
  children,
  className,
  soloCelular = false,
}: {
  etiqueta: string;
  children: ReactNode;
  className?: string;
  /** La etiqueta solo se ve donde la fila es tarjeta (la tabla ya tiene encabezado). */
  soloCelular?: boolean;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <span
        className={cn(
          "block font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase",
          soloCelular && "xl:hidden"
        )}
      >
        {etiqueta}
      </span>
      <div className="mt-0.5 text-[12.5px] text-ink-soft">{children}</div>
    </div>
  );
}

/** Nombre de un servicio conectado tal como se escribe: "WhatsApp", no "Whatsapp". */
export function nombreServicio(servicio: string) {
  const conocidos: Record<string, string> = {
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    facebook: "Facebook",
    buffer: "Buffer",
    correo: "Correo",
  };
  return conocidos[servicio.toLowerCase()] ?? servicio.charAt(0).toUpperCase() + servicio.slice(1);
}

/** Cómo se ve cada estado de un cliente. Una sola definición para todo el admin. */
export const ESTADO_CLIENTE: Record<
  "activo" | "prueba" | "pausado" | "moroso",
  { texto: string; tono: "ok" | "warn" | "bad" | "idle" }
> = {
  activo: { texto: "Activo", tono: "ok" },
  prueba: { texto: "En prueba", tono: "warn" },
  pausado: { texto: "Suspendido", tono: "idle" },
  moroso: { texto: "Moroso", tono: "bad" },
};

/* -------------------------------------------------------------------------
   Fechas — siempre en hora de Costa Rica, no la del servidor
   ------------------------------------------------------------------------- */

const ZONA_CR = "America/Costa_Rica";
const DIA_MES = new Intl.DateTimeFormat("es-CR", { day: "numeric", month: "short", timeZone: ZONA_CR });
const DIA_CLAVE = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_CR });

/** "hoy · 2:15 p.m." o "28 set · 9:40 a.m.". */
export function fechaHora(iso: string) {
  const d = new Date(iso);
  const hoy = DIA_CLAVE.format(d) === DIA_CLAVE.format(new Date());
  return hoy ? `hoy · ${hora(iso)}` : `${DIA_MES.format(d).replace(".", "")} · ${hora(iso)}`;
}
