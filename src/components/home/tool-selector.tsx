"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { herramientas, catalogo, type ToolId } from "@/lib/content";
import { colones } from "@/config/site";
import { Button } from "@/components/ui/button";

export function ToolSelector() {
  const [selected, setSelected] = useState<Set<ToolId>>(new Set());

  const toggle = (id: ToolId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const resultados = useMemo(() => {
    if (selected.size === 0) return [];
    return catalogo
      .filter((a) => a.requiere.some((r) => selected.has(r)))
      .map((a) => {
        const coincidencias = a.requiere.filter((r) => selected.has(r)).length;
        return { a, score: coincidencias / a.requiere.length };
      })
      .sort((x, y) => y.score - x.score)
      .slice(0, 4);
  }, [selected]);

  const grupos = useMemo(() => {
    const map = new Map<string, typeof herramientas>();
    for (const h of herramientas) {
      const arr = map.get(h.grupo) ?? [];
      arr.push(h);
      map.set(h.grupo, arr);
    }
    return [...map.entries()];
  }, []);

  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-5">Compruébalo vos mismo</p>
          <h2 className="text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
            Decinos qué herramientas usás hoy
          </h2>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-mute">
            Marcá lo que ya tenés en tu negocio y te mostramos qué se puede
            automatizar con eso, sin cambiar nada.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex flex-col gap-7">
              {grupos.map(([grupo, items]) => (
                <div key={grupo}>
                  <p className="eyebrow mb-3">{grupo}</p>
                  <div className="flex flex-wrap gap-2.5">
                    {items.map((h) => {
                      const active = selected.has(h.id);
                      return (
                        <button
                          key={h.id}
                          onClick={() => toggle(h.id)}
                          aria-pressed={active}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[0.875rem] tracking-tight transition-all duration-150 active:scale-[0.97] ${
                            active
                              ? "border-ink bg-ink text-paper"
                              : "border-line-strong bg-paper text-ink-soft hover:border-ink"
                          }`}
                        >
                          {active && <Check size={14} weight="bold" />}
                          {h.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-2xl border border-line bg-surface p-7">
              <p className="eyebrow mb-5">
                {selected.size === 0
                  ? "Resultado"
                  : `${resultados.length} automatizaciones posibles`}
              </p>

              {selected.size === 0 ? (
                <div className="flex flex-col items-start gap-3 py-8">
                  <p className="text-[0.9375rem] leading-relaxed text-ink-mute">
                    Elegí al menos una herramienta de la izquierda para ver
                    ejemplos concretos aplicados a tu combinación.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-line">
                  {resultados.map(({ a }) => (
                    <div key={a.id} className="py-4 first:pt-0 last:pb-0">
                      <p className="text-[0.9375rem] font-medium leading-snug tracking-tight text-ink">
                        {a.nombre}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-[0.8125rem] text-ink-faint">
                        <span>{a.plazo}</span>
                        <span className="h-1 w-1 rounded-full bg-line-strong" />
                        <span className="tnum">
                          {a.precio ? `desde ${colones(a.precio)}` : "a cotizar"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 border-t border-line pt-6">
                <Button href="/planes" variant="primary" size="md" className="w-full">
                  Ver catálogo completo
                  <ArrowRight size={15} weight="bold" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[0.8125rem] text-ink-faint">
          ¿No ves tu herramienta en la lista?{" "}
          <Link href="/contacto" className="text-ink-soft underline underline-offset-4">
            Escribinos, probablemente igual se pueda
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
