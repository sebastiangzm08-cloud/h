"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { waLink } from "@/config/site";

type Errors = Partial<Record<"nombre" | "mensaje", string>>;

/** Arma el mensaje de WhatsApp a partir de lo que la persona escribió. */
function armarMensaje(values: {
  nombre: string;
  herramientas: string;
  mensaje: string;
}) {
  const partes = [
    `Hola, soy ${values.nombre.trim()}.`,
    values.herramientas.trim() &&
      `Hoy uso: ${values.herramientas.trim()}.`,
    `Lo que me está costando tiempo: ${values.mensaje.trim()}`,
  ];
  return partes.filter(Boolean).join("\n");
}

export function ContactForm() {
  const [values, setValues] = useState({ nombre: "", herramientas: "", mensaje: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [link, setLink] = useState("");

  const set = (k: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const validate = (): boolean => {
    const next: Errors = {};
    if (values.nombre.trim().length < 2) next.nombre = "Falta el nombre.";
    if (values.mensaje.trim().length < 10)
      next.mensaje = "Contanos un poco más, al menos dos líneas.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const href = waLink(armarMensaje(values));
    setLink(href);
    setStatus("sent");
    // Se abre en la misma pestaña que hizo el submit — un gesto directo del
    // usuario, así que ningún navegador lo bloquea como pop-up.
    window.open(href, "_blank", "noopener,noreferrer");
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-8">
        <CheckCircle size={28} weight="fill" className="text-ink" />
        <p className="text-[1.0625rem] font-medium tracking-tight text-ink">
          Te abrimos WhatsApp con tu mensaje listo
        </p>
        <p className="text-[0.9375rem] leading-relaxed text-ink-mute">
          Si no se abrió solo, tocá el botón de abajo.
        </p>
        <Button href={link} variant="secondary" size="md">
          <WhatsappLogo size={18} weight="fill" />
          Abrir WhatsApp
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="nombre" className="text-[0.8125rem] font-medium text-ink-soft">
          Nombre
        </label>
        <input
          id="nombre"
          value={values.nombre}
          onChange={set("nombre")}
          placeholder="Como te gusta que te llamen"
          className="h-12 rounded-lg border border-line-strong bg-paper px-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink"
          aria-invalid={!!errors.nombre}
        />
        {errors.nombre && (
          <p className="text-[0.8125rem] text-bad">{errors.nombre}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="herramientas" className="text-[0.8125rem] font-medium text-ink-soft">
          Herramientas que usás hoy <span className="text-ink-faint font-normal">(opcional)</span>
        </label>
        <input
          id="herramientas"
          value={values.herramientas}
          onChange={set("herramientas")}
          placeholder="WhatsApp, Excel, un CRM..."
          className="h-12 rounded-lg border border-line-strong bg-paper px-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="mensaje" className="text-[0.8125rem] font-medium text-ink-soft">
          Contanos qué te está costando tiempo
        </label>
        <textarea
          id="mensaje"
          value={values.mensaje}
          onChange={set("mensaje")}
          rows={5}
          placeholder="Ej: perdemos leads porque nadie los contesta rápido los fines de semana..."
          className="resize-none rounded-lg border border-line-strong bg-paper px-4 py-3 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink"
          aria-invalid={!!errors.mensaje}
        />
        {errors.mensaje && (
          <p className="text-[0.8125rem] text-bad">{errors.mensaje}</p>
        )}
      </div>

      <Button type="submit" variant="primary" size="lg">
        <WhatsappLogo size={18} weight="fill" />
        Enviar por WhatsApp
      </Button>
    </form>
  );
}
