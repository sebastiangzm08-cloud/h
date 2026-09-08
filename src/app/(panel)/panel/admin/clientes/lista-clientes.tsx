"use client";

/* ==========================================================================
   La lista de clientes con búsqueda y filtro por estado. El fetch lo hace
   la página (servidor); acá solo se filtra en el navegador — son pocas
   filas y así el filtrado es instantáneo, sin ir y volver al servidor.
   ========================================================================== */
import { useMemo, useState } from "react";
import Link from "next/link";
import { Caja, Eyebrow, Pill, colones } from "@/components/panel/ui";
import { Icono } from "@/components/panel/iconos";
import type { ClienteAdmin } from "@/lib/panel/admin";
import { waLink } from "@/config/site";
import { cn } from "@/lib/utils";

const ESTADO: Record<
  ClienteAdmin["estado"],
  { texto: string; tono: "ok" | "warn" | "bad" | "idle" }
> = {
  activo: { texto: "Activo", tono: "ok" },
  prueba: { texto: "En prueba", tono: "warn" },
  pausado: { texto: "Pausado", tono: "idle" },
  moroso: { texto: "Moroso", tono: "bad" },
};

type Filtro = "todos" | ClienteAdmin["estado"];

/** Sin acentos y en minúscula, para comparar sin que "José" falle con "jose". */
function normaliza(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
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

  const FILTROS: { valor: Filtro; texto: string }[] = [
    { valor: "todos", texto: "Todos" },
    { valor: "activo", texto: "Activos" },
    { valor: "prueba", texto: "En prueba" },
    { valor: "pausado", texto: "Pausados" },
    { valor: "moroso", texto: "Morosos" },
  ];

  return (
    <div className="flex flex-col gap-3.5">
      {/* Controles */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <Icono
            nombre="buscar"
            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por negocio, persona o correo…"
            className="h-10 w-full rounded-xl border border-line bg-surface-2 pr-3 pl-9 text-[13px] text-ink placeholder:text-ink-faint transition-colors focus:border-line-strong focus:bg-surface-3 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              onClick={() => setFiltro(f.valor)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] transition-colors",
                filtro === f.valor
                  ? "border-line-strong bg-surface-3 text-ink"
                  : "border-line text-ink-mute hover:bg-surface-2 hover:text-ink-soft"
              )}
            >
              {f.texto}
              <span className="font-mono text-[10px] text-ink-faint tabular-nums">
                {conteos[f.valor]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {visibles.length === 0 ? (
        <Caja className="text-center">
          <p className="py-8 text-[13px] text-ink-faint">
            Ningún cliente coincide con lo que buscás.
          </p>
        </Caja>
      ) : (
        <div className="flex flex-col gap-2.5">
          {visibles.map((c) => (
            <Caja
              key={c.id}
              className="flex flex-wrap items-center gap-x-5 gap-y-2"
            >
              <div className="min-w-[180px] flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/panel/admin/clientes/${c.id}`}
                    className="text-[14px] font-semibold text-ink transition-colors hover:text-ink-mute"
                  >
                    {c.nombreNegocio}
                  </Link>
                  <Pill tono={ESTADO[c.estado].tono}>
                    {ESTADO[c.estado].texto}
                  </Pill>
                </div>
                <p className="mt-0.5 text-[11.5px] text-ink-faint">
                  {c.personaContacto || "—"} · {c.correo}
                </p>
              </div>

              <div className="flex items-center gap-5 text-[12px]">
                <div>
                  <Eyebrow>Plan</Eyebrow>
                  <span className="mt-0.5 block text-ink-soft">{c.plan}</span>
                </div>
                <div>
                  <Eyebrow>Autom.</Eyebrow>
                  <span className="mt-0.5 block text-ink-soft tabular-nums">
                    {c.automatizaciones}
                  </span>
                </div>
                <div
                  title={
                    c.onboarding.completo
                      ? "Puesta en marcha completa"
                      : `Falta: ${[
                          !c.onboarding.perfil && "perfil",
                          c.onboarding.total > 1 &&
                            !c.onboarding.buffer &&
                            "Buffer",
                          c.onboarding.total > 1 &&
                            !c.onboarding.contenido &&
                            "subir contenido",
                        ]
                          .filter(Boolean)
                          .join(", ")}`
                  }
                >
                  <Eyebrow>Puesta en marcha</Eyebrow>
                  <span
                    className={cn(
                      "mt-0.5 block tabular-nums",
                      c.onboarding.completo ? "text-ok" : "text-warn"
                    )}
                  >
                    {c.onboarding.completo
                      ? "Lista"
                      : `${c.onboarding.hechos}/${c.onboarding.total}`}
                  </span>
                </div>
                <div>
                  <Eyebrow>Ingreso</Eyebrow>
                  <span className="mt-0.5 block font-mono text-ink-soft">
                    {colones(c.ingresoMensual)}
                  </span>
                </div>
                <div>
                  <Eyebrow>Desde</Eyebrow>
                  <span className="mt-0.5 block text-ink-faint">{c.desde}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {c.whatsapp ? (
                  <a
                    href={waLink(
                      `Hola ${c.personaContacto || ""}, te escribo de Hoshizora.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center rounded-full border border-line-strong px-3.5 text-[12px] text-ink-mute transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    WhatsApp
                  </a>
                ) : null}
                <Link
                  href={`/panel/admin/clientes/${c.id}`}
                  className="inline-flex h-9 items-center rounded-full bg-ink px-3.5 text-[12px] font-medium text-paper transition-colors hover:bg-ink-soft"
                >
                  Ver ficha
                </Link>
                <Link
                  href={`/panel/admin/asignar?cliente=${c.id}`}
                  className="inline-flex h-9 items-center rounded-full border border-line-strong px-3.5 text-[12px] text-ink transition-colors hover:bg-surface-2"
                >
                  Asignar
                </Link>
              </div>
            </Caja>
          ))}
        </div>
      )}
    </div>
  );
}
