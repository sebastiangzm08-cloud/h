"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { waLink } from "@/config/site";
import { getCopy, type Copy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";

type Errors = Partial<Record<"nombre" | "mensaje", string>>;

/** Arma el mensaje de WhatsApp a partir de lo que la persona escribió. */
function armarMensaje(
  t: Copy["contacto"]["form"],
  values: { nombre: string; herramientas: string; mensaje: string }
) {
  const partes = [
    t.wa.saludo(values.nombre.trim()),
    values.herramientas.trim() && t.wa.usa(values.herramientas.trim()),
    t.wa.dolor(values.mensaje.trim()),
  ];
  return partes.filter(Boolean).join("\n");
}

const campo =
  "h-12 rounded-lg border border-line-strong bg-paper px-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink focus-visible:border-ink aria-[invalid=true]:border-bad";

export function ContactForm({ idioma = "es" }: { idioma?: Idioma }) {
  const t = getCopy(idioma).contacto.form;
  const [values, setValues] = useState({ nombre: "", herramientas: "", mensaje: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [link, setLink] = useState("");

  const set = (k: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const validate = (): boolean => {
    const next: Errors = {};
    if (values.nombre.trim().length < 2) next.nombre = t.errNombre;
    if (values.mensaje.trim().length < 10) next.mensaje = t.errMensaje;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const href = waLink(armarMensaje(t, values));
    setLink(href);
    setStatus("sent");
    // Se abre en la misma pestaña que hizo el submit — un gesto directo del
    // usuario, así que ningún navegador lo bloquea como pop-up.
    window.open(href, "_blank", "noopener,noreferrer");
  };

  if (status === "sent") {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-8"
      >
        <CheckCircle size={28} weight="fill" className="text-ink" />
        <p className="text-[1.0625rem] font-medium tracking-tight text-ink">
          {t.listoTitulo}
        </p>
        <p className="text-[0.9375rem] leading-relaxed text-ink-mute">
          {t.listoTexto}
        </p>
        <Button href={link} variant="secondary" size="md">
          <WhatsappLogo size={18} weight="fill" />
          {t.abrir}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="nombre" className="text-[0.8125rem] font-medium text-ink-soft">
          {t.nombre}
        </label>
        <input
          id="nombre"
          value={values.nombre}
          onChange={set("nombre")}
          placeholder={t.nombrePh}
          className={campo}
          autoComplete="name"
          aria-invalid={!!errors.nombre}
          aria-describedby={errors.nombre ? "nombre-error" : undefined}
        />
        {errors.nombre && (
          <p id="nombre-error" role="alert" className="text-[0.8125rem] text-bad">
            {errors.nombre}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="herramientas" className="text-[0.8125rem] font-medium text-ink-soft">
          {t.herramientas}{" "}
          <span className="font-normal text-ink-faint">{t.opcional}</span>
        </label>
        <input
          id="herramientas"
          value={values.herramientas}
          onChange={set("herramientas")}
          placeholder={t.herramientasPh}
          className={campo}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="mensaje" className="text-[0.8125rem] font-medium text-ink-soft">
          {t.mensaje}
        </label>
        <textarea
          id="mensaje"
          value={values.mensaje}
          onChange={set("mensaje")}
          rows={5}
          placeholder={t.mensajePh}
          className="resize-none rounded-lg border border-line-strong bg-paper px-4 py-3 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink focus-visible:border-ink aria-[invalid=true]:border-bad"
          aria-invalid={!!errors.mensaje}
          aria-describedby={errors.mensaje ? "mensaje-error" : undefined}
        />
        {errors.mensaje && (
          <p id="mensaje-error" role="alert" className="text-[0.8125rem] text-bad">
            {errors.mensaje}
          </p>
        )}
      </div>

      <Button type="submit" variant="primary" size="lg">
        <WhatsappLogo size={18} weight="fill" />
        {t.enviar}
      </Button>
    </form>
  );
}
