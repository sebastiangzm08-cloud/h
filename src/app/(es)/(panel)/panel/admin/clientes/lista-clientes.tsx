"use client";

/* ==========================================================================
   La lista de clientes con búsqueda y filtro por estado. El fetch lo hace
   la página (servidor); acá solo se filtra en el navegador — son pocas
   filas y así el filtrado es instantáneo, sin ir y volver al servidor.

   Escritorio ancho (xl): tabla con encabezado. Celular y tablet: cada
   cliente es una tarjeta con sus datos rotulados y los botones abajo. Es el
   MISMO markup: las columnas aparecen con `xl:grid-cols-…` y los rótulos de
   cada dato se esconden donde ya hay encabezado.
   ========================================================================== */
import { useMemo, useState } from "react";
import Link from "next/link";
import { Eyebrow, Pill, colones } from "@/components/panel/ui";
import { Icono } from "@/components/panel/iconos";
import {
  Avatar,
  BTN_CHICO_PRIMARIO,
  BTN_CHICO_SECUNDARIO,
  BTN_SECUNDARIO,
  CAMPO,
  Dato,
  ESTADO_CLIENTE,
  Vacio,
  claseChip,
} from "@/components/admin/admin-ui";
import type { ClienteAdmin } from "@/lib/panel/admin";
import { cn, waLinkCliente } from "@/lib/utils";

type Filtro = "todos" | ClienteAdmin["estado"];

const FILTROS: { valor: Filtro; texto: string }[] = [
  { valor: "todos", texto: "Todos" },
  { valor: "activo", texto: "Activos" },
  { valor: "prueba", texto: "En prueba" },
  { valor: "pausado", texto: "Suspendidos" },
  { valor: "moroso", texto: "Morosos" },
];

/** Columnas de la tabla en pantallas anchas. La primera se estira. */
const COLUMNAS = "xl:grid-cols-[minmax(0,1fr)_72px_56px_92px_96px_84px_172px]";

/** Sin acentos y en minúscula, para comparar sin que "José" falle con "jose". */
function normaliza(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Qué le falta a un cliente para estar en marcha, en palabras. */
function faltaDe(c: ClienteAdmin) {
  return c.onboarding.pasos
    .filter((p) => !p.hecho)
    .map((p) => p.corto)
    .join(", ");
}

export function ListaClientes({ clientes }: { clientes: ClienteAdmin[] }) {
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const conteos = useMemo(() => {
    const c: Record<Filtro, number> = {
      todos: clientes.length,
      activo: 0,
      prueba: 0,
      pausado: 0,
      moroso: 0,
    };
    for (const cli of clientes) c[cli.estado]++;
    return c;
  }, [clientes]);

  const visibles = useMemo(() => {
    const term = normaliza(q.trim());
    return clientes.filter((c) => {
      if (filtro !== "todos" && c.estado !== filtro) return false;
      if (!term) return true;
      return (
        normaliza(c.nombreNegocio).includes(term) ||
        normaliza(c.personaContacto).includes(term) ||
        normaliza(c.correo).includes(term)
      );
    });
  }, [clientes, q, filtro]);

  const hayFiltro = q.trim() !== "" || filtro !== "todos";

  return (
    <div className="flex flex-col gap-3.5">
      {/* Controles */}
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <div className="relative min-w-0 lg:max-w-[360px] lg:flex-1">
          <label htmlFor="buscar-clientes" className="sr-only">
            Buscar clientes
          </label>
          <Icono
            nombre="buscar"
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-faint"
          />
          <input
            id="buscar-clientes"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por negocio, persona o correo…"
            autoComplete="off"
            className={cn(CAMPO, "pl-10")}
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              type="button"
              onClick={() => setFiltro(f.valor)}
              aria-pressed={filtro === f.valor}
              className={claseChip(filtro === f.valor)}
            >
              {f.texto}
              <span className="font-mono text-[10.5px] opacity-70 tabular-nums">{conteos[f.valor]}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11.5px] text-ink-faint" aria-live="polite">
        {hayFiltro
          ? `Mostrando ${visibles.length} de ${clientes.length}`
          : `${clientes.length} ${clientes.length === 1 ? "cliente" : "clientes"}`}
      </p>

      {/* Lista */}
      {visibles.length === 0 ? (
        <Vacio
          icono="buscar"
          titulo="Ningún cliente coincide"
          accion={
            <button
              type="button"
              onClick={() => {
                setQ("");
                setFiltro("todos");
              }}
              className={BTN_SECUNDARIO}
            >
              Quitar filtros
            </button>
          }
        >
          Probá con otro nombre, otro correo o cambiá el estado.
        </Vacio>
      ) : (
        <div className="xl:overflow-hidden xl:rounded-2xl xl:border xl:border-line xl:bg-surface-2">
          {/* Encabezado de la tabla: solo en pantallas anchas */}
          <div
            className={cn(
              "hidden items-center gap-4 border-b border-line bg-surface-3/40 px-5 py-2.5 xl:grid",
              COLUMNAS
            )}
          >
            <Eyebrow>Cliente</Eyebrow>
            <Eyebrow>Plan</Eyebrow>
            <Eyebrow>Autom.</Eyebrow>
            <Eyebrow>En marcha</Eyebrow>
            <Eyebrow>Ingreso</Eyebrow>
            <Eyebrow>Desde</Eyebrow>
            <span className="sr-only">Acciones</span>
          </div>

          <ul className="flex flex-col gap-2.5 xl:gap-0">
            {visibles.map((c) => {
              const falta = faltaDe(c);
              return (
                <li
                  key={c.id}
                  className="rounded-2xl border border-line bg-surface-2 p-4 transition-colors xl:rounded-none xl:border-0 xl:border-b xl:border-line xl:px-5 xl:py-3 xl:last:border-b-0 xl:hover:bg-surface-3/40"
                >
                  <div className={cn("grid gap-x-4 gap-y-3.5 xl:items-center", COLUMNAS)}>
                    {/* Quién es */}
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar nombre={c.nombreNegocio} className="xl:h-9 xl:w-9" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <Link
                            href={`/panel/admin/clientes/${c.id}`}
                            prefetch={false}
                            className="inline-flex min-h-11 min-w-0 items-center text-[14px] font-semibold break-words text-ink transition-colors hover:text-[color:var(--panel-acento-texto)]"
                          >
                            {c.nombreNegocio}
                          </Link>
                          <Pill tono={ESTADO_CLIENTE[c.estado].tono}>{ESTADO_CLIENTE[c.estado].texto}</Pill>
                        </div>
                        <p className="mt-0.5 truncate text-[11.5px] text-ink-faint">
                          {c.personaContacto || "Sin persona de contacto"} · {c.correo}
                        </p>
                      </div>
                    </div>

                    {/* Sus datos: dos columnas en celular, cinco en tablet,
                        y en escritorio ancho cada uno es una columna de la tabla. */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-3 border-t border-line pt-3.5 sm:grid-cols-5 xl:contents xl:border-0 xl:pt-0">
                      <Dato etiqueta="Plan" soloCelular>
                        {c.plan}
                      </Dato>
                      <Dato etiqueta="Automatizaciones" soloCelular>
                        <span className="tabular-nums">{c.automatizaciones}</span>
                      </Dato>
                      <Dato etiqueta="Puesta en marcha" soloCelular>
                        <span
                          title={c.onboarding.completo ? "Puesta en marcha completa" : `Falta: ${falta}`}
                          className={cn("tabular-nums", c.onboarding.completo ? "text-ok" : "text-warn")}
                        >
                          {c.onboarding.completo ? "Lista" : `${c.onboarding.hechos} de ${c.onboarding.total}`}
                        </span>
                        {!c.onboarding.completo && falta ? (
                          <span className="block text-[11px] leading-tight text-ink-faint xl:hidden">
                            Falta: {falta}
                          </span>
                        ) : null}
                      </Dato>
                      <Dato etiqueta="Ingreso" soloCelular>
                        <span className="font-mono tabular-nums">{colones(c.ingresoMensual)}</span>
                      </Dato>
                      <Dato etiqueta="Desde" soloCelular>
                        <span className="text-ink-faint">{c.desde}</span>
                      </Dato>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2 xl:flex-nowrap">
                      <Link
                        href={`/panel/admin/clientes/${c.id}`}
                        prefetch={false}
                        className={BTN_CHICO_PRIMARIO}
                      >
                        Ver ficha
                      </Link>
                      {c.whatsapp ? (
                        <a
                          href={waLinkCliente(
                            c.whatsapp,
                            `Hola ${c.personaContacto || ""}, te escribo de Hoshizora.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Escribirle por WhatsApp"
                          className={cn(BTN_CHICO_SECUNDARIO, "xl:w-9 xl:px-0")}
                        >
                          <Icono nombre="mensajes" className="hidden h-4 w-4 xl:block" />
                          <span className="xl:sr-only">WhatsApp</span>
                        </a>
                      ) : null}
                      <Link
                        href={`/panel/admin/asignar?cliente=${c.id}`}
                        prefetch={false}
                        title="Asignarle una automatización"
                        className={cn(BTN_CHICO_SECUNDARIO, "xl:w-9 xl:px-0")}
                      >
                        <Icono nombre="asignar" className="hidden h-4 w-4 xl:block" />
                        <span className="xl:sr-only">Asignar</span>
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
