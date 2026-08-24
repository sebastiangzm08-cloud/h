"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Prototipo: sin autenticación real. Simula la entrada y va al dashboard.
    setTimeout(() => router.push("/app"), 500);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="correo" className="text-[0.8125rem] font-medium text-ink-soft">
          Correo
        </label>
        <input
          id="correo"
          type="email"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="vos@tuempresa.com"
          className="h-11 rounded-lg border border-line-strong bg-paper px-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="clave" className="text-[0.8125rem] font-medium text-ink-soft">
          Contraseña
        </label>
        <input
          id="clave"
          type="password"
          required
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          placeholder="••••••••"
          className="h-11 rounded-lg border border-line-strong bg-paper px-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink"
        />
      </div>
      <Button type="submit" variant="primary" size="md" disabled={loading} className="mt-1 w-full">
        {loading ? "Entrando…" : "Entrar al portal"}
      </Button>
      <p className="text-center text-[0.8125rem] text-ink-faint">
        Prototipo: cualquier dato entra a la vista de demostración.
      </p>
    </form>
  );
}
