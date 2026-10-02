"use client";

/* ==========================================================================
   HOJA — el contenedor de todo lo que se abre "encima" en Conversaciones
   (acciones rápidas, ficha del contacto, quién atiende la conversación).

   Celular primero (decisión de Sebastian, 2026-09-30):
   - hoja inferior con asa, esquinas redondeadas y alto máximo en `dvh` con
     desplazamiento interno, que se cierra tocando afuera, con Escape, con la
     X o deslizando el asa hacia abajo;
   - respeta `env(safe-area-inset-bottom)` (barra de gestos del iPhone);
   - el teclado virtual no la tapa: se mide `visualViewport` y se levanta la
     hoja por encima del teclado (iOS y Android reducen el viewport VISUAL
     pero no el de diseño, y por eso `dvh` solo no alcanza);
   - desde 768 px es una tarjeta centrada.

   Es un <dialog> nativo con `showModal()`: el navegador hace el atrapado de
   foco, deja el resto inerte y maneja Escape. La animación de salida corre
   ANTES de cerrar de verdad (por eso `cerrar()` espera 190 ms y recién ahí
   avisa al padre).
   ========================================================================== */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  type PointerEvent as EventoPuntero,
  type ReactNode,
} from "react";
import { IconoChat } from "./iconos-chat";
import "./conversaciones.css";

const MS_SALIDA = 190;

/** Para cerrar la hoja CON la animación de salida desde adentro de su contenido. */
const ContextoHoja = createContext<() => void>(() => undefined);
export function useCerrarHoja() {
  return useContext(ContextoHoja);
}
const MS_DESLIZAR = 180;

export function Hoja({
  abierta,
  onCerrar,
  titulo,
  descripcion,
  children,
}: {
  abierta: boolean;
  onCerrar: () => void;
  titulo: string;
  descripcion?: string;
  children: ReactNode;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const caja = useRef<HTMLDivElement>(null);
  const idTitulo = useId();
  const temporizador = useRef<number | undefined>(undefined);
  const cerrando = useRef(false);
  const empezoEnElFondo = useRef(false);
  const arrastre = useRef<{ y0: number; dy: number; t0: number } | null>(null);

  /* Abrir / cerrar el <dialog> según `abierta`. Todo son escrituras al DOM,
     ningún setState. */
  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (abierta) {
      cerrando.current = false;
      d.removeAttribute("data-saliendo");
      if (caja.current) {
        caja.current.style.transition = "";
        caja.current.style.transform = "";
      }
      if (!d.open) d.showModal();
      /* El foco va a la hoja (no al primer campo): en celular enfocar un
         input abriría el teclado antes de que la persona lea nada. */
      caja.current?.focus({ preventScroll: true });
    } else if (d.open) {
      d.close();
    }
  }, [abierta]);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  /* El teclado virtual: la hoja se pega al borde de lo que SÍ se ve. */
  useEffect(() => {
    if (!abierta) return;
    const vv = window.visualViewport;
    const d = dialogo.current;
    if (!vv || !d) return;
    const ajustar = () => {
      d.style.setProperty("--hoja-alto", `${vv.height}px`);
      d.style.setProperty(
        "--hoja-bajo",
        `${Math.max(0, window.innerHeight - vv.height - vv.offsetTop)}px`
      );
    };
    ajustar();
    vv.addEventListener("resize", ajustar);
    vv.addEventListener("scroll", ajustar);
    return () => {
      vv.removeEventListener("resize", ajustar);
      vv.removeEventListener("scroll", ajustar);
      d.style.removeProperty("--hoja-alto");
      d.style.removeProperty("--hoja-bajo");
    };
  }, [abierta]);

  const cerrar = useCallback(() => {
    if (cerrando.current) return;
    cerrando.current = true;
    dialogo.current?.setAttribute("data-saliendo", "");
    temporizador.current = window.setTimeout(onCerrar, MS_SALIDA);
  }, [onCerrar]);

  /* Deslizar el asa hacia abajo para cerrar (solo celular). */
  function alBajar(e: EventoPuntero<HTMLDivElement>) {
    if (window.matchMedia("(min-width: 768px)").matches) return;
    /* Un botón dentro del asa (la X) tiene que seguir recibiendo su clic. */
    if ((e.target as HTMLElement).closest("button")) return;
    arrastre.current = { y0: e.clientY, dy: 0, t0: e.timeStamp };
    e.currentTarget.setPointerCapture(e.pointerId);
    if (caja.current) caja.current.style.transition = "none";
  }

  function alMover(e: EventoPuntero<HTMLDivElement>) {
    const a = arrastre.current;
    if (!a || !caja.current) return;
    a.dy = Math.max(0, e.clientY - a.y0);
    caja.current.style.transform = `translateY(${a.dy}px)`;
  }

  function alSoltar(e: EventoPuntero<HTMLDivElement>) {
    const a = arrastre.current;
    arrastre.current = null;
    const el = caja.current;
    if (!a || !el) return;
    const velocidad = a.dy / Math.max(1, e.timeStamp - a.t0);
    if (a.dy > 90 || (a.dy > 24 && velocidad > 0.6)) {
      cerrando.current = true;
      el.style.transition = `transform ${MS_DESLIZAR}ms cubic-bezier(0.4, 0, 1, 1)`;
      el.style.transform = "translateY(100%)";
      temporizador.current = window.setTimeout(onCerrar, MS_DESLIZAR);
    } else {
      el.style.transition = "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.transform = "";
    }
  }

  return (
    <dialog
      ref={dialogo}
      className="hoja"
      aria-labelledby={idTitulo}
      onCancel={(e) => {
        e.preventDefault();
        cerrar();
      }}
      onClose={() => {
        if (abierta && !cerrando.current) onCerrar();
      }}
      onPointerDown={(e) => {
        empezoEnElFondo.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        /* Solo cuenta si el toque EMPEZÓ y terminó en el fondo: arrastrar
           para seleccionar texto y soltar afuera no la cierra. */
        if (e.target === e.currentTarget && empezoEnElFondo.current) cerrar();
      }}
    >
      <div
        ref={caja}
        tabIndex={-1}
        className="hoja-caja flex min-h-0 flex-col overflow-hidden rounded-t-[22px] border border-b-0 border-line-strong bg-surface text-ink-soft shadow-[0_-18px_48px_-12px_rgba(0,0,0,0.6)] outline-none md:rounded-[22px] md:border-b"
      >
        <div
          className="flex-none touch-none select-none"
          onPointerDown={alBajar}
          onPointerMove={alMover}
          onPointerUp={alSoltar}
          onPointerCancel={alSoltar}
        >
          <div aria-hidden="true" className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line-strong md:hidden" />
          <div className="flex items-start gap-3 py-1 pr-2 pl-4 md:pt-3">
            <div className="min-w-0 flex-1 pt-2">
              <h2 id={idTitulo} className="text-[16px] leading-snug font-semibold tracking-tight text-ink">
                {titulo}
              </h2>
              {descripcion ? (
                <p className="mt-0.5 text-[12.5px] leading-snug text-ink-mute">{descripcion}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar"
              className="grid h-11 w-11 flex-none place-items-center rounded-full text-ink-mute transition-colors hover:bg-surface-2 hover:text-ink active:bg-surface-3"
            >
              <IconoChat nombre="cerrar" className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        <div className="scroll-fino min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-1 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <ContextoHoja.Provider value={cerrar}>{abierta ? children : null}</ContextoHoja.Provider>
        </div>
      </div>
    </dialog>
  );
}
