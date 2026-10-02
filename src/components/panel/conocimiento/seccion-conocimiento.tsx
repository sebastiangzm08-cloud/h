"use client";

/* ==========================================================================
   Una sección de Conocimiento (servicios, datos o reglas): encabezado con su
   botón de agregar, la lista, el formulario que se abre debajo del encabezado
   (no al fondo, donde en una lista larga ni se vería) y el estado vacío.

   Los datos llegan del servidor ya listos; acá solo vive qué está abierto y el
   aviso de "Agregado" después de guardar.
   ========================================================================== */
import { useEffect, useState, type ReactNode } from "react";
import {
  FilaConocimiento,
  FormaAgregarConocimiento,
  TEXTOS_CONOCIMIENTO,
} from "@/components/panel/agente-conocimiento-form";
import { BTN_SUAVE } from "@/components/panel/configuracion/estilos";
import { IconoCheck, IconoMas } from "@/components/panel/configuracion/iconos-extra";
import { EstadoVacio, Seccion } from "@/components/panel/configuracion/seccion";
import type { NombreIcono } from "@/components/panel/iconos";
import type { ItemConocimiento } from "@/lib/panel/agente";

export function SeccionConocimiento({
  id,
  tipo,
  eyebrow,
  titulo,
  descripcion,
  icono,
  vacioTitulo,
  vacioTexto,
  items,
}: {
  id: string;
  tipo: ItemConocimiento["tipo"];
  eyebrow: string;
  titulo: string;
  descripcion: ReactNode;
  icono: NombreIcono;
  vacioTitulo: string;
  vacioTexto: string;
  items: ItemConocimiento[];
}) {
  const [abierto, setAbierto] = useState(false);
  const [agregado, setAgregado] = useState<string | null>(null);
  const textos = TEXTOS_CONOCIMIENTO[tipo];
  const apagados = items.filter((i) => !i.activo).length;

  /* El aviso de "Agregado" se apaga solo: dejarlo pegado es ruido. */
  useEffect(() => {
    if (!agregado) return;
    const t = setTimeout(() => setAgregado(null), 5000);
    return () => clearTimeout(t);
  }, [agregado]);

  const botonAgregar = (
    <button
      type="button"
      onClick={() => {
        setAgregado(null);
        setAbierto(true);
      }}
      className={BTN_SUAVE}
    >
      <IconoMas className="h-4 w-4" />
      {textos.boton}
    </button>
  );

  return (
    <Seccion
      id={id}
      eyebrow={eyebrow}
      titulo={
        <>
          {titulo}
          <span className="ml-2 font-mono text-[11px] font-normal text-ink-mute tabular-nums">
            {items.length}
            {apagados > 0 ? ` · ${apagados} ${apagados === 1 ? "apagado" : "apagados"}` : ""}
          </span>
        </>
      }
      descripcion={descripcion}
      accion={abierto || items.length === 0 ? null : botonAgregar}
      sinRelleno
    >
      {agregado ? (
        <p
          role="status"
          className="mx-4 mb-3 flex items-center gap-2 rounded-xl bg-ok/10 px-3.5 py-2.5 text-[12.5px] text-ok sm:mx-[18px]"
        >
          <IconoCheck className="h-4 w-4 flex-none" />
          {agregado} Ya lo usa en la siguiente conversación.
        </p>
      ) : null}

      {abierto ? (
        <FormaAgregarConocimiento
          tipo={tipo}
          alCerrar={() => setAbierto(false)}
          alAgregar={(mensaje) => {
            setAbierto(false);
            setAgregado(mensaje);
          }}
        />
      ) : null}

      {items.length === 0 ? (
        abierto ? null : (
          <div className="px-4 sm:px-[18px]">
            <EstadoVacio icono={icono} titulo={vacioTitulo} accion={botonAgregar}>
              {vacioTexto}
            </EstadoVacio>
          </div>
        )
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {items.map((item) => (
            <FilaConocimiento key={item.id} item={item} />
          ))}
        </ul>
      )}
    </Seccion>
  );
}
