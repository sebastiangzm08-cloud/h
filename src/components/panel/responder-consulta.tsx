"use client";

/* ==========================================================================
   Caja de respuesta de una consulta. Sirve para el cliente y para el admin:
   el `variante` decide qué Server Action se llama.
   ========================================================================== */
import { useActionState } from "react";
import { responderConsulta } from "@/lib/panel/soporte-acciones";
import { responderConsultaAdmin } from "@/lib/panel/admin-acciones";
import { cn } from "@/lib/utils";

type Resultado = { ok: true; mensaje: string } | { ok: false; error: string };

export function ResponderConsulta({
  mensajeId,
  variante,
}: {
  mensajeId: string;
  variante: "cliente" | "admin";
}) {
  const accion =
    variante === "admin" ? responderConsultaAdmin : responderConsulta;
  const [estado, ejecutar, pendiente] = useActionState<Resultado | null, FormData>(
    accion as (
      p: Resultado | null,
      f: FormData
    ) => Promise<Resultado>,
    null
  );

  return (
    <form
      action={(fd) => {
        ejecutar(fd);
        // Limpiar el textarea al enviar.
        const t = document.getElementById(
          `resp-${mensajeId}`
        ) as HTMLTextAreaElement | null;
        if (t) setTimeout(() => (t.value = ""), 50);
      }}
      className="flex flex-col gap-2.5"
    >
      <input type="hidden" name="mensajeId" value={mensajeId} />
      <textarea
        id={`resp-${mensajeId}`}
        name="texto"
        required
        rows={3}
        placeholder={
          variante === "admin" ? "Escribí tu respuesta…" : "Escribí tu mensaje…"
        }
        className="w-full resize-none rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-ink-faint transition-colors focus:border-line-strong focus:bg-surface-3 focus:outline-none"
      />

      {estado && !estado.ok ? (
        <p role="alert" className="rounded-lg bg-bad/10 px-3 py-2 text-[12px] text-bad">
          {estado.error}
        </p>
      ) : null}
      {estado && estado.ok ? (
        <p role="status" className="rounded-lg bg-ok/10 px-3 py-2 text-[12px] text-ok">
          {estado.mensaje}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pendiente}
        className={cn(
          "inline-flex h-10 items-center justify-center self-start rounded-full bg-ink px-5 text-[13px] font-medium text-paper",
          "transition-colors hover:bg-ink-soft disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        {pendiente ? "Enviando…" : "Enviar"}
      </button>
    </form>
  );
}
