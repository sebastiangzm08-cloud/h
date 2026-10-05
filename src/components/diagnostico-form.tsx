"use client";

import { useState, type FormEvent } from "react";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { waLink } from "@/config/site";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";

type Errors = Partial<Record<"nombre" | "negocio" | "dolor", string>>;

/* Es un `datalist`, no un `select`: sugiere sin encerrar, así que quien no
   se ve en la lista igual escribe lo suyo y no abandona el formulario. */
const campo =
  "h-12 rounded-lg border border-line-strong bg-paper px-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink focus-visible:border-ink aria-[invalid=true]:border-bad";
const etiqueta = "text-[0.8125rem] font-medium text-ink-soft";

export function DiagnosticoForm({
  plan,
  idioma = "es",
}: {
  plan?: string;
  idioma?: Idioma;
}) {
  const t = getCopy(idioma).diagnostico.form;
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
    t.wa.saludo(values.nombre.trim() || "…"),
    t.wa.tengo(values.negocio.trim() || "…"),
    t.wa.dolor(dolor || "…"),
    plan ? t.wa.conPlan(plan) : t.wa.sinPlan,
  ].join(" ");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (values.nombre.trim().length < 2) next.nombre = t.errNombre;
    if (values.negocio.trim().length < 3) next.negocio = t.errNegocio;
    if (values.dolor.trim().length < 10) next.dolor = t.errDolor;
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
          {t.titulo}
        </p>
        <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-mute">
          {t.sub}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="dx-nombre" className={etiqueta}>
          {t.nombre}
        </label>
        <input
          id="dx-nombre"
          value={values.nombre}
          onChange={set("nombre")}
          placeholder={t.nombrePh}
          className={campo}
          autoComplete="name"
          aria-invalid={!!errors.nombre}
          aria-describedby={errors.nombre ? "dx-nombre-error" : undefined}
        />
        {errors.nombre && (
          <p id="dx-nombre-error" role="alert" className="text-[0.8125rem] text-bad">
            {errors.nombre}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="dx-negocio" className={etiqueta}>
          {t.negocio}
        </label>
        <input
          id="dx-negocio"
          list="dx-rubros"
          value={values.negocio}
          onChange={set("negocio")}
          placeholder={t.negocioPh}
          className={campo}
          aria-invalid={!!errors.negocio}
          aria-describedby={errors.negocio ? "dx-negocio-error" : undefined}
          autoComplete="off"
        />
        <datalist id="dx-rubros">
          {t.rubros.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
        {errors.negocio && (
          <p id="dx-negocio-error" role="alert" className="text-[0.8125rem] text-bad">
            {errors.negocio}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="dx-dolor" className={etiqueta}>
          {t.dolor}
        </label>
        <textarea
          id="dx-dolor"
          value={values.dolor}
          onChange={set("dolor")}
          rows={4}
          placeholder={t.dolorPh}
          className="resize-none rounded-lg border border-line-strong bg-paper px-4 py-3 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink focus-visible:border-ink aria-[invalid=true]:border-bad"
          aria-invalid={!!errors.dolor}
          aria-describedby={errors.dolor ? "dx-dolor-error" : undefined}
        />
        {errors.dolor && (
          <p id="dx-dolor-error" role="alert" className="text-[0.8125rem] text-bad">
            {errors.dolor}
          </p>
        )}
      </div>

      {/* Se ve exactamente lo que se va a enviar: nadie manda un mensaje
          a ciegas desde un formulario ajeno. */}
      <div className="rounded-lg border border-line bg-paper p-4">
        <p className="eyebrow mb-2">{t.verMensaje}</p>
        <p className="text-[0.8125rem] leading-relaxed text-ink-mute">
          {mensaje}
        </p>
      </div>

      <Button type="submit" variant="primary" size="lg">
        <WhatsappLogo size={18} weight="fill" />
        {t.abrir}
      </Button>
    </form>
  );
}
