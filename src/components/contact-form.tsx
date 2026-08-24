"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

type Errors = Partial<Record<"nombre" | "correo" | "mensaje", string>>;

export function ContactForm() {
  const [values, setValues] = useState({ nombre: "", correo: "", herramientas: "", mensaje: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const set = (k: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const validate = (): boolean => {
    const next: Errors = {};
    if (values.nombre.trim().length < 2) next.nombre = "Falta el nombre.";
    if (!/^\S+@\S+\.\S+$/.test(values.correo)) next.correo = "Ese correo no es válido.";
    if (values.mensaje.trim().length < 10)
      next.mensaje = "Contanos un poco más, al menos dos líneas.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    // Prototipo: acá va la llamada real al backend / Resend.
    setTimeout(() => setStatus("sent"), 900);
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-8">
        <CheckCircle size={28} weight="fill" className="text-ink" />
        <p className="text-[1.0625rem] font-medium tracking-tight text-ink">
          Listo, lo recibimos
        </p>
        <p className="text-[0.9375rem] leading-relaxed text-ink-mute">
          Te respondemos a {values.correo} dentro de un día hábil. Si es
          urgente, escribinos directo por WhatsApp.
        </p>
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
        <label htmlFor="correo" className="text-[0.8125rem] font-medium text-ink-soft">
          Correo
        </label>
        <input
          id="correo"
          type="email"
          value={values.correo}
          onChange={set("correo")}
          placeholder="vos@tuempresa.com"
          className="h-12 rounded-lg border border-line-strong bg-paper px-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink"
          aria-invalid={!!errors.correo}
        />
        {errors.correo && (
          <p className="text-[0.8125rem] text-bad">{errors.correo}</p>
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

      <Button type="submit" variant="primary" size="lg" disabled={status === "sending"}>
        {status === "sending" ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
