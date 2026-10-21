"use client";

import { useState, type FormEvent } from "react";
import { Sparkle, WarningCircle, Check } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { precioDe } from "@/config/site";
import type { PlanPublico } from "@/lib/content";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Estado = "idle" | "cargando" | "listo" | "error";
type Encaje = "si" | "parcial" | "no";

/* Hoy lo único que se ofrece es el Agente IA de WhatsApp. El asesor no
   recomienda planes ni automatizaciones distintas: dice cómo ayudaría el
   agente y, si el negocio necesita algo que el agente no hace, lo dice con
   honestidad. */
type Sugerencia = {
  entendido: string;
  encaja: Encaje;
  usos: string[];
  nota: string;
};

const colorEncaje: Record<Encaje, string> = {
  si: "bg-ok",
  parcial: "bg-warn",
  no: "bg-bad",
};

export function AIAdvisor({
  plan,
  idioma = "es",
}: {
  plan: PlanPublico;
  idioma?: Idioma;
}) {
  const t = getCopy(idioma).asesor;
  const tt = getCopy(idioma).plan.tarjeta;
  const hrefDiagnostico = idioma === "en" ? "/en/diagnostic" : `/diagnostico?plan=${plan.id}`;

  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [sugerencia, setSugerencia] = useState<Sugerencia | null>(null);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (descripcion.trim().length < 10) {
      setError(t.errCorto);
      return;
    }

    setError("");
    setEstado("cargando");

    try {
      const res = await fetch("/api/asistente-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion, idioma }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? t.errGeneral);
        setEstado("error");
        return;
      }

      setSugerencia(data);
      setEstado("listo");
    } catch {
      setError(t.errRed);
      setEstado("error");
    }
  };

  return (
    <section
      id={idioma === "en" ? "advisor" : "analizador"}
      className="scroll-mt-28 border-t border-line bg-surface"
    >
      <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8 sm:py-28">
        <p className="eyebrow mb-5">{t.eyebrow}</p>
        <h2 className="text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
          {t.titulo}
        </h2>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-mute">
          {t.sub}
        </p>

        <form onSubmit={onSubmit} className="mt-8">
          <label htmlFor="asesor-descripcion" className="sr-only">
            {t.titulo}
          </label>
          <textarea
            id="asesor-descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder={t.ph}
            className="w-full resize-none rounded-xl border border-line-strong bg-paper px-4 py-3 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink focus-visible:border-ink"
            disabled={estado === "cargando"}
            aria-describedby={error ? "asesor-error" : undefined}
            aria-invalid={!!error}
          />

          {error && (
            <p
              id="asesor-error"
              role="alert"
              className="mt-2 flex items-center gap-1.5 text-[0.8125rem] text-bad"
            >
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
            {estado === "cargando" ? t.cargando : t.boton}
          </Button>
        </form>

        {/* Carga: mismas formas que va a ocupar el resultado real, para que
            se lea como "está pensando" y no como que la página se colgó. */}
        {estado === "cargando" && (
          <div className="mt-8 flex flex-col gap-5" aria-live="polite" aria-busy="true">
            <span className="sr-only">{t.cargandoSr}</span>
            <div className="skeleton h-5 w-4/5 rounded-md" />
            <div className="skeleton h-28 rounded-2xl" />
            <div className="skeleton h-20 rounded-2xl" />
          </div>
        )}

        {estado === "listo" && sugerencia && (
          <div className="mt-8 flex flex-col gap-6" aria-live="polite">
            <p className="text-[0.9375rem] leading-relaxed text-ink-soft">
              {sugerencia.entendido}
            </p>

            <div className="rounded-2xl border border-line bg-paper p-6">
              <p className="flex items-center gap-2 text-[0.8125rem] font-medium text-ink">
                <span
                  aria-hidden="true"
                  className={cn("h-2 w-2 rounded-full", colorEncaje[sugerencia.encaja])}
                />
                {t.encaje[sugerencia.encaja]}
              </p>

              {sugerencia.usos.length > 0 && (
                <>
                  <p className="eyebrow mt-5 mb-3">{t.usosTitulo}</p>
                  <ul className="flex flex-col gap-2.5">
                    {sugerencia.usos.map((u) => (
                      <li
                        key={u}
                        className="flex items-start gap-2.5 text-[0.9375rem] leading-snug text-ink-soft"
                      >
                        <Check
                          size={15}
                          weight="bold"
                          aria-hidden="true"
                          className="mt-1 shrink-0 text-ink-faint"
                        />
                        {u}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {sugerencia.nota && (
                <p className="mt-5 border-t border-line pt-4 text-[0.875rem] leading-relaxed text-ink-mute">
                  {sugerencia.nota}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-acento p-6">
              {sugerencia.encaja !== "no" && (
                <>
                  <p className="eyebrow mb-2 text-acento">{t.planTitulo}</p>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-[1.25rem] font-semibold tracking-tight text-ink">
                      {plan.nombre}
                    </h3>
                    <p className="tnum text-[1.0625rem] font-medium text-ink">
                      {precioDe(plan.moneda, plan.mensual)}
                      <span className="text-[0.8125rem] font-normal text-ink-faint">
                        {" "}
                        {tt.mes}
                      </span>
                    </p>
                  </div>
                </>
              )}
              <Button
                href={hrefDiagnostico}
                variant="primary"
                size="md"
                className={cn("w-full", sugerencia.encaja !== "no" && "mt-5")}
              >
                {t.cta}
              </Button>
            </div>
          </div>
        )}

        <p className="mt-6 text-[0.75rem] text-ink-faint">{t.aviso}</p>
      </div>
    </section>
  );
}
