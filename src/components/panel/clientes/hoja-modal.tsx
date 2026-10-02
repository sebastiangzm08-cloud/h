"use client";

/* ==========================================================================
   Hoja modal: en celular sube desde abajo como una hoja, en escritorio es un
   cuadro centrado. Usa el `<dialog>` nativo del navegador (`showModal`), que
   ya trae solo lo difícil: atrapar el foco, cerrar con Escape y dejar el
   resto de la pantalla inerte.

   Se MONTA solo cuando está abierta: quien la usa decide con un `useState`
   y la dibuja con `{abierto ? <HojaModal …/> : null}`. Así cada vez que se
   abre es un formulario nuevo, sin el mensaje de éxito de la vez anterior
   (el bug que ya habían tenido `agente-cita-form` y `agente-correo-nuevo`).

   Por qué una hoja y no el formulario "en línea": en las pantallas del agente
   el `<main>` es el que scrollea y varias tienen alturas fijas. Un
   formulario largo abierto en línea empujaba todo y a veces quedaba cortado
   en el celular.
   ========================================================================== */
import { useEffect, useId, useRef, type ReactNode } from "react";

export function HojaModal({
  titulo,
  descripcion,
  onCerrar,
  children,
}: {
  titulo: string;
  descripcion?: string;
  onCerrar: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  /* A quién devolverle el foco al cerrar: el botón que la abrió. Se lee una
     sola vez, en el primer render, antes de que el diálogo robe el foco. */
  const quienLaAbrio = useRef<HTMLElement | null>(
    typeof document === "undefined" ? null : (document.activeElement as HTMLElement | null)
  );

  useEffect(() => {
    const dialogo = ref.current;
    /* `!open`: en desarrollo React monta dos veces y `showModal()` sobre uno
       ya abierto tira error. */
    if (dialogo && !dialogo.open) dialogo.showModal();
    const aRestaurar = quienLaAbrio.current;
    return () => aRestaurar?.focus?.();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onClose={onCerrar}
      /* Un clic en el fondo oscuro le llega al propio <dialog> (el contenido
         lo cubre entero), no a un hijo. */
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      className={
        "m-auto w-full max-w-[520px] overflow-hidden rounded-2xl border border-line-strong bg-surface p-0 text-ink " +
        "shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)] outline-none backdrop:bg-black/60 " +
        "max-sm:mb-0 max-sm:max-w-none max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 " +
        "transition-[opacity,translate] duration-200 ease-out starting:open:translate-y-3 starting:open:opacity-0 motion-reduce:transition-none"
      }
    >
      <div className="flex max-h-[min(88dvh,760px)] flex-col">
        <div className="flex flex-none items-start justify-between gap-3 border-b border-line py-3 pr-2.5 pl-5">
          <div className="min-w-0 pt-1.5">
            <h2 id={idTitulo} className="text-[16px] font-semibold tracking-tight text-ink">
              {titulo}
            </h2>
            {descripcion ? (
              <p className="mt-0.5 text-[12.5px] leading-snug text-ink-mute">{descripcion}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="grid h-11 w-11 flex-none place-items-center rounded-xl text-ink-mute transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="scroll-fino min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </dialog>
  );
}
