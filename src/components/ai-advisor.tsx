"use client";

import { useState, type FormEvent } from "react";
import { Sparkle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

type Estado = "idle" | "cargando" | "listo" | "error";

export function AIAdvisor() {
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [respuesta, setRespuesta] = useState("");
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

      setRespuesta(data.texto);
      setEstado("listo");
    } catch {
      setError("No se pudo conectar con el asistente. Probá de nuevo.");
      setEstado("error");
    }
  };

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
            {estado === "cargando" ? "Pensando…" : "Generar sugerencias"}
          </Button>
        </form>

        {estado === "listo" && (
          <div className="mt-8 whitespace-pre-line rounded-2xl border border-line bg-paper p-6 text-[0.9375rem] leading-relaxed text-ink-soft">
            {respuesta}
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
