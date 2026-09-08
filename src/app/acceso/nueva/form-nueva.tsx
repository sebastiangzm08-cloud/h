"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabaseNavegador } from "@/lib/supabase/navegador";
import { botonAcceso } from "../marco";
import { CampoClave } from "../campo-clave";
import { cn } from "@/lib/utils";

type Estado = "verificando" | "listo" | "invalido";

export function FormNueva() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("verificando");
  const [clave, setClave] = useState("");
  const [repetir, setRepetir] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const supabase = supabaseNavegador();

    async function comprobar() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setEstado("listo");
        return;
      }
      // El cliente del navegador canjea el `?code=` solo al iniciar. Si en un
      // segundo no hay sesión, el enlace no sirve (usado o vencido).
      setTimeout(async () => {
        const { data: d2 } = await supabase.auth.getSession();
        setEstado(d2.session ? "listo" : "invalido");
      }, 1200);
    }
    comprobar();
  }, []);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setError(null);
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
        setError("Poné una contraseña distinta a la anterior.");
      } else {
        setError("No se pudo cambiar. Pedí el enlace de nuevo.");
      }
      return;
    }

    setOk(true);
    setTimeout(() => {
      router.replace("/panel");
      router.refresh();
    }, 1200);
  }

  if (estado === "verificando") {
    return (
      <p className="mt-7 text-[13px] text-ink-faint">Verificando el enlace…</p>
    );
  }

  if (estado === "invalido") {
    return (
      <p
        role="alert"
        className="mt-7 rounded-xl bg-bad/10 px-4 py-4 text-[13px] leading-relaxed text-bad"
      >
        Este enlace ya se usó o venció. Pedí uno nuevo desde{" "}
        <a href="/acceso/recuperar" className="underline underline-offset-2">
          Recuperar tu contraseña
        </a>
        .
      </p>
    );
  }

  if (ok) {
    return (
      <p
        role="status"
        className="mt-7 rounded-xl bg-ok/10 px-4 py-4 text-[13px] text-ok"
      >
        Listo. Entrando a tu panel…
      </p>
    );
  }

  return (
    <form onSubmit={guardar} className="mt-7 flex flex-col gap-3.5" noValidate>
      <CampoClave
        label="Nueva contraseña"
        autoComplete="new-password"
        value={clave}
        onChange={setClave}
        placeholder="Al menos 8 caracteres"
      />
      <CampoClave
        label="Repetila"
        autoComplete="new-password"
        value={repetir}
        onChange={setRepetir}
        placeholder="La misma otra vez"
      />

      {error ? (
        <p role="alert" className="rounded-lg bg-bad/10 px-3 py-2.5 text-[12.5px] text-bad">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={cargando || !clave || !repetir}
        className={cn(botonAcceso)}
      >
        {cargando ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
