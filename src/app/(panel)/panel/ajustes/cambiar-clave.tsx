"use client";

/* ==========================================================================
   Cambiar la contraseña. Esto SÍ funciona de verdad hoy: es una llamada del
   navegador a Supabase, sin correo de por medio.

   Supabase pide sesión activa (ya la hay) y mínimo 6 caracteres. Le
   exigimos 8 y que se repita bien.
   ========================================================================== */
import { useState, type FormEvent } from "react";
import { Campo, MensajeEstado } from "@/components/panel/configuracion/controles";
import { BTN_PRIMARIO, CAMPO } from "@/components/panel/configuracion/estilos";
import { Spinner } from "@/components/panel/configuracion/iconos-extra";
import { supabaseNavegador } from "@/lib/supabase/navegador";
import { cn } from "@/lib/utils";

export function CambiarClave() {
  const [clave, setClave] = useState("");
  const [repetir, setRepetir] = useState("");
  const [ver, setVer] = useState(false);
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
    let error: { message: string } | null = null;
    try {
      ({ error } = await supabaseNavegador().auth.updateUser({ password: clave }));
    } catch {
      error = { message: "red" };
    } finally {
      setCargando(false);
    }

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

  const tipo = ver ? "text" : "password";

  return (
    <form onSubmit={guardar} className="flex max-w-sm flex-col gap-3.5" noValidate>
      <Campo etiqueta="Nueva contraseña">
        <input
          type={tipo}
          autoComplete="new-password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          placeholder="Al menos 8 caracteres"
          disabled={cargando}
          className={CAMPO}
        />
      </Campo>

      <Campo etiqueta="Repetila">
        <input
          type={tipo}
          autoComplete="new-password"
          value={repetir}
          onChange={(e) => setRepetir(e.target.value)}
          placeholder="La misma otra vez"
          disabled={cargando}
          className={CAMPO}
        />
      </Campo>

      {/* Casilla de verdad: se opera con teclado y el lector de pantalla la
          anuncia. 44 px de alto en toda la fila. */}
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[13px] text-ink-mute">
        <input
          type="checkbox"
          checked={ver}
          onChange={(e) => setVer(e.target.checked)}
          className="h-5 w-5 flex-none accent-[color:var(--panel-acento)]"
        />
        Mostrar las contraseñas
      </label>

      {error ? <MensajeEstado ok={false}>{error}</MensajeEstado> : null}
      {ok ? <MensajeEstado ok>Listo, contraseña cambiada.</MensajeEstado> : null}

      <button
        type="submit"
        disabled={cargando || !clave || !repetir}
        className={cn(BTN_PRIMARIO, "w-full self-start sm:w-auto")}
      >
        {cargando ? (
          <>
            <Spinner className="h-4 w-4" />
            Guardando…
          </>
        ) : (
          "Cambiar contraseña"
        )}
      </button>
    </form>
  );
}
