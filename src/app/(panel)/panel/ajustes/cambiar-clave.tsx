"use client";

/* ==========================================================================
   Cambiar la contraseña. Esto SÍ funciona de verdad hoy: es una llamada del
   navegador a Supabase, sin correo de por medio.

   Supabase pide sesión activa (ya la hay) y mínimo 6 caracteres. Le
   exigimos 8 y que se repita bien.
   ========================================================================== */
import { useState, type FormEvent } from "react";
import { supabaseNavegador } from "@/lib/supabase/navegador";
import { cn } from "@/lib/utils";

const campo =
  "h-11 rounded-xl border border-line bg-surface-2 px-3.5 text-[14px] text-ink " +
  "placeholder:text-ink-faint transition-colors focus:border-line-strong " +
  "focus:bg-surface-3 focus:outline-none";

export function CambiarClave() {
  const [clave, setClave] = useState("");
  const [repetir, setRepetir] = useState("");
  const [cargando, setCargando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);

    if (clave.length < 8) {
      setError("La contraseña necesita al menos 8 caracteres.");
      return;
    }
    if (clave !== repetir) {
      setError("Las dos contraseñas no son iguales.");
      return;
    }

    setCargando(true);
    const { error } = await supabaseNavegador().auth.updateUser({ password: clave });
    setCargando(false);

    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("should be different") || m.includes("same as")) {
        setError("Esa ya es tu contraseña actual. Poné una nueva.");
      } else if (m.includes("weak") || m.includes("pwned") || m.includes("leaked")) {
        setError("Esa contraseña es fácil de adivinar. Probá con otra.");
      } else {
        setError("No se pudo cambiar. Probá de nuevo en un momento.");
      }
      return;
    }

    setOk(true);
    setClave("");
    setRepetir("");
  }

  return (
    <form onSubmit={guardar} className="flex max-w-sm flex-col gap-3.5" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-ink-mute">Nueva contraseña</span>
        <input
          type="password"
          autoComplete="new-password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          placeholder="Al menos 8 caracteres"
          className={campo}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-ink-mute">Repetila</span>
        <input
          type="password"
          autoComplete="new-password"
          value={repetir}
          onChange={(e) => setRepetir(e.target.value)}
          placeholder="La misma otra vez"
          className={campo}
        />
      </label>

      {error ? (
        <p role="alert" className="rounded-lg bg-bad/10 px-3 py-2.5 text-[12.5px] text-bad">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p role="status" className="rounded-lg bg-ok/10 px-3 py-2.5 text-[12.5px] text-ok">
          Listo, contraseña cambiada.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={cargando || !clave || !repetir}
        className={cn(
          "mt-1 inline-flex h-11 items-center justify-center gap-2 self-start rounded-full bg-ink px-6 text-[13.5px] font-medium text-paper",
          "transition-all duration-200 ease-out hover:bg-ink-soft active:scale-[0.98]",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        {cargando ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
