"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  WhatsappLogo,
  EnvelopeSimple,
  CalendarBlank,
  Table,
  CloudArrowUp,
  Cube,
  AddressBook,
  Megaphone,
  Storefront,
  Receipt,
  Bank,
  CheckSquare,
  ShareNetwork,
  Lightning,
  InstagramLogo,
} from "@phosphor-icons/react/dist/ssr";
import { herramientas, catalogo, planPorNivel, type ToolId } from "@/lib/content";
import { Button } from "@/components/ui/button";

const iconos: Record<ToolId, typeof WhatsappLogo> = {
  whatsapp: WhatsappLogo,
  correo: EnvelopeSimple,
  calendario: CalendarBlank,
  sheets: Table,
  drive: CloudArrowUp,
  erp: Cube,
  crm: AddressBook,
  ads: Megaphone,
  tienda: Storefront,
  factura: Receipt,
  banco: Bank,
  tareas: CheckSquare,
  redes: InstagramLogo,
};

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


        {/* Resumen compacto: solo en móvil. Va fuera de la grilla para que
            pueda quedarse pegado mientras se recorren las herramientas. */}
        <div className="sticky top-[4.25rem] z-30 mt-8 -mx-5 border-y border-line bg-surface/95 px-5 py-3 backdrop-blur-md lg:hidden">
          {selected.size === 0 ? (
            <p className="text-[0.8125rem] text-ink-mute">
              Marcá tus herramientas y el resultado aparece acá.
            </p>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <p className="text-[0.875rem] font-medium tracking-tight text-ink">
                {resultados.length} automatizaciones posibles
              </p>
              <span className="shrink-0 tnum text-[0.8125rem] text-ink-mute">
                {selected.size} {selected.size === 1 ? "herramienta" : "herramientas"}
              </span>
            </div>
          )}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="flex flex-col gap-7">
              {grupos.map(([grupo, items]) => (
                <div key={grupo}>
                  <p className="eyebrow mb-3">{grupo}</p>
                  <div className="flex flex-wrap gap-2.5">
                    {items.map((h) => {
                      const active = selected.has(h.id);
                      const Icon = iconos[h.id];
                      return (
                        <button
                          key={h.id}
                          onClick={() => toggle(h.id)}
                          aria-pressed={active}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[0.875rem] tracking-tight transition-all duration-150 active:scale-[0.97] ${
                            active
                              ? "border-ink bg-ink text-paper"
                              : "border-line-strong bg-paper text-ink-soft hover:border-ink"
                          }`}
                        >
                          {active ? (
                            <Check size={14} weight="bold" />
                          ) : (
                            <Icon size={15} className="text-ink-faint" />
                          )}
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
            <div className="rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-24 lg:p-7">
              <p className="eyebrow mb-5">
                {selected.size === 0
                  ? "Resultado"
                  : `${resultados.length} automatizaciones posibles`}
              </p>

              {selected.size === 0 ? (
                <div className="flex flex-col items-start gap-4 py-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-line-strong bg-paper text-ink-faint">
                    <ShareNetwork size={22} />
                  </div>
                  <p className="text-[0.9375rem] leading-relaxed text-ink-mute">
                    Elegí al menos una herramienta de la izquierda para ver
                    ejemplos concretos aplicados a tu combinación.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-line">
                  {resultados.map(({ a }) => (
                    <div key={a.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line-strong bg-paper text-ink-faint">
                        <Lightning size={15} weight="fill" />
                      </div>
                      <div>
                        <p className="text-[0.9375rem] font-medium leading-snug tracking-tight text-ink">
                          {a.nombre}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-[0.8125rem] text-ink-faint">
                          <span>{a.disponible ? a.plazo : "Contratar"}</span>
                          <span className="h-1 w-1 rounded-full bg-line-strong" />
                          <span>Incluido en {planPorNivel[a.nivel]}</span>
                        </div>
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
