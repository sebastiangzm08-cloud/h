/* ==========================================================================
   Piezas de página de Conocimiento y Configuración (Fase 4b del rediseño).

   Mismo lenguaje que el Inicio y Automatizaciones: cajas redondeadas sobre
   `surface-2`, etiqueta en mayúscula + título + descripción corta, y el
   violeta solo en lo principal. Todo acá es de servidor y sin estado: lo que
   necesita clics vive en `controles.tsx` o en cada formulario.
   ========================================================================== */
import "./configuracion.css";
import type { ReactNode } from "react";
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import { Eyebrow } from "@/components/panel/ui";
import { cn } from "@/lib/utils";

/**
 * Caja con encabezado. `sinRelleno` es para listas que llevan sus propias
 * filas de borde a borde (el hover y las líneas llegan hasta el filo).
 */
export function Seccion({
  id,
  eyebrow,
  titulo,
  descripcion,
  accion,
  children,
  className,
  sinRelleno = false,
}: {
  /** Ancla (`#id`) para enlaces internos. También nombra la región. */
  id?: string;
  eyebrow?: string;
  titulo: ReactNode;
  descripcion?: ReactNode;
  /** Botón o estado a la derecha del título. */
  accion?: ReactNode;
  children?: ReactNode;
  className?: string;
  sinRelleno?: boolean;
}) {
  const idTitulo = id ? `${id}-titulo` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={idTitulo}
      className={cn("scroll-mt-4 rounded-2xl border border-line bg-surface-2", className)}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 px-4 pt-4 sm:px-[18px] sm:pt-[18px]">
        <div className="min-w-0 flex-1 basis-[200px]">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h2 id={idTitulo} className="mt-0.5 text-[14.5px] font-semibold tracking-tight text-ink">
            {titulo}
          </h2>
          {descripcion ? (
            <p className="mt-1 max-w-[62ch] text-[12.5px] leading-snug text-ink-mute">{descripcion}</p>
          ) : null}
        </div>
        {accion ? <div className="flex flex-none flex-wrap items-center gap-2">{accion}</div> : null}
      </header>
      {children !== undefined && children !== null ? (
        <div className={cn("mt-3.5 pb-4 sm:pb-[18px]", !sinRelleno && "px-4 sm:px-[18px]")}>{children}</div>
      ) : (
        <div className="pb-4 sm:pb-[18px]" />
      )}
    </section>
  );
}

/** Lista de pares clave → valor con rayitas entre filas. */
export function Filas({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn("divide-y divide-line", className)}>{children}</dl>;
}

/**
 * Una fila clave → valor. Si caben en una línea, la clave va a la izquierda y
 * el valor a la derecha; si no caben (celular, valor largo), el valor baja
 * debajo de la clave en vez de aplastarse a una palabra por renglón.
 */
export function FilaDato({
  k,
  children,
  mono = false,
}: {
  k: ReactNode;
  children: ReactNode;
  /** Cifras y horas: tipografía monoespaciada y alineada. */
  mono?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-3 first:pt-0 last:pb-0">
      <dt className="text-[13px] text-ink-mute">{k}</dt>
      <dd className={cn("min-w-0 text-[13px] break-words text-ink", mono && "font-mono tabular-nums")}>
        {children}
      </dd>
    </div>
  );
}

/** Estado vacío honesto: dice qué falta y qué hacer, no "no hay nada". */
export function EstadoVacio({
  icono,
  titulo,
  children,
  accion,
  className,
}: {
  icono: NombreIcono;
  titulo: string;
  children?: ReactNode;
  accion?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-line-strong px-4 py-7 text-center sm:py-8",
        className
      )}
    >
      <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-surface-3 text-ink-mute">
        <Icono nombre={icono} className="h-[18px] w-[18px]" />
      </span>
      <p className="mt-3 text-[13px] font-medium text-ink-soft">{titulo}</p>
      {children ? (
        <p className="mx-auto mt-1 max-w-[46ch] text-[12.5px] leading-snug text-ink-mute">{children}</p>
      ) : null}
      {accion ? <div className="mt-4 flex justify-center">{accion}</div> : null}
    </div>
  );
}
