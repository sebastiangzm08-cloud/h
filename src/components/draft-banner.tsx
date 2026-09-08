import { site } from "@/config/site";

export function DraftBanner() {
  if (!site.mostrarAvisoBorrador) return null;
  return (
    <div className="bg-noche text-noche-texto">
      <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-[0.75rem] tracking-tight">
        <span className="hidden sm:inline">Prototipo de trabajo —</span>
        textos, precios y datos de contacto son de ejemplo.
      </p>
    </div>
  );
}
