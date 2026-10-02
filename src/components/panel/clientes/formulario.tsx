/* ==========================================================================
   Piezas de los formularios de Clientes, Agenda y Correo.

   Un solo estilo de campo para todos: 44 px de alto en celular, 16 px de
   letra (a menos de 16 px iOS hace zoom al tocar el campo) y un borde
   violeta al enfocar. Sin estado: las usan componentes de cliente.
   ========================================================================== */
import type { FormEvent, ReactNode } from "react";
import type { ResultadoAccion } from "@/lib/panel/agente-acciones";
import { BOTON, BOTON_BASE, TAM_FORM } from "@/components/panel/clientes/piezas";
import { cn } from "@/lib/utils";
import "./formularios.css";

export const CLASE_CAMPO =
  "campo-panel block w-full min-w-0 rounded-xl border border-line-strong bg-surface-2 px-3.5 text-[16px] text-ink " +
  "placeholder:text-ink-faint outline-none transition-[border-color,box-shadow] duration-150 " +
  "focus:border-[var(--panel-acento)] focus:ring-[3px] focus:ring-[var(--panel-acento-fondo)] sm:text-[14px]";

/** Input o select: una línea. */
export const CLASE_INPUT = `${CLASE_CAMPO} h-11`;

/** Cuadro de varias líneas. */
export const CLASE_AREA = `${CLASE_CAMPO} resize-none py-2.5 leading-relaxed`;

/** Manda el formulario SIN dejar que React lo vacíe. Con `<form action={fn}>`
    React 19 limpia todos los campos apenas termina el envío, aunque haya
    fallado: un correo largo escrito a mano se perdía si el servidor de correo
    daba error. Con esto el texto queda hasta que el envío salga bien. */
export function enviarSinBorrar(accion: (form: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    accion(new FormData(e.currentTarget));
  };
}

export function Campo({
  etiqueta,
  ayuda,
  children,
  className,
}: {
  etiqueta: string;
  ayuda?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-[12px] font-medium text-ink-mute">{etiqueta}</span>
      {children}
      {ayuda ? <span className="text-[11.5px] leading-snug text-ink-faint">{ayuda}</span> : null}
    </label>
  );
}

/** Resultado de la acción: error en rojo, éxito en verde. Se anuncia solo a
    quien usa lector de pantalla. */
export function MensajeResultado({ estado }: { estado: ResultadoAccion | null }) {
  if (!estado) return null;
  if (!estado.ok) {
    return (
      <p role="alert" className="rounded-xl bg-bad/10 px-3.5 py-2.5 text-[12.5px] leading-snug text-bad">
        {estado.error}
      </p>
    );
  }
  return (
    <p role="status" className="rounded-xl bg-ok/10 px-3.5 py-2.5 text-[12.5px] leading-snug text-ok">
      {estado.mensaje}
    </p>
  );
}

/** Botones de abajo. Con éxito queda solo "Cerrar": ya no hay nada que enviar. */
export function BotonesFormulario({
  ok,
  pendiente,
  textoEnviar,
  textoPendiente,
  onCerrar,
}: {
  ok: boolean;
  pendiente: boolean;
  textoEnviar: string;
  textoPendiente: string;
  onCerrar: () => void;
}) {
  return (
    <div className={cn("grid gap-2 sm:flex sm:justify-end", ok ? "grid-cols-1" : "grid-cols-2")}>
      <button
        type="button"
        onClick={onCerrar}
        className={cn(BOTON_BASE, BOTON.secundario, TAM_FORM)}
      >
        {ok ? "Cerrar" : "Cancelar"}
      </button>
      {ok ? null : (
        <button type="submit" disabled={pendiente} className={cn(BOTON_BASE, BOTON.primario, TAM_FORM)}>
          {pendiente ? textoPendiente : textoEnviar}
        </button>
      )}
    </div>
  );
}
