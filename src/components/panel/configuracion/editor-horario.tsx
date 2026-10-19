"use client";

/* ==========================================================================
   Editor del horario de atención, un día por tarjeta. Lo comparten
   Configuración (agenda), el onboarding del agente y las pantallas del admin:
   todos mandan los mismos campos (`ini_<día>`, `fin_<día>`, `cerrado_<día>`,
   y el almuerzo: `almuerzo`, `almuerzo_ini`, `almuerzo_fin`) y el servidor
   los arma igual con `horarioDesdeFormulario`.

   El almuerzo es UNO para todos los días (2026-10-18, idea de Sebastian): en
   la base el día queda partido en mañana y tarde, que es lo que el agente ya
   sabe leer. Antes el editor solo veía el primer bloque y, al guardar, se
   comía la tarde de quien cerraba al mediodía.

   En celular el día queda arriba y las dos horas debajo: una fila de una sola
   línea con dos selectores de hora no cabe en 360 px. Un día cerrado muestra
   "Cerrado" y esconde las horas (no se mandan: el servidor las ignora).
   ========================================================================== */
import { useState } from "react";
import { CAMPO_HORA } from "./estilos";
import { PistaCasilla } from "./controles";
import { SelectorHora } from "@/components/panel/selector-hora";
import { almuerzoDeHorario, DIAS_HORARIO, extremosDelDia } from "@/lib/panel/agente-config";
import { cn } from "@/lib/utils";

type Horario = Record<string, [string, string][]>;

const FILA = "rounded-xl border border-line bg-surface px-3.5 py-1.5 sm:flex sm:items-center sm:gap-4";
const ETIQUETA_FILA = "group flex min-h-11 cursor-pointer items-center gap-3 sm:w-36 sm:flex-none";
const HORAS = "items-center gap-2 pb-2 sm:flex-1 sm:pb-0";
const ANCHO_HORA = "flex-1 sm:max-w-[172px]";

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
  const [almuerzoInicial] = useState(() => almuerzoDeHorario(horario));
  const [conAlmuerzo, setConAlmuerzo] = useState(almuerzoInicial.activo);

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {DIAS_HORARIO.map(({ clave, texto }) => {
        const extremos = extremosDelDia(horario[clave]);
        const cerrado = cerrados[clave];
        return (
          <div key={clave} className={FILA}>
            <label className={ETIQUETA_FILA}>
              <input
                type="checkbox"
                checked={!cerrado}
                onChange={(e) => setCerrados((c) => ({ ...c, [clave]: !e.target.checked }))}
                aria-label={`${texto}: abierto`}
                className="peer sr-only"
              />
              <PistaCasilla />
              <span className="text-[13px] font-medium text-ink-soft">{texto}</span>
              {cerrado ? <span className="text-[12px] text-ink-mute">Cerrado</span> : null}
            </label>

            <div className={cn(HORAS, cerrado ? "hidden" : "flex")}>
              <SelectorHora
                name={`ini_${clave}`}
                defaultValue={extremos?.[0] ?? "08:00"}
                disabled={cerrado}
                etiqueta={`${texto}: abre`}
                claseCampo={CAMPO_HORA}
                className={ANCHO_HORA}
              />
              <span className="flex-none text-[12px] text-ink-mute">a</span>
              <SelectorHora
                name={`fin_${clave}`}
                defaultValue={extremos?.[1] ?? "17:00"}
                disabled={cerrado}
                etiqueta={`${texto}: cierra`}
                claseCampo={CAMPO_HORA}
                className={ANCHO_HORA}
              />
            </div>
            <input type="hidden" name={`cerrado_${clave}`} value={cerrado ? "on" : ""} />
          </div>
        );
      })}

      {/* El almuerzo va aparte y con borde punteado: no es un día más, es una
          pausa que se le quita a todos los días abiertos. */}
      <div className={cn(FILA, "mt-1 border-dashed")}>
        <label className={ETIQUETA_FILA}>
          <input
            type="checkbox"
            name="almuerzo"
            checked={conAlmuerzo}
            onChange={(e) => setConAlmuerzo(e.target.checked)}
            aria-label="Cierran al almuerzo"
            className="peer sr-only"
          />
          <PistaCasilla />
          <span className="text-[13px] font-medium text-ink-soft">Almuerzo</span>
          {conAlmuerzo ? null : <span className="text-[12px] text-ink-mute">No cierran</span>}
        </label>

        <div className={cn(HORAS, conAlmuerzo ? "flex" : "hidden")}>
          <SelectorHora
            name="almuerzo_ini"
            defaultValue={almuerzoInicial.ini}
            disabled={!conAlmuerzo}
            etiqueta="Almuerzo: desde"
            claseCampo={CAMPO_HORA}
            className={ANCHO_HORA}
          />
          <span className="flex-none text-[12px] text-ink-mute">a</span>
          <SelectorHora
            name="almuerzo_fin"
            defaultValue={almuerzoInicial.fin}
            disabled={!conAlmuerzo}
            etiqueta="Almuerzo: hasta"
            claseCampo={CAMPO_HORA}
            className={ANCHO_HORA}
          />
        </div>
      </div>
      <p className="px-1 text-[11.5px] leading-snug text-ink-mute">
        {conAlmuerzo
          ? "El agente no ofrece citas en ese rato, ningún día."
          : "Si cierran al mediodía, encendé el almuerzo y el agente no agenda en ese rato."}
      </p>
    </div>
  );
}
