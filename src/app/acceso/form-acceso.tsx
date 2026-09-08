"use client";

/* ==========================================================================
   El formulario de acceso. Vive aparte de la página porque maneja estado
   (lo que escribe la persona, el error, el "entrando…").

   Al entrar bien hace `router.refresh()`: obliga al servidor a rearmar el
   layout del panel con la sesión nueva. Sin eso, la primera pantalla
   cargaría todavía como "sin sesión".
   ========================================================================== */
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseNavegador } from "@/lib/supabase/navegador";
import { CampoClave } from "./campo-clave";
import { cn } from "@/lib/utils";

export function FormAcceso({ volver }: { volver?: string }) {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const { error } = await supabaseNavegador().auth.signInWithPassword({
      email: correo.trim(),
      password: clave,
    });

    if (error) {
      setCargando(false);
      // El mensaje crudo de Supabase es en inglés y técnico. Lo traducimos
      // a algo que una persona entienda, sin decir cuál de los dos campos
      // falló (dárselo servido a quien prueba contraseñas es peor).
      // `error.code` es el campo estable; el texto es el respaldo.
      const code = error.code ?? "";
      const m = error.message.toLowerCase();
      if (code === "invalid_credentials" || m.includes("invalid login credentials")) {
        setError("El correo o la contraseña no coinciden.");
      } else if (code === "email_not_confirmed" || m.includes("not confirmed")) {
        setError("Tu cuenta todavía no está activada. Escribinos y lo resolvemos.");
      } else if (
        code === "over_request_rate_limit" ||
        m.includes("rate limit") ||
        m.includes("too many")
      ) {
        setError("Demasiados intentos. Esperá un minuto y volvé a probar.");
      } else {
        setError("El correo o la contraseña no coinciden.");
      }
      return;
    }

    // Sesión lista. Al panel (o a donde iba antes de que lo mandáramos acá).
    const destino = volver && volver.startsWith("/panel") ? volver : "/panel";
    router.replace(destino);
    router.refresh();
  }

  return (
    <form onSubmit={entrar} className="mt-7 flex flex-col gap-3.5" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-ink-mute">Correo</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="vos@tunegocio.com"
          className={campo}
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <CampoClave
          label="Contraseña"
          name="password"
          autoComplete="current-password"
          required
          value={clave}
          onChange={setClave}
          placeholder="••••••••"
        />
        <Link
          href="/acceso/recuperar"
          className="mt-0.5 self-end text-[11.5px] text-ink-faint transition-colors hover:text-ink-mute"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-bad/10 px-3 py-2.5 text-[12.5px] leading-snug text-bad"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={cargando}
        className={cn(
          "mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[13.5px] font-medium tracking-tight text-paper",
          "transition-all duration-200 ease-out hover:bg-ink-soft active:scale-[0.98]",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        {cargando ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-paper/40 border-t-paper" />
            Entrando…
          </>
        ) : (
          "Entrar"
        )}
      </button>
    </form>
  );
}

const campo =
  "h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-[14px] text-ink " +
  "placeholder:text-ink-faint transition-colors " +
  "focus:border-line-strong focus:bg-surface-3 focus:outline-none";
