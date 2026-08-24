import { estadoColor, estadoLabel, type EstadoAutomatizacion } from "@/lib/mock-portal";
import { cn } from "@/lib/utils";

export function StatusDot({ estado }: { estado: EstadoAutomatizacion }) {
  const activo = estado === "activa";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          estadoColor[estado],
          activo && "breathe"
        )}
      />
      <span className="text-[0.75rem] text-ink-mute">{estadoLabel[estado]}</span>
    </span>
  );
}
