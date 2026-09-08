/* ==========================================================================
   Esqueleto mientras carga una pantalla del panel. Barras neutras con un
   brillo que recorre: se nota que algo viene, sin dar un salto.
   ========================================================================== */
export default function CargandoPanel() {
  return (
    <div className="flex flex-col gap-[22px]">
      <div className="h-7 w-52 animate-pulse rounded-lg bg-surface-3" />
      <div className="grid gap-[18px] xl:grid-cols-[1.65fr_1fr]">
        <div className="h-64 animate-pulse rounded-2xl border border-line bg-surface-2" />
        <div className="h-64 animate-pulse rounded-2xl border border-line bg-surface-2" />
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        <div className="h-36 animate-pulse rounded-[14px] border border-line bg-surface-2" />
        <div className="h-36 animate-pulse rounded-[14px] border border-line bg-surface-2" />
        <div className="h-36 animate-pulse rounded-[14px] border border-line bg-surface-2" />
      </div>
    </div>
  );
}
