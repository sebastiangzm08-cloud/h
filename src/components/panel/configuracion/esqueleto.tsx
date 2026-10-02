/* ==========================================================================
   Esqueletos de carga de Conocimiento y Configuración.

   Se muestran en el acto mientras llegan los datos del servidor (los
   `loading.tsx` de cada pantalla y los `Suspense` de las partes lentas), así
   la persona ve que el clic hizo algo en vez de mirar la pantalla anterior
   congelada. Respetan "reducir movimiento": sin pulso, quedan como bloques
   quietos. Repiten los márgenes reales de cada tipo de pantalla para que al
   llegar el contenido nada salte.
   ========================================================================== */
import { cn } from "@/lib/utils";

function Barra({ className }: { className?: string }) {
  return <div className={cn("rounded-full bg-surface-3", className)} />;
}

/** Una caja de sección vacía, con su encabezado y unas filas. Sin rol: el
    que la envuelve es quien avisa "Cargando". */
export function CajaEsqueleto({ filas = 3 }: { filas?: number }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-4 sm:p-[18px]">
      <Barra className="h-2.5 w-20" />
      <Barra className="mt-2.5 h-4 w-44" />
      <div className="mt-5 flex flex-col gap-3.5">
        {Array.from({ length: filas }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-6">
            <Barra className="h-3 w-28" />
            <Barra className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Una sola caja con su propio aviso: para un `Suspense` dentro de una pantalla. */
export function EsqueletoSeccion({ filas = 3 }: { filas?: number }) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Cargando…</span>
      <div className="motion-safe:animate-pulse">
        <CajaEsqueleto filas={filas} />
      </div>
    </div>
  );
}

/** Pantalla completa del entorno del Agente: cabecera con raya + cuerpo. */
export function EsqueletoAgente({ cajas = 2 }: { cajas?: number }) {
  return (
    <div role="status" aria-busy="true" className="motion-safe:animate-pulse">
      <span className="sr-only">Cargando…</span>
      <div className="border-b border-line px-6 py-6 md:px-8">
        <Barra className="h-2.5 w-16" />
        <Barra className="mt-3 h-6 w-48" />
        <Barra className="mt-3 h-3 w-full max-w-md" />
      </div>
      <div className="flex flex-col gap-[18px] px-6 py-6 md:px-8">
        {Array.from({ length: cajas }).map((_, i) => (
          <CajaEsqueleto key={i} />
        ))}
      </div>
    </div>
  );
}

/** Pantalla del panel del cliente: título + cajas, con el ritmo del `<main>`. */
export function EsqueletoPanel({ cajas = 2 }: { cajas?: number }) {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-[22px] motion-safe:animate-pulse">
      <span className="sr-only">Cargando…</span>
      <div>
        <Barra className="h-6 w-40" />
        <Barra className="mt-3 h-3 w-full max-w-sm" />
      </div>
      {Array.from({ length: cajas }).map((_, i) => (
        <CajaEsqueleto key={i} />
      ))}
    </div>
  );
}
