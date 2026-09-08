"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, ArrowUpRight, CaretDown } from "@phosphor-icons/react/dist/ssr";
import { procesos, catalogo, planPorNivel, type ProcesoSlug } from "@/lib/content";
import { FlowStrip } from "@/components/home/flow-strip";
import { CatalogLink } from "@/components/catalog-link";
import { cn } from "@/lib/utils";

/* Coreografía del panel: el contenido no entra de golpe, entra en orden. */
const contenedor: Variants = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};

const pieza: Variants = {
  oculto: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 26 },
  },
};

type Proceso = (typeof procesos)[number];

/**
 * El contenido de un proceso. Se monta dos veces: dentro del acordeón en
 * móvil y en la columna derecha en escritorio. Por eso recibe `sufijo`,
 * que separa los layoutId de las dos instancias — si no, framer-motion
 * intenta animar entre ellas y el resplandor salta de una a otra.
 */
function PanelProceso({
  proceso,
  sufijo,
  conNumeroFantasma = true,
}: {
  proceso: Proceso;
  sufijo: string;
  conNumeroFantasma?: boolean;
}) {
  const automatizaciones = catalogo.filter((c) => c.proceso === proceso.slug);
  const destacada = automatizaciones[0];
  const flujo = destacada?.flujo ?? [];

  return (
    <>
      {conNumeroFantasma && (
        <motion.span
          key={`n-${proceso.slug}`}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          aria-hidden="true"
          className="pointer-events-none absolute -top-6 right-2 font-mono text-[7rem] leading-none font-semibold text-ink/[0.04] select-none sm:text-[9rem]"
        >
          {proceso.n}
        </motion.span>
      )}

      <motion.div
        key={proceso.slug}
        variants={contenedor}
        initial="oculto"
        animate="visible"
        className="relative"
      >
        <motion.h3
          variants={pieza}
          className="max-w-[24ch] text-[1.25rem] leading-[1.15] font-semibold tracking-tight text-ink sm:text-[1.5rem] lg:text-[1.875rem]"
        >
          {proceso.titular}
        </motion.h3>

        <motion.p
          variants={pieza}
          className="mt-4 max-w-[58ch] text-[0.9375rem] leading-relaxed text-ink-mute"
        >
          {proceso.resumen}
        </motion.p>

        {flujo.length > 1 && (
          <motion.div variants={pieza} className="mt-8">
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <p className="eyebrow">Así queda el flujo</p>
              <p className="text-[0.75rem] text-ink-faint">Tocá cada paso</p>
            </div>
            <FlowStrip
              key={proceso.slug}
              pasos={flujo}
              detalles={destacada?.detalles}
              sufijoLayout={sufijo}
            />
          </motion.div>
        )}

        <motion.p variants={pieza} className="eyebrow mt-8 mb-4">
          {automatizaciones.length} automatizaciones listas para este proceso
        </motion.p>

        <ul className="flex flex-col divide-y divide-line border-t border-line">
          {automatizaciones.map((a) => (
            <motion.li key={a.id} variants={pieza}>
              <CatalogLink
                automatizacion={a}
                className="group flex items-center justify-between gap-4 py-3.5"
              >
                <span className="text-[0.9375rem] leading-snug text-ink-soft transition-colors group-hover:text-ink">
                  {a.nombre}
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-[0.8125rem] text-ink-faint sm:block">
                    {a.disponible ? a.plazo : "Contratar"}
                  </span>
                  <span className="text-[0.8125rem] font-medium text-ink">
                    Incluido en {planPorNivel[a.nivel]}
                  </span>
                  <ArrowUpRight
                    size={14}
                    weight="bold"
                    className="-translate-x-1 text-ink-faint opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </span>
              </CatalogLink>
            </motion.li>
          ))}
        </ul>

        <motion.div variants={pieza}>
          <Link
            href={`/procesos/${proceso.slug}`}
            className="group mt-8 inline-flex items-center gap-1.5 text-[0.9375rem] text-ink-soft transition-colors hover:text-ink"
          >
            Ver el proceso completo
            <ArrowUpRight
              size={15}
              weight="bold"
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </motion.div>
      </motion.div>
    </>
  );
}

export function ProcessesExplorer() {
  const [activo, setActivo] = useState<ProcesoSlug>(procesos[0].slug);
  const proceso = procesos.find((p) => p.slug === activo)!;

  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        >
          <p className="eyebrow mb-5">Qué automatizamos</p>
          <h2 className="max-w-[26ch] text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
            Seis procesos que existen en cualquier negocio
          </h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Lista. En móvil es un acordeón: el panel se abre acá mismo. */}
          <div className="lg:col-span-4">
            <ul className="flex flex-col border-t border-line">
              {procesos.map((p) => {
                const esActivo = p.slug === activo;
                return (
                  <li key={p.slug} className="relative">
                    <button
                      onMouseEnter={() => setActivo(p.slug)}
                      onFocus={() => setActivo(p.slug)}
                      onClick={() => setActivo(p.slug)}
                      aria-pressed={esActivo}
                      aria-expanded={esActivo}
                      className="group relative flex w-full items-center gap-4 border-b border-line py-4 text-left"
                    >
                      {esActivo && (
                        <>
                          <motion.span
                            layoutId="proceso-barra"
                            className="absolute top-0 -bottom-px -left-px w-[2px] bg-gradient-to-b from-acento-claro to-acento shadow-[0_0_12px_var(--color-acento)]"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 34,
                            }}
                          />
                          <motion.span
                            layoutId="proceso-fondo"
                            className="absolute inset-y-0 -inset-x-4 -z-10 rounded-lg bg-surface"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 34,
                            }}
                          />
                        </>
                      )}

                      <span
                        className={cn(
                          "font-mono text-[0.75rem] transition-colors duration-200",
                          esActivo ? "text-ink" : "text-ink-faint"
                        )}
                      >
                        {p.n}
                      </span>
                      <span
                        className={cn(
                          "flex-1 text-[1.0625rem] tracking-tight transition-colors duration-200",
                          esActivo
                            ? "font-medium text-ink"
                            : "text-ink-mute group-hover:text-ink"
                        )}
                      >
                        {p.nombre}
                      </span>

                      {/* En móvil una flecha que gira; en escritorio la que avanza */}
                      <CaretDown
                        size={15}
                        weight="bold"
                        className={cn(
                          "shrink-0 transition-transform duration-300 lg:hidden",
                          esActivo
                            ? "rotate-180 text-acento"
                            : "text-ink-faint"
                        )}
                      />
                      <ArrowRight
                        size={15}
                        weight="bold"
                        className={cn(
                          "hidden shrink-0 transition-all duration-300 lg:block",
                          esActivo
                            ? "translate-x-0 text-ink opacity-100"
                            : "-translate-x-2 text-ink-faint opacity-0"
                        )}
                      />
                    </button>

                    {/* Acordeón: solo móvil, justo debajo del que tocaste */}
                    {esActivo && (
                      <div className="relative overflow-hidden border-b border-line bg-surface px-5 py-7 lg:hidden">
                        <PanelProceso
                          proceso={p}
                          sufijo="movil"
                          conNumeroFantasma={false}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Panel de escritorio */}
          <div className="hidden lg:col-span-8 lg:block">
            <div className="relative min-h-[480px] overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface to-surface-2 p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-24px_rgba(0,0,0,0.18)] sm:p-9">
              <p className="eyebrow mb-4">Proceso {proceso.n}</p>
              <PanelProceso proceso={proceso} sufijo="escritorio" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
