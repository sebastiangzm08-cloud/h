"use client";

/* ==========================================================================
   Editor del horario de atención, un día por tarjeta. Lo comparten
   Configuración (agenda) y el onboarding del agente: los dos mandan los mismos
   campos (`ini_<día>`, `fin_<día>`, `cerrado_<día>`) y por eso el servidor no
   distingue de dónde vino.

   En celular el día queda arriba y las dos horas debajo: una fila de una sola
   línea con dos selectores de hora no cabe en 360 px. Un día cerrado muestra
   "Cerrado" y esconde las horas (no se mandan: el servidor las ignora).
   ========================================================================== */
import { useState } from "react";
import { CAMPO_HORA } from "./estilos";
import { DIAS_HORARIO } from "@/lib/panel/agente-config";
import { cn } from "@/lib/utils";

type Horario = Record<string, [string, string][]>;

export function EditorHorario({
  horario,
  cerradoPorDefecto = () => true,
}: {
  /** Lo que hay guardado hoy, por día. */
  horario: Horario;
  /** Para un día SIN horario guardado: ¿arranca cerrado o abierto? */
  cerradoPorDefecto?: (clave: string) => boolean;
}) {
  const [cerrados, setCerrados] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      DIAS_HORARIO.map(({ clave }) => [clave, horario[clave]?.length ? false : cerradoPorDefecto(clave)])
    )
  );

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {DIAS_HORARIO.map(({ clave, texto }) => {
        const bloque = horario[clave]?.[0];
        const cerrado = cerrados[clave];
        return (
          <div
            key={clave}
            className="rounded-xl border border-line bg-surface px-3.5 py-1.5 sm:flex sm:items-center sm:gap-4"
          >
            <label className="flex min-h-11 cursor-pointer items-center gap-3 sm:w-44 sm:flex-none">
              <input
                type="checkbox"
                checked={!cerrado}
                onChange={(e) => setCerrados((c) => ({ ...c, [clave]: !e.target.checked }))}
                aria-label={`${texto}: abierto`}
                className="h-5 w-5 flex-none accent-[color:var(--panel-acento)]"
              />
              <span className="text-[13px] font-medium text-ink-soft">{texto}</span>
              {cerrado ? <span className="text-[12px] text-ink-mute">Cerrado</span> : null}
            </label>

            <div className={cn("items-center gap-2 pb-2 sm:flex-1 sm:pb-0", cerrado ? "hidden" : "flex")}>
              <input
                type="time"
                name={`ini_${clave}`}
                defaultValue={bloque?.[0] ?? "08:00"}
                disabled={cerrado}
                aria-label={`${texto}: abre`}
                className={cn(CAMPO_HORA, "min-w-0 flex-1 sm:max-w-[150px]")}
              />
              <span className="flex-none text-[12px] text-ink-mute">a</span>
              <input
                type="time"
                name={`fin_${clave}`}
                defaultValue={bloque?.[1] ?? "17:00"}
                disabled={cerrado}
                aria-label={`${texto}: cierra`}
                className={cn(CAMPO_HORA, "min-w-0 flex-1 sm:max-w-[150px]")}
              />
            </div>
            <input type="hidden" name={`cerrado_${clave}`} value={cerrado ? "on" : ""} />
          </div>
        );
      })}
    </div>
  );
}
