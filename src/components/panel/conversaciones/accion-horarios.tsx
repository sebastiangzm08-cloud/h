"use client";

/* ==========================================================================
   Acción rápida: HORARIOS LIBRES.

   Los horarios salen de calcular, en el servidor, la agenda real del
   negocio: su horario (`clientes.horario`), las citas ya agendadas y la
   capacidad / colchón / anticipación de "Cómo responde" (ver
   `lib/panel/conversaciones.ts`). Acá la persona elige cuáles ofrecer y se
   ponen en la caja de escribir como un mensaje que puede editar antes de
   enviar. No agenda nada: solo ofrece.

   Independiente: no sabe de las otras acciones. Para quitarla basta borrar
   su línea en `acciones-rapidas.tsx`.
   ========================================================================== */
import { useState } from "react";
import { IconoChat } from "./iconos-chat";
import { ChipAccion } from "./chip-accion";
import { Hoja, useCerrarHoja } from "./hoja";
import { VacioHoja } from "./vacio-hoja";
import { duracionTexto, textoHorarios } from "./textos";
import { cn } from "@/lib/utils";
import type { HorariosServicio } from "@/lib/panel/conversaciones";
import type { PropsAccion } from "./acciones-tipos";

/** Por defecto: el primer horario de cada uno de los primeros 3 días. */
function seleccionInicial(s: HorariosServicio | undefined): string[] {
  if (!s) return [];
  return s.dias.slice(0, 3).flatMap((d) => (d.horas[0] ? [d.horas[0].iso] : []));
}

/** La duración, avisando si no es un dato cargado sino el valor por defecto. */
function duracionAviso(min: number, estimada: boolean) {
  return estimada ? `sin duración cargada (se calcula con ${duracionTexto(min)})` : duracionTexto(min);
}

/** "Hoy" / "Mañana" / "" según el día (la fecha de hoy viene del servidor). */
function rotuloDia(fecha: string, hoy: string) {
  if (fecha === hoy) return "Hoy";
  const manana = new Date(`${hoy}T12:00:00Z`);
  manana.setUTCDate(manana.getUTCDate() + 1);
  return fecha === manana.toISOString().slice(0, 10) ? "Mañana" : "";
}

/** El contenido de la hoja. Se monta al abrir: la selección arranca limpia. */
function PanelHorarios({ datos, ponerEnCaja }: Pick<PropsAccion, "datos" | "ponerEnCaja">) {
  const cerrar = useCerrarHoja();
  const { horarios } = datos;
  const servicios = horarios.estado === "ok" ? horarios.porServicio : [];

  const [indice, setIndice] = useState(0);
  const [elegidos, setElegidos] = useState<string[]>(() => seleccionInicial(servicios[0]));

  if (horarios.estado === "sin_servicios")
    return (
      <VacioHoja
        texto="Para calcular horarios necesito saber cuánto dura cada servicio. Cargalos en Conocimiento."
        href="/panel/agente/que-sabe"
        enlace="Ir a Conocimiento"
      />
    );
  if (horarios.estado === "sin_horario")
    return (
      <VacioHoja
        texto="Todavía no cargaste el horario del negocio, así que no puedo saber cuándo hay campo. Cargalo en Cómo responde."
        href="/panel/agente/como-responde"
        enlace="Ir a Cómo responde"
      />
    );
  const actual = servicios[indice] ?? servicios[0];
  if (horarios.estado === "error" || !actual)
    return (
      <VacioHoja texto="No pude leer la agenda en este momento. Probá de nuevo en un rato: prefiero no mostrarte horarios sin estar seguro." />
    );

  const dias = actual.dias;

  const elegirServicio = (i: number) => {
    setIndice(i);
    setElegidos(seleccionInicial(servicios[i]));
  };
  const alternar = (iso: string) =>
    setElegidos((previos) => (previos.includes(iso) ? previos.filter((x) => x !== iso) : [...previos, iso]));
  const poner = () => {
    const lista = dias.map((dia) => ({
      dia,
      horas: dia.horas.filter((h) => elegidos.includes(h.iso)).map((h) => h.texto),
    }));
    ponerEnCaja(textoHorarios(actual.servicio, lista, datos.trato));
    cerrar();
  };

  return (
    <div className="flex flex-col gap-4">
      {servicios.length > 1 ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] text-ink-mute">Para qué servicio</span>
          <select
            autoComplete="off"
            value={servicios.indexOf(actual)}
            onChange={(e) => elegirServicio(Number(e.target.value))}
            className="h-12 w-full rounded-xl border border-line-strong bg-surface-2 px-3 text-[16px] text-ink outline-none focus:border-[var(--panel-acento)]"
          >
            {servicios.map((s, i) => (
              <option key={s.servicio} value={i}>
                {s.servicio} · {duracionAviso(s.duracionMin, s.duracionEstimada)}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="text-[13px] text-ink-mute">
          <span className="text-ink">{actual.servicio}</span> · {duracionAviso(actual.duracionMin, actual.duracionEstimada)}
        </p>
      )}

      {dias.length === 0 ? (
        <VacioHoja
          texto={`No hay horarios libres para ${actual.servicio} en los próximos días: la agenda está llena o el horario del negocio no alcanza.`}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {dias.map((dia) => {
            const rotulo = rotuloDia(dia.fecha, datos.hoy);
            return (
              <li key={dia.fecha}>
                <p className="mb-1.5 flex items-baseline gap-2 text-[13px] font-medium text-ink">
                  <span className="inline-block first-letter:uppercase">{dia.corta}</span>
                  {rotulo ? (
                    <span className="font-mono text-[10.5px] tracking-[0.08em] text-[color:var(--panel-acento-texto)] uppercase">
                      {rotulo}
                    </span>
                  ) : null}
                </p>
                <div className="flex flex-wrap gap-2">
                  {dia.horas.map((h) => {
                    const activo = elegidos.includes(h.iso);
                    return (
                      <button
                        key={h.iso}
                        type="button"
                        aria-pressed={activo}
                        onClick={() => alternar(h.iso)}
                        className={cn(
                          "inline-flex h-11 min-w-[88px] items-center justify-center gap-1.5 rounded-xl border px-3 font-mono text-[13px] tabular-nums transition-[background-color,border-color,transform] duration-150 active:scale-[0.97]",
                          activo
                            ? "border-[var(--panel-acento)] bg-[var(--panel-acento-fondo)] text-[color:var(--panel-acento-texto)]"
                            : "border-line-strong bg-surface-2 text-ink-soft hover:border-ink-faint/60"
                        )}
                      >
                        {activo ? <IconoChat nombre="check" className="h-3.5 w-3.5" /> : null}
                        {h.texto}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {dias.length > 0 ? (
        <div className="sticky bottom-0 -mx-4 border-t border-line bg-surface px-4 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={poner}
            disabled={elegidos.length === 0}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--panel-acento)_82%,black)] text-[14px] font-medium text-white transition-[transform,opacity] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40"
          >
            {elegidos.length === 0 ? "Elegí al menos un horario" : `Poner en el mensaje (${elegidos.length})`}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function AccionHorarios({ datos, ponerEnCaja }: PropsAccion) {
  const [abierta, setAbierta] = useState(false);

  return (
    <>
      <ChipAccion icono={<IconoChat nombre="reloj" className="h-[18px] w-[18px]" />} onClick={() => setAbierta(true)}>
        Horarios libres
      </ChipAccion>

      <Hoja
        abierta={abierta}
        onCerrar={() => setAbierta(false)}
        titulo="Horarios libres"
        descripcion="Según tu horario y tu agenda. Elegí cuáles ofrecer y editalos antes de enviar."
      >
        <PanelHorarios datos={datos} ponerEnCaja={ponerEnCaja} />
      </Hoja>
    </>
  );
}
