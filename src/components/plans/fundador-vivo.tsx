"use client";

/* ==========================================================================
   Precio de fundador con movimiento (elegido por Sebastian el 2026-10-20,
   opción "A · El precio cae en vivo"):

   - El regular se tacha solo, el número baja contando hasta el de fundador
     y cae un sello con el descuento.
   - Al terminar, el precio queda LATIENDO (el pulso que antes tenían los
     cupos; Sebastian lo pidió en el dinero para que llame la atención).
   - Un pulso de luz recorre el borde de la tarjeta sin parar.

   Reglas:
   - El HTML del servidor trae SIEMPRE el precio final (₡50 000): sin JS, o
     para buscadores y lectores de pantalla, el dato es el correcto. La
     animación arranca recién cuando la tarjeta entra en pantalla.
   - Con "reducir movimiento" no hay animación: queda el estado final.
   - Solo blanco y negro: todo usa `currentColor` o los tokens ink/paper.
   ========================================================================== */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* useLayoutEffect avisa en el servidor; acá solo corre en el navegador. */
const useLayoutSeguro = typeof window === "undefined" ? useEffect : useLayoutEffect;

function prefiereQuieto() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* --------------------------------------------------------------------------
   A · Precio que cae
   -------------------------------------------------------------------------- */
type Fase = "final" | "espera" | "tachando" | "contando" | "listo";

export function PrecioQueCae({
  regular,
  fundador,
  formato,
  sufijo,
  etiquetaRegular,
  etiquetaPrecio,
  sello,
  relleno,
}: {
  regular: number;
  fundador: number;
  formato: (n: number) => string;
  /** "/ mes" */
  sufijo: string;
  /** "Precio regular" (para lectores de pantalla) */
  etiquetaRegular: string;
  /** "Precio de fundador" (para lectores de pantalla) */
  etiquetaPrecio: string;
  /** "−60 %" */
  sello: string;
  /** Clases del relleno invertido respecto de la tarjeta (sello). */
  relleno: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [fase, setFase] = useState<Fase>("final");
  const [valor, setValor] = useState(fundador);

  // Antes de pintar: si hay que animar, se arranca desde el precio regular.
  useLayoutSeguro(() => {
    if (prefiereQuieto()) return;
    setFase("espera");
    setValor(regular);
  }, [regular]);

  useEffect(() => {
    const el = ref.current;
    if (!el || fase !== "espera") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setFase("tachando");
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [fase]);

  useEffect(() => {
    if (fase === "tachando") {
      const t = setTimeout(() => setFase("contando"), 450);
      return () => clearTimeout(t);
    }
    if (fase !== "contando") return;
    let raf = 0;
    const inicio = performance.now();
    const dura = 1300;
    const paso = (ahora: number) => {
      const p = Math.min(1, (ahora - inicio) / dura);
      const e = 1 - Math.pow(1 - p, 3);
      // De a ₡500, para que los números que pasan se lean "redondos".
      setValor(Math.round((regular - (regular - fundador) * e) / 500) * 500);
      if (p < 1) raf = requestAnimationFrame(paso);
      else setFase("listo");
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [fase, regular, fundador]);

  const tachado = fase === "final" || fase === "tachando" || fase === "contando" || fase === "listo";
  const conSello = fase === "final" || fase === "listo";

  return (
    <div ref={ref}>
      <p className="sr-only">
        {etiquetaPrecio}: {formato(fundador)} {sufijo}. {etiquetaRegular}: {formato(regular)}.
      </p>

      <div aria-hidden="true" className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        <span
          className={cn(
            "text-[2.75rem] leading-none font-semibold tracking-tight tnum",
            fase === "listo" && "precio-late origin-bottom-left"
          )}
        >
          {formato(valor)}
        </span>
        <span className="text-[0.875rem]">{sufijo}</span>
      </div>

      <div aria-hidden="true" className="mt-2.5 flex items-center gap-3">
        <span className="relative inline-block text-[1.0625rem] tnum">
          {formato(regular)}
          <span
            className={cn(
              "absolute top-[52%] -left-0.5 h-[2.5px] bg-current transition-[width] duration-500 ease-[var(--ease-out-quart)]",
              tachado ? "w-[calc(100%+4px)]" : "w-0"
            )}
          />
        </span>
        <span
          className={cn(
            "inline-flex -rotate-12 rounded-full px-3 py-1 text-[0.9375rem] font-semibold tnum transition-transform",
            relleno,
            conSello ? "scale-100" : "scale-0"
          )}
        >
          {sello}
        </span>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   A · Pulso de luz que recorre el borde de la tarjeta
   -------------------------------------------------------------------------- */
export function BordeVivo({ radio = 16 }: { radio?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [medidas, setMedidas] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const svg = ref.current;
    const padre = svg?.parentElement;
    if (!svg || !padre) return;
    const ro = new ResizeObserver(() => {
      setMedidas({ w: padre.offsetWidth, h: padre.offsetHeight });
    });
    ro.observe(padre);
    return () => ro.disconnect();
  }, []);

  const separacion = 5; // px por fuera del borde de la tarjeta
  const w = medidas.w + separacion * 2;
  const h = medidas.h + separacion * 2;

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute overflow-visible text-ink"
      style={{ left: -separacion, top: -separacion, width: w || 0, height: h || 0 }}
    >
      {medidas.w > 0 && (
        <rect
          className="borde-vivo"
          x={1.5}
          y={1.5}
          width={w - 3}
          height={h - 3}
          rx={radio + separacion}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          pathLength={100}
        />
      )}
    </svg>
  );
}
