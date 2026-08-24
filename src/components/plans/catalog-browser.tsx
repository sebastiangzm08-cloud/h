"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { catalogo, procesos } from "@/lib/content";
import { colones } from "@/config/site";
import { cn } from "@/lib/utils";

const filtros = [{ slug: "todos", nombre: "Todos" }, ...procesos];

export function CatalogBrowser() {
  const [activo, setActivo] = useState("todos");

  const items = useMemo(
    () =>
      activo === "todos"
        ? catalogo
        : catalogo.filter((c) => c.proceso === activo),
    [activo]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {filtros.map((f) => (
          <button
            key={f.slug}
            onClick={() => setActivo(f.slug)}
            className={cn(
              "rounded-full border px-4 py-2 text-[0.8125rem] tracking-tight transition-colors",
              activo === f.slug
                ? "border-ink bg-ink text-paper"
                : "border-line-strong text-ink-soft hover:border-ink"
            )}
          >
            {f.nombre}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <Link
            key={a.id}
            href={`/orden/catalogo-${a.id}`}
            className="group flex flex-col justify-between rounded-2xl border border-line bg-paper p-6 transition-colors hover:border-ink-mute"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.6875rem] tracking-wide text-ink-faint">
                  {a.nivel}
                </span>
                <ArrowUpRight
                  size={16}
                  className="text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>
              <p className="mt-4 text-[1.0625rem] font-medium leading-snug tracking-tight text-ink">
                {a.nombre}
              </p>
              <p className="mt-2.5 text-[0.875rem] leading-relaxed text-ink-mute line-clamp-3">
                {a.descripcion}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-[0.8125rem]">
              <span className="text-ink-faint">{a.plazo}</span>
              <span className="font-medium tnum text-ink">
                {a.precio ? colones(a.precio) : "A cotizar"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
