"use client";

import { useState, type FormEvent } from "react";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { waLink } from "@/config/site";

/* Los rubros salen de la investigación de negocios reales
   (ver NEGOCIOS-Y-AUTOMATIZACIONES.md en la raíz del repo). Es un
   `datalist`, no un `select`: sugiere sin encerrar, así que quien no
   se ve en la lista igual escribe lo suyo y no abandona el formulario. */
const rubros = [
  "Taller mecánico",
  "Clínica dental o consultorio",
  "Salón de belleza o barbería",
  "Restaurante o soda",
  "Tienda en línea",
  "Distribuidora o mayorista",
  "Contabilidad",
  "Veterinaria",
  "Gimnasio o estudio",
  "Panadería o repostería",
  "Inmobiliaria",
  "Ferretería o repuestos",
  "Hotel, cabinas o alquiler",
  "Farmacia",
  "Academia o escuela",
  "Bufete de abogados",
  "Préstamos o financiera",
  "Varias sucursales",
];

type Errors = Partial<Record<"nombre" | "negocio" | "dolor", string>>;

const campo =
  "h-12 rounded-lg border border-line-strong bg-paper px-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink";
const etiqueta = "text-[0.8125rem] font-medium text-ink-soft";

export function DiagnosticoForm({ plan }: { plan?: string }) {
  const [values, setValues] = useState({ nombre: "", negocio: "", dolor: "" });
  const [errors, setErrors] = useState<Errors>({});

  const set =
    (k: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [k]: e.target.value }));

  /* Se le quita la puntuación final a lo que escribe la persona para no
     terminar con ".." ni con dos frases pegadas sin punto en el medio. */
  const dolor = values.dolor.trim().replace(/[.,;\s]+$/, "");

  const mensaje = [
    `Hola, soy ${values.nombre.trim() || "…"}.`,
    `Tengo ${values.negocio.trim() || "…"}.`,
    `Lo que más tiempo me quita hoy: ${dolor || "…"}.`,
    plan
      ? `Me interesa el plan ${plan} y quiero el diagnóstico gratuito.`
      : "Quiero agendar el diagnóstico gratuito.",
  ].join(" ");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (values.nombre.trim().length < 2) next.nombre = "Falta tu nombre.";
    if (values.negocio.trim().length < 3) next.negocio = "¿A qué se dedica tu negocio?";
    if (values.dolor.trim().length < 10)
      next.dolor = "Contanos un poco más, con una línea basta.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    window.open(waLink(mensaje), "_blank", "noopener,noreferrer");
  };

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-7 sm:p-8"
    >
      <div>
        <p className="text-[1.0625rem] font-medium tracking-tight text-ink">
          Contanos de tu negocio
        </p>
        <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-mute">
          Tres datos y seguimos por WhatsApp. Así llegamos a la llamada
          sabiendo de qué hablar.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="dx-nombre" className={etiqueta}>
          Tu nombre
        </label>
        <input
          id="dx-nombre"
          value={values.nombre}
          onChange={set("nombre")}
          placeholder="Como te gusta que te llamen"
          className={campo}
          aria-invalid={!!errors.nombre}
        />
        {errors.nombre && (
          <p className="text-[0.8125rem] text-bad">{errors.nombre}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="dx-negocio" className={etiqueta}>
          A qué se dedica
        </label>
        <input
          id="dx-negocio"
          list="dx-rubros"
          value={values.negocio}
          onChange={set("negocio")}
          placeholder="Escribilo o elegí de la lista"
          className={campo}
          aria-invalid={!!errors.negocio}
          autoComplete="off"
        />
        <datalist id="dx-rubros">
          {rubros.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
        {errors.negocio && (
          <p className="text-[0.8125rem] text-bad">{errors.negocio}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="dx-dolor" className={etiqueta}>
          Qué te quita más tiempo
        </label>
        <textarea
          id="dx-dolor"
          value={values.dolor}
          onChange={set("dolor")}
          rows={4}
          placeholder="Ej: se me pasan los cobros y llevo todo en un cuaderno"
          className="resize-none rounded-lg border border-line-strong bg-paper px-4 py-3 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink"
          aria-invalid={!!errors.dolor}
        />
        {errors.dolor && (
          <p className="text-[0.8125rem] text-bad">{errors.dolor}</p>
        )}
      </div>

      {/* Se ve exactamente lo que se va a enviar: nadie manda un mensaje
          a ciegas desde un formulario ajeno. */}
      <div className="rounded-lg border border-line bg-paper p-4">
        <p className="eyebrow mb-2">Se abre WhatsApp con esto</p>
        <p className="text-[0.8125rem] leading-relaxed text-ink-mute">
          {mensaje}
        </p>
      </div>

      <Button type="submit" variant="primary" size="lg">
        <WhatsappLogo size={18} weight="fill" />
        Abrir WhatsApp
      </Button>
    </form>
  );
}
