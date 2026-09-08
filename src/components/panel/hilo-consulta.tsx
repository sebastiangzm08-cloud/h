/* ==========================================================================
   El hilo de una consulta de soporte: las líneas, una debajo de otra.
   Las del cliente van a la izquierda; las de Hoshizora, a la derecha.
   ========================================================================== */
import type { LineaConsulta } from "@/lib/panel/tipos";
import { cn } from "@/lib/utils";

export function HiloConsulta({
  lineas,
  /** "cliente" cuando lo ve el cliente; "admin" cuando lo ve Sebastián. */
  lado,
}: {
  lineas: LineaConsulta[];
  lado: "cliente" | "admin";
}) {
  if (lineas.length === 0) {
    return (
      <p className="py-6 text-center text-[13px] text-ink-faint">
        Sin mensajes todavía.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {lineas.map((l) => {
        // "propia" = la escribió quien está mirando.
        const propia =
          (lado === "cliente" && l.autor === "cliente") ||
          (lado === "admin" && l.autor === "hoshizora");
        return (
          <li
            key={l.id}
            className={cn("flex flex-col gap-1", propia ? "items-end" : "items-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap",
                propia
                  ? "bg-ink text-paper"
                  : "border border-line bg-surface-2 text-ink-soft"
              )}
            >
              {l.texto}
            </div>
            <span className="px-1 font-mono text-[10px] text-ink-faint">
              {l.autor === "hoshizora" ? "Hoshizora" : "Cliente"} · {l.cuando}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
