/* ==========================================================================
   Automatizaciones del cliente — Fase 2 del rediseño (2026-09-27).

   Una fila por automatización contratada: qué es, cómo va ESTE MES (dos
   cifras reales) y su estado. El Agente de WhatsApp lleva interruptor de
   verdad (el workflow respeta la pausa); las demás muestran su estado,
   porque todavía no tienen pausa propia que el cliente pueda usar.
   "+ Nueva automatización" va al catálogo real: nunca se muestran
   automatizaciones que no existen.
   ========================================================================== */
import Link from "next/link";
import {
  TarjetaCatalogo,
  destinoAutomatizacion,
  iconoAutomatizacion,
} from "@/components/panel/tarjeta-automatizacion";
import { Icono } from "@/components/panel/iconos";
import { InterruptorAgente } from "@/components/panel/interruptor-agente";
import { Eyebrow, PageHead, Pill } from "@/components/panel/ui";
import { getAsignaciones, getCatalogoDisponible, getCliente } from "@/lib/panel/datos";
import { getCifrasAutomatizaciones } from "@/lib/panel/automatizaciones-cifras";

const numero = (n: number) => n.toLocaleString("es-CR");

export default async function AutomatizacionesPage() {
  const [asignaciones, disponibles, cliente] = await Promise.all([
    getAsignaciones(),
    getCatalogoDisponible(),
    getCliente(),
  ]);
  const cifras = await getCifrasAutomatizaciones(asignaciones);
  const suspendido = cliente.estado === "pausado" || cliente.estado === "moroso";

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHead
          titulo="Automatizaciones"
          descripcion="Lo que trabaja por tu negocio y cómo va este mes."
        />
        <Link
          href="/panel/catalogo"
          className="inline-flex h-10 flex-none items-center gap-2 rounded-full bg-[var(--panel-acento,#7c5cff)] px-4 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nueva automatización
        </Link>
      </div>

      <section aria-label="Automatizaciones contratadas">
        {asignaciones.length > 0 ? (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-surface-2">
            {asignaciones.map((a) => {
              const aut = a.automatizacion;
              const esAgente = aut.slug === "agente-whatsapp";
              const suyas = cifras[a.id] ?? [];
              return (
                <li
                  key={a.id}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3.5 gap-y-3 px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:px-5"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-3 text-ink-soft shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                    <Icono nombre={iconoAutomatizacion(aut.slug)} className="h-[18px] w-[18px]" />
                  </span>

                  <Link href={destinoAutomatizacion(aut.slug)} className="group min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[14px] font-semibold text-ink group-hover:underline group-hover:underline-offset-2">
                        {aut.nombre}
                      </span>
                      <Icono nombre="flecha" className="h-3 w-3 flex-none text-ink-faint" />
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-snug text-ink-faint">
                      {aut.descripcion}
                    </span>
                  </Link>

                  {/* Cifras del mes: debajo en celular, en su columna en pantallas anchas */}
                  <dl className="col-span-3 flex gap-6 pl-[54px] sm:col-span-1 sm:pl-0">
                    {suyas.map((c) => (
                      <div key={c.etiqueta} className="min-w-[64px]">
                        <dt className="sr-only">{c.etiqueta} este mes</dt>
                        <dd className="font-mono text-[17px] font-semibold text-ink tabular-nums">{numero(c.valor)}</dd>
                        <dd className="text-[11px] text-ink-faint">{c.etiqueta}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="col-start-3 row-start-1 flex justify-end sm:col-start-4">
                    {esAgente ? (
                      <InterruptorAgente activo={a.estado === "activa"} suspendido={suspendido} />
                    ) : (
                      <Pill tono={a.estado === "activa" ? "ok" : "idle"}>
                        {a.estado === "activa" ? "Activa" : "En pausa"}
                      </Pill>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-line-strong bg-white/[0.03] px-5 py-8 text-center text-[13px] text-ink-faint">
            Todavía no tenés ninguna.{" "}
            <Link href="/panel/catalogo" className="text-ink-mute underline underline-offset-2 hover:text-ink">
              Mirá el catálogo
            </Link>
            .
          </p>
        )}
        {asignaciones.length > 0 ? (
          <p className="mt-2 text-[11.5px] text-ink-faint">Cifras del mes en curso.</p>
        ) : null}
      </section>

      {disponibles.length > 0 ? (
        <section>
          <div className="mb-3">
            <Eyebrow>Para sumar</Eyebrow>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {disponibles.map((a) => (
              <TarjetaCatalogo
                key={a.id}
                automatizacion={a}
                href={`/panel/automatizaciones/${a.slug}`}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
