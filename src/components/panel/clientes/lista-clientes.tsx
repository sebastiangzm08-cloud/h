"use client";

/* ==========================================================================
   Lista de Clientes con búsqueda y filtro por estado (Fase 4a).

   Una sola lista que cambia de forma, sin duplicar nada en el DOM:
   - Celular y tablet: tarjetas. Nombre y estado arriba, última actividad y
     próxima cita en una franja, y los botones al final (44 px).
   - Escritorio ancho (`xl`): tabla con columnas fijas y encabezado.

   Los textos de tiempo ("hace 2 h", "Jue 24 · 8:00 a.m.") llegan YA
   calculados desde el servidor: si se calcularan acá, el reloj del servidor
   y el del navegador no coincidirían al hidratar y React protestaría.

   Agendar cita y programar recordatorio se abren en una hoja modal; hay UNA
   sola para toda la lista, no una por fila (con 300 clientes serían 600).
   ========================================================================== */
import Link from "next/link";
import { useMemo, useState } from "react";
import { FormularioCitaContacto, type ServicioOpcion } from "@/components/panel/agente-cita-form";
import { FormularioRecordatorio } from "@/components/panel/agente-recordatorio-form";
import { HojaModal } from "@/components/panel/clientes/hoja-modal";
import {
  Avatar,
  BOTON,
  BOTON_BASE,
  ESTADOS_CLIENTE,
  EstadoVacio,
  Etiqueta,
  Pildora,
  TAM_FILA,
} from "@/components/panel/clientes/piezas";
import { coincide } from "@/components/panel/clientes/texto";
import { Icono } from "@/components/panel/iconos";
import type { EstadoContacto } from "@/lib/panel/agente";
import { cn } from "@/lib/utils";

export type ClienteFila = {
  id: string;
  nombre: string;
  telefono: string;
  estado: EstadoContacto;
  etiquetas: string[];
  /** "hace 2 h" — de la última conversación, o "Registrado …" si no hay. */
  actividad: string;
  /** "Jue 24 · 8:00 a.m." o null. */
  proxima: string | null;
  conversacionId: string | null;
  /** Texto ya normalizado contra el que se busca. */
  busqueda: string;
};

type Filtro = EstadoContacto | "todos";

const ORDEN_ESTADOS: EstadoContacto[] = ["nuevo", "pregunto_precio", "agendado", "cliente", "perdido"];

const COLUMNAS_TABLA = "xl:grid-cols-[minmax(0,1fr)_132px_150px_132px_252px]";

export function ListaClientes({
  filas,
  servicios,
}: {
  filas: ClienteFila[];
  servicios: ServicioOpcion[];
}) {
  const [consulta, setConsulta] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [accion, setAccion] = useState<{ tipo: "cita" | "recordatorio"; id: string; nombre: string } | null>(
    null
  );

  const conteo = useMemo(() => {
    const c: Record<string, number> = {};
    for (const f of filas) c[f.estado] = (c[f.estado] ?? 0) + 1;
    return c;
  }, [filas]);

  const visibles = useMemo(
    () => filas.filter((f) => (filtro === "todos" || f.estado === filtro) && coincide(f.busqueda, consulta)),
    [filas, filtro, consulta]
  );

  if (filas.length === 0) {
    return (
      <EstadoVacio titulo="Todavía no hay clientes">
        Nadie le ha escrito al número. El primer contacto se crea solo, sin que tengás que cargarlo a mano.
      </EstadoVacio>
    );
  }

  const hayFiltros = consulta.trim() !== "" || filtro !== "todos";
  /* Solo los estados que de verdad tiene alguien: un filtro en 0 es ruido. */
  const chips: { clave: Filtro; texto: string; n: number }[] = [
    { clave: "todos", texto: "Todos", n: filas.length },
    ...ORDEN_ESTADOS.filter((e) => (conteo[e] ?? 0) > 0).map((e) => ({
      clave: e as Filtro,
      texto: ESTADOS_CLIENTE[e].texto,
      n: conteo[e],
    })),
  ];

  return (
    <section aria-label="Lista de clientes" className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <label className="relative block md:w-[340px]">
          <span className="sr-only">Buscar clientes</span>
          <Icono
            nombre="buscar"
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-faint"
          />
          <input
            type="search"
            inputMode="search"
            autoComplete="off"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Buscar por nombre o teléfono"
            className={cn(
              "block h-11 w-full min-w-0 rounded-xl border border-line bg-surface-2 pr-3.5 pl-10 text-[16px] text-ink",
              "placeholder:text-ink-faint outline-none transition-[border-color,box-shadow] duration-150",
              "focus:border-[var(--panel-acento)] focus:ring-[3px] focus:ring-[var(--panel-acento-fondo)] md:h-10 md:text-[13.5px]"
            )}
          />
        </label>

        <div
          role="group"
          aria-label="Filtrar por estado"
          className="scroll-fino -mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 sm:mx-0 sm:px-0 md:order-3 md:w-full md:flex-wrap md:overflow-visible"
        >
          {chips.map((c) => {
            const activo = c.clave === filtro;
            return (
              <button
                key={c.clave}
                type="button"
                aria-pressed={activo}
                onClick={() => setFiltro(c.clave)}
                className={cn(
                  "inline-flex h-11 flex-none items-center gap-2 rounded-full border px-4 text-[13px] whitespace-nowrap transition-colors md:h-9 md:px-3.5",
                  activo
                    ? "border-[var(--panel-acento-borde)] bg-[var(--panel-acento-fondo)] font-medium text-[color:var(--panel-acento-texto)]"
                    : "border-line bg-surface-2 text-ink-mute hover:border-line-strong hover:text-ink"
                )}
              >
                {c.texto}
                <span className="font-mono text-[11px] tabular-nums opacity-70">{c.n}</span>
              </button>
            );
          })}
        </div>

        <p aria-live="polite" className="font-mono text-[11px] tracking-wide text-ink-faint md:order-2 md:ml-auto">
          {hayFiltros
            ? `${visibles.length} de ${filas.length} ${filas.length === 1 ? "cliente" : "clientes"}`
            : `${filas.length} ${filas.length === 1 ? "cliente" : "clientes"}`}
        </p>
      </div>

      {visibles.length === 0 ? (
        <EstadoVacio
          titulo="Nadie coincide con eso"
          accion={
            <button
              type="button"
              onClick={() => {
                setConsulta("");
                setFiltro("todos");
              }}
              className={cn(BOTON_BASE, BOTON.secundario, "min-h-11 rounded-xl px-4 text-[13.5px]")}
            >
              Quitar la búsqueda y los filtros
            </button>
          }
        >
          Probá con otro nombre, con parte del teléfono o con otro estado.
        </EstadoVacio>
      ) : (
        <div className="xl:overflow-hidden xl:rounded-2xl xl:border xl:border-line xl:bg-surface-2">
          <div
            aria-hidden="true"
            className={cn(
              "hidden border-b border-line bg-surface-3/40 px-4 py-2.5 font-mono text-[10.5px] tracking-[0.1em] text-ink-faint uppercase",
              "xl:grid xl:gap-x-4",
              COLUMNAS_TABLA
            )}
          >
            <span>Cliente</span>
            <span>Estado</span>
            <span>Última actividad</span>
            <span>Próxima cita</span>
            <span className="text-right">Acciones</span>
          </div>

          <ul className="flex flex-col gap-3 md:grid md:grid-cols-2 xl:flex xl:flex-col xl:gap-0">
            {visibles.map((f, i) => (
              <FilaCliente
                key={f.id}
                fila={f}
                indice={i}
                puedeAgendar={servicios.length > 0}
                onAccion={(tipo) => setAccion({ tipo, id: f.id, nombre: f.nombre || f.telefono })}
              />
            ))}
          </ul>
        </div>
      )}

      {accion?.tipo === "cita" ? (
        <HojaModal
          titulo="Agendar cita"
          descripcion={`Para ${accion.nombre}. Se revisan el horario y los cupos igual que cuando agenda el agente.`}
          onCerrar={() => setAccion(null)}
        >
          <FormularioCitaContacto contactoId={accion.id} servicios={servicios} onCerrar={() => setAccion(null)} />
        </HojaModal>
      ) : null}

      {accion?.tipo === "recordatorio" ? (
        <HojaModal
          titulo="Programar recordatorio"
          descripcion={`Para ${accion.nombre}. El mensaje lo escribís vos; el sistema solo lo manda cuando toca.`}
          onCerrar={() => setAccion(null)}
        >
          <FormularioRecordatorio contactoId={accion.id} onCerrar={() => setAccion(null)} />
        </HojaModal>
      ) : null}
    </section>
  );
}

function FilaCliente({
  fila,
  indice,
  puedeAgendar,
  onAccion,
}: {
  fila: ClienteFila;
  indice: number;
  puedeAgendar: boolean;
  onAccion: (tipo: "cita" | "recordatorio") => void;
}) {
  const e = ESTADOS_CLIENTE[fila.estado] ?? ESTADOS_CLIENTE.nuevo;
  const nombre = fila.nombre || "Sin nombre";
  const etiquetas = fila.etiquetas.slice(0, 2);
  const masEtiquetas = fila.etiquetas.length - etiquetas.length;

  return (
    <li
      className={cn(
        "fila-entra grid content-start gap-y-3.5 rounded-2xl border border-line bg-surface-2 p-4",
        "xl:items-center xl:gap-x-4 xl:gap-y-0 xl:rounded-none xl:border-0 xl:border-t xl:bg-transparent xl:px-4 xl:py-3",
        "xl:first:border-t-0 xl:hover:bg-surface-3/40",
        COLUMNAS_TABLA
      )}
      style={{ animationDelay: `${Math.min(indice, 12) * 22}ms` }}
    >
      <div className="flex min-w-0 items-start gap-3 xl:items-center">
        <Avatar nombre={fila.nombre || fila.telefono} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-medium text-ink">{nombre}</p>
          <p className="font-mono text-[12px] text-ink-mute tabular-nums">{fila.telefono}</p>
          {/* En celular el estado va con las etiquetas, bajo el nombre (a la
              derecha no cabía sin apretar el nombre). En la tabla es su
              propia columna. */}
          <div
            className={cn(
              "mt-2 flex flex-wrap items-center gap-1.5 xl:mt-1.5",
              etiquetas.length === 0 && "xl:hidden"
            )}
          >
            <span className="xl:hidden">
              <Pildora tono={e.tono}>{e.texto}</Pildora>
            </span>
            {etiquetas.map((t) => (
              <Etiqueta key={t}>{t}</Etiqueta>
            ))}
            {masEtiquetas > 0 ? <Etiqueta>+{masEtiquetas}</Etiqueta> : null}
          </div>
        </div>
      </div>

      <div className="hidden xl:block">
        <Pildora tono={e.tono}>{e.texto}</Pildora>
      </div>

      <dl className="grid grid-cols-2 gap-3 rounded-xl bg-surface-3/50 px-3.5 py-2.5 xl:contents">
        <div className="min-w-0">
          <dt className="text-[11px] text-ink-faint xl:sr-only">Última actividad</dt>
          <dd className="mt-0.5 text-[12.5px] leading-snug text-ink-soft xl:mt-0 xl:font-mono xl:text-[12px] xl:text-ink-mute">
            {fila.actividad}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] text-ink-faint xl:sr-only">Próxima cita</dt>
          <dd
            className={cn(
              "mt-0.5 text-[12.5px] leading-snug xl:mt-0 xl:font-mono xl:text-[12px]",
              fila.proxima ? "text-ink-soft xl:text-ink-mute" : "text-ink-faint"
            )}
          >
            {fila.proxima ?? "—"}
          </dd>
        </div>
      </dl>

      <div className="flex gap-2 xl:justify-end">
        {puedeAgendar ? (
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => onAccion("cita")}
            className={cn(BOTON_BASE, BOTON.primario, TAM_FILA, "flex-1 xl:flex-none")}
          >
            Agendar cita
          </button>
        ) : null}
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => onAccion("recordatorio")}
          className={cn(BOTON_BASE, BOTON.secundario, TAM_FILA, "flex-1 xl:flex-none")}
        >
          Recordatorio
        </button>
        {fila.conversacionId ? (
          <Link
            href={`/panel/agente/conversaciones?c=${fila.conversacionId}`}
            prefetch={false}
            aria-label={`Abrir la conversación de ${nombre}`}
            className={cn(
              BOTON_BASE,
              BOTON.secundario,
              "min-h-11 min-w-11 flex-none rounded-xl xl:min-h-8 xl:min-w-8 xl:rounded-lg"
            )}
          >
            <Icono nombre="mensajes" className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </li>
  );
}
