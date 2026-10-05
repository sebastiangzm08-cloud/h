"use client";

import { useState, type FormEvent } from "react";
import { supabaseNavegador } from "@/lib/supabase/navegador";
import { botonAcceso, campoAcceso } from "../marco";

export function FormRecuperar() {
  const [correo, setCorreo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [listo, setListo] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setCargando(true);

    const redirectTo =
      (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
        window.location.origin) + "/acceso/nueva";

    // Se ignora el error a propósito: la pantalla responde igual pase lo que
    // pase, para no revelar si un correo está registrado.
    await supabaseNavegador().auth.resetPasswordForEmail(correo.trim(), {
      redirectTo,
    });

    setCargando(false);
    setListo(true);
  }

  if (listo) {
    return (
      <p
        role="status"
        className="mt-7 rounded-xl bg-ok/10 px-4 py-4 text-[13px] leading-relaxed text-ok"
      >
        Si ese correo tiene una cuenta, te llega un enlace en unos minutos.
        Revisá también la carpeta de spam.
      </p>
    );
  }

  return (
    <form onSubmit={enviar} className="mt-7 flex flex-col gap-3.5" noValidate>
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
          className={campoAcceso}
        />
      </label>

      <button type="submit" disabled={cargando} className={botonAcceso}>
        {cargando ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-paper/40 border-t-paper" />
            Enviando…
          </>
        ) : (
          "Enviarme el enlace"
        )}
      </button>
    </form>
  );
}
