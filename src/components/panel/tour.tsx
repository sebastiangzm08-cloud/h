"use client";

/* ==========================================================================
   Recorrido guiado — estilo Facebook/grandes empresas: resalta una sección
   por vez con un texto corto, NUNCA obliga (se puede saltar en cualquier
   momento) y se puede volver a ver después (queda un link chiquito para
   reiniciarlo — ver `LinkReiniciarTour`). Pedido de Sebastián, 2026-09-15.

   Se guarda en localStorage por navegador (es una preferencia de "ya lo
   vi", no un dato del negocio) — mismo criterio que el tema claro/oscuro.
   Cada paso apunta a un elemento real por `data-tour="..."` en vez de
   coordenadas fijas, así sigue funcionando si el sidebar cambia de tamaño
   o de orden.
   ========================================================================== */
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type PasoTour = {
  /** Ej.: `[data-tour="resumen"]` — selector CSS del elemento a resaltar. */
  selector: string;
  titulo: string;
  texto: string;
};

const ANCHO_POPOVER = 300;
const ALTO_POPOVER_ESTIMADO = 160;
const MARGEN = 14;
const HOLGURA = 6;

function claveTour(id: string) {
  return `hoshizora-tour-${id}`;
}

/** Le avisa al resto de la página (el link de "Reiniciar recorrido") que
    este tour ya se completó o se saltó, sin tener que levantar estado
    compartido — un evento del navegador alcanza para algo tan chico. */
function avisarCambio(id: string) {
  window.dispatchEvent(new CustomEvent("hoshizora-tour-cambio", { detail: { id } }));
}

export function TourGuiado({ id, pasos }: { id: string; pasos: PasoTour[] }) {
  const [paso, setPaso] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!localStorage.getItem(claveTour(id))) setPaso(0);
  }, [id]);

  // Si en otra pestaña/lugar se reinicia el tour, arrancar de nuevo acá también.
  useEffect(() => {
    function alReiniciar(e: Event) {
      const detalle = (e as CustomEvent<{ id: string }>).detail;
      if (detalle?.id === id) setPaso(0);
    }
    window.addEventListener("hoshizora-tour-reiniciar", alReiniciar);
    return () => window.removeEventListener("hoshizora-tour-reiniciar", alReiniciar);
  }, [id]);

  const medir = useCallback(() => {
    if (paso === null) return;
    const el = document.querySelector(pasos[paso]?.selector ?? "");
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    setRect(el.getBoundingClientRect());
  }, [paso, pasos]);

  useEffect(() => {
    medir();
    window.addEventListener("resize", medir);
    // El scroll suave de `scrollIntoView` tarda un momento — se vuelve a
    // medir después para no dejar el resalte pegado en la posición vieja.
    const t = setTimeout(medir, 280);
    return () => {
      window.removeEventListener("resize", medir);
      clearTimeout(t);
    };
  }, [medir]);

  function terminar() {
    localStorage.setItem(claveTour(id), "1");
    setPaso(null);
    avisarCambio(id);
  }

  function siguiente() {
    if (paso === null) return;
    if (paso >= pasos.length - 1) terminar();
    else setPaso(paso + 1);
  }

  function anterior() {
    if (paso === null || paso === 0) return;
    setPaso(paso - 1);
  }

  if (paso === null || !rect || typeof window === "undefined") return null;
  const actual = pasos[paso];

  const espacioDerecha = window.innerWidth - rect.right;
  const espacioAbajo = window.innerHeight - rect.bottom;

  let top: number;
  let left: number;
  if (espacioDerecha >= ANCHO_POPOVER + MARGEN * 2) {
    left = rect.right + MARGEN;
    top = rect.top;
  } else if (espacioAbajo >= ALTO_POPOVER_ESTIMADO + MARGEN * 2) {
    left = rect.left;
    top = rect.bottom + MARGEN;
  } else {
    left = rect.left;
    top = rect.top - ALTO_POPOVER_ESTIMADO - MARGEN;
  }
  // Nunca se sale de la pantalla, sin importar dónde haya caído el cálculo.
  left = Math.min(Math.max(MARGEN, left), window.innerWidth - ANCHO_POPOVER - MARGEN);
  top = Math.min(Math.max(MARGEN, top), window.innerHeight - ALTO_POPOVER_ESTIMADO - MARGEN);

  const hueco = {
    top: rect.top - HOLGURA,
    left: rect.left - HOLGURA,
    width: rect.width + HOLGURA * 2,
    height: rect.height + HOLGURA * 2,
  };

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-label="Recorrido guiado">
      {/* Cuatro franjas oscuras alrededor del hueco — más simple y sin
          artefactos que un mask/clip-path, y se recalcula sin drama. */}
      <div className="fixed bg-black/55" style={{ top: 0, left: 0, right: 0, height: Math.max(0, hueco.top) }} />
      <div className="fixed bg-black/55" style={{ top: hueco.top + hueco.height, left: 0, right: 0, bottom: 0 }} />
      <div className="fixed bg-black/55" style={{ top: hueco.top, left: 0, width: Math.max(0, hueco.left), height: hueco.height }} />
      <div className="fixed bg-black/55" style={{ top: hueco.top, left: hueco.left + hueco.width, right: 0, height: hueco.height }} />

      <div
        className="pointer-events-none fixed rounded-lg shadow-[0_0_0_2px_#7c5cff]"
        style={{ top: hueco.top, left: hueco.left, width: hueco.width, height: hueco.height }}
      />

      <div
        className="fixed rounded-xl border border-line-strong bg-surface-2 p-4 shadow-2xl"
        style={{ top, left, width: ANCHO_POPOVER }}
      >
        <p className="font-mono text-[10px] tracking-wide text-ink-faint uppercase">
          {paso + 1} de {pasos.length}
        </p>
        <p className="mt-1 text-[14px] font-semibold text-ink">{actual.titulo}</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{actual.texto}</p>
        <div className="mt-3.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={terminar}
            className="text-[12px] text-ink-faint transition-colors hover:text-ink-mute"
          >
            Saltar recorrido
          </button>
          <div className="flex items-center gap-2">
            {paso > 0 ? (
              <button
                type="button"
                onClick={anterior}
                className="rounded-full border border-line-strong px-3 py-1.5 text-[12px] text-ink-soft transition-colors hover:bg-surface-3"
              >
                Atrás
              </button>
            ) : null}
            <button
              type="button"
              onClick={siguiente}
              className={cn(
                "rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-medium text-paper transition-colors hover:bg-ink-soft"
              )}
            >
              {paso >= pasos.length - 1 ? "Listo" : "Siguiente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Link chico para volver a ver el recorrido — nunca queda enterrado sin
    forma de repetirlo. Se para donde tenga sentido en cada pantalla. */
export function LinkReiniciarTour({ id, texto = "Ver el recorrido" }: { id: string; texto?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        localStorage.removeItem(claveTour(id));
        window.dispatchEvent(new CustomEvent("hoshizora-tour-reiniciar", { detail: { id } }));
      }}
      className="-my-2 py-2 text-[12.5px] text-ink-faint underline decoration-line-strong underline-offset-2 transition-colors hover:text-ink-mute lg:-my-0.5 lg:py-0.5 lg:text-[11.5px]"
    >
      {texto}
    </button>
  );
}
