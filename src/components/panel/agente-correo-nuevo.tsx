"use client";

/* ==========================================================================
   Redactar un correo NUEVO — a diferencia de `RedactarCorreo` (que solo
   responde dentro de un hilo ya abierto), esto empieza uno. Mismo patrón de
   botón-que-se-abre-en-formulario que el resto del panel, con el mismo
   arreglo de "remontar al reabrir" que `agente-cita-form.tsx`: sin eso,
   cerrar después de mandar uno y abrir para el siguiente se queda pegado en
   el mensaje de éxito del anterior.
   ========================================================================== */
import { useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";

const campo =
  "w-full rounded-lg border border-line-strong bg-surface-2 px-3 py-2 text-[13px] text-ink " +
  "placeholder:text-ink-faint outline-none transition-colors focus:border-ink-faint";

function FormularioCorreoNuevo({ onCerrar }: { onCerrar: () => void }) {
  const [estado, iniciar, enviando] = useAccionAgente("iniciarCorreoNuevo");

  return (
    <form action={iniciar} className="mb-4 flex flex-col gap-2.5 rounded-xl border border-line bg-surface-2/40 p-4">
      <CampoToken />
      <p className="text-[12.5px] font-medium text-ink-soft">Redactar correo nuevo</p>
      <div className="grid grid-cols-2 gap-2.5">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-ink-faint">Para</span>
          <input autoComplete="off" type="email" name="destinatario" required placeholder="correo@ejemplo.com" className={campo} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-ink-faint">Nombre (opcional)</span>
          <input autoComplete="off" type="text" name="nombre" placeholder="Quién es" className={campo} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] text-ink-faint">Asunto</span>
        <input autoComplete="off" type="text" name="asunto" required placeholder="De qué se trata" className={campo} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] text-ink-faint">Mensaje</span>
        <textarea autoComplete="off" name="texto" required rows={4} placeholder="Escribir el correo…" className={`${campo} resize-none`} />
      </label>
      {estado && !estado.ok ? <p className="text-[12px] text-bad">{estado.error}</p> : null}
      {estado && estado.ok ? <p className="text-[12px] text-ok">{estado.mensaje}</p> : null}
      <div className="flex gap-2">
        {estado?.ok ? null : (
          <button
            type="submit"
            disabled={enviando}
            className="rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft disabled:pointer-events-none disabled:opacity-40"
          >
            {enviando ? "Enviando…" : "Enviar"}
          </button>
        )}
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-lg border border-line-strong px-3.5 py-2 text-[13px] text-ink-mute transition-colors hover:bg-surface-2"
        >
          {estado?.ok ? "Cerrar" : "Cancelar"}
        </button>
      </div>
    </form>
  );
}

export function BotonCorreoNuevo() {
  const [abierto, setAbierto] = useState(false);
  const [vuelta, setVuelta] = useState(0);

  if (!abierto) {
    return (
      <div className="mb-4">
        <button
          type="button"
          onClick={() => {
            setVuelta((v) => v + 1);
            setAbierto(true);
          }}
          className="rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft"
        >
          + Redactar nuevo
        </button>
      </div>
    );
  }

  return <FormularioCorreoNuevo key={vuelta} onCerrar={() => setAbierto(false)} />;
}
