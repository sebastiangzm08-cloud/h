"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Sparkle, WarningCircle, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { catalogo, planes, planPorNivel } from "@/lib/content";
import { colones } from "@/config/site";

type Estado = "idle" | "cargando" | "listo" | "error";

type Sugerencia = {
  entendido: string;
  automatizacionIds: string[];
  planId: string;
  porQuePlan: string;
};

export function AIAdvisor() {
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [sugerencia, setSugerencia] = useState<Sugerencia | null>(null);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (descripcion.trim().length < 10) {
      setError("Contanos un poco más sobre tu negocio, al menos una frase.");
      return;
    }

    setError("");
    setEstado("cargando");

    try {
      const res = await fetch("/api/asistente-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Algo salió mal, probá de nuevo.");
        setEstado("error");
        return;
      }

      setSugerencia(data);
      setEstado("listo");
    } catch {
      setError("No se pudo conectar con el asistente. Probá de nuevo.");
      setEstado("error");
    }
  };

  const plan = sugerencia
    ? planes.find((p) => p.id === sugerencia.planId)
    : undefined;
  const automatizaciones = sugerencia
    ? sugerencia.automatizacionIds
        .map((id) => catalogo.find((a) => a.id === id))
        .filter((a) => a !== undefined)
    : [];

  return (
    <section id="analizador" className="scroll-mt-28 border-t border-line bg-surface">
      <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8 sm:py-28">
        <p className="eyebrow mb-5">O contanoslo con tus palabras</p>
        <h2 className="text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
          Describí tu negocio y te sugerimos qué automatizar
        </h2>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-mute">
          Un párrafo alcanza. Cuanto más contés sobre cómo trabajás hoy,
          mejor la sugerencia.
        </p>

        <form onSubmit={onSubmit} className="mt-8">
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Ej: Tengo una clínica dental. Agendamos citas por WhatsApp a mano y llevamos el control de pacientes en Excel..."
            className="w-full resize-none rounded-xl border border-line-strong bg-paper px-4 py-3 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink"
            disabled={estado === "cargando"}
          />

          {error && (
            <p className="mt-2 flex items-center gap-1.5 text-[0.8125rem] text-bad">
              <WarningCircle size={14} />
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={estado === "cargando"}
            className="mt-5"
          >
            <Sparkle size={16} weight="fill" />
            {estado === "cargando" ? "Analizando…" : "Generar sugerencias"}
          </Button>
        </form>

        {/* Carga: mismas formas que va a ocupar el resultado real, para que
            se lea como "está pensando" y no como que la página se colgó. */}
        {estado === "cargando" && (
          <div className="mt-8 flex flex-col gap-5" aria-live="polite" aria-busy="true">
            <span className="sr-only">Generando tu recomendación…</span>
            <div className="skeleton h-5 w-4/5 rounded-md" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="skeleton h-24 rounded-2xl" />
              <div className="skeleton h-24 rounded-2xl" />
            </div>
            <div className="skeleton h-28 rounded-2xl" />
          </div>
        )}

        {estado === "listo" && sugerencia && (
          <div className="mt-8 flex flex-col gap-6">
            <p className="text-[0.9375rem] leading-relaxed text-ink-soft">
              {sugerencia.entendido}
            </p>

            {automatizaciones.length > 0 && (
              <div>
                <p className="eyebrow mb-3">Para empezar, esto te sirve</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {automatizaciones.map((a) => (
                    <Link
                      key={a.id}
                      href={`/procesos/${a.proceso}`}
                      className="group flex flex-col justify-between rounded-2xl border border-line bg-paper p-5 transition-colors hover:border-ink-mute"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[0.9375rem] font-medium leading-snug tracking-tight text-ink">
                          {a.nombre}
                        </p>
                        <ArrowUpRight
                          size={15}
                          className="mt-0.5 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </div>
                      <p className="mt-3 text-[0.8125rem] text-ink-faint">
                        Incluida en el plan {planPorNivel[a.nivel]}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {plan && (
              <div className="rounded-2xl border border-acento/30 bg-acento/[0.06] p-6">
                <p className="eyebrow mb-2 text-acento">Plan recomendado</p>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-[1.25rem] font-semibold tracking-tight text-ink">
                    {plan.nombre}
                  </h3>
                  <p className="tnum text-[1.0625rem] font-medium text-ink">
                    {colones(plan.mensual)}
                    <span className="text-[0.8125rem] font-normal text-ink-faint">
                      {" "}
                      / mes
                    </span>
                  </p>
                </div>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-mute">
                  {sugerencia.porQuePlan}
                </p>
                <Button
                  href={`/diagnostico?plan=${plan.id}`}
                  variant="primary"
                  size="md"
                  className="mt-5 w-full"
                >
                  Agenda tu diagnóstico
                </Button>
              </div>
            )}
          </div>
        )}

        <p className="mt-6 text-[0.75rem] text-ink-faint">
          Generado automáticamente a partir de tu descripción. No sustituye
          el diagnóstico gratuito, que confirma precios y plazos exactos.
        </p>
      </div>
    </section>
  );
}
