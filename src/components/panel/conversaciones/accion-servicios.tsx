"use client";

/* ==========================================================================
   Acción rápida: SERVICIOS Y PRECIOS.

   Lista lo que el cliente cargó en Conocimiento (`wa_conocimiento`, tipo
   servicio, solo los activos). Al tocar uno, lo pone en la caja de escribir
   ("Limpieza dental: ₡25.000 (40 min)") para que la persona lo edite y lo
   envíe. "Poner la lista completa" arma todos de una vez.

   Independiente: no sabe de las otras acciones. Para quitarla basta borrar
   su línea en `acciones-rapidas.tsx`.
   ========================================================================== */
import { useState } from "react";
import { IconoChat } from "./iconos-chat";
import { ChipAccion } from "./chip-accion";
import { Hoja, useCerrarHoja } from "./hoja";
import { VacioHoja } from "./vacio-hoja";
import { duracionTexto, lineaServicio, precioTexto, textoServicios } from "./textos";
import type { ServicioChat } from "@/lib/panel/conversaciones";
import type { PropsAccion } from "./acciones-tipos";

function ListaServicios({
  servicios,
  ponerEnCaja,
}: {
  servicios: ServicioChat[];
  ponerEnCaja: (texto: string) => void;
}) {
  const cerrar = useCerrarHoja();

  if (servicios.length === 0) {
    return (
      <VacioHoja
        texto="Todavía no cargaste servicios. Agregalos en Conocimiento y aparecen acá, listos para mandar."
        href="/panel/agente/que-sabe"
        enlace="Ir a Conocimiento"
      />
    );
  }

  return (
    <div className="flex flex-col">
      <ul className="flex flex-col divide-y divide-line">
        {servicios.map((s) => {
          const precio = precioTexto(s.monto);
          const dur = duracionTexto(s.duracionMin);
          return (
            <li key={s.clave}>
              <button
                type="button"
                onClick={() => {
                  ponerEnCaja(lineaServicio(s));
                  cerrar();
                }}
                className="-mx-2 flex min-h-14 w-[calc(100%+1rem)] items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-surface-2 active:bg-surface-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] leading-snug font-medium text-ink">{s.clave}</span>
                  {dur ? <span className="mt-0.5 block text-[12px] text-ink-mute">{dur}</span> : null}
                </span>
                {precio ? (
                  <span className="flex-none font-mono text-[13.5px] text-ink tabular-nums">{precio}</span>
                ) : (
                  <span className="flex-none text-[12px] text-ink-mute">Sin precio</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {servicios.length > 1 ? (
        <button
          type="button"
          onClick={() => {
            ponerEnCaja(textoServicios(servicios));
            cerrar();
          }}
          className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl border border-[var(--panel-acento-borde)] bg-[var(--panel-acento-fondo)] text-[14px] font-medium text-[color:var(--panel-acento-texto)] transition-[transform,background-color] active:scale-[0.99]"
        >
          Poner la lista completa
        </button>
      ) : null}
    </div>
  );
}

export function AccionServicios({ datos, ponerEnCaja }: PropsAccion) {
  const [abierta, setAbierta] = useState(false);

  return (
    <>
      <ChipAccion icono={<IconoChat nombre="precio" className="h-[18px] w-[18px]" />} onClick={() => setAbierta(true)}>
        Servicios y precios
      </ChipAccion>

      <Hoja
        abierta={abierta}
        onCerrar={() => setAbierta(false)}
        titulo="Servicios y precios"
        descripcion="Tocá uno para ponerlo en el mensaje. Sale de lo que cargaste en Conocimiento."
      >
        <ListaServicios servicios={datos.servicios} ponerEnCaja={ponerEnCaja} />
      </Hoja>
    </>
  );
}
