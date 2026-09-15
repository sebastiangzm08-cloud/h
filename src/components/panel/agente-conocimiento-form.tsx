"use client";

/* ==========================================================================
   "Qué sabe", ya editable: agregar servicios/datos/reglas, apagarlos sin
   perderlos, o borrarlos. Todo pasa por `wa_conocimiento` — el mismo lugar
   de donde el workflow arma el prompt, así que lo que se guarda acá el
   agente lo usa en la siguiente conversación, sin tocar n8n.
   ========================================================================== */
import { useState } from "react";
import { CampoMonto } from "@/components/panel/campo-monto";
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import { cn } from "@/lib/utils";

const campo =
  "w-full rounded-lg border border-line-strong bg-surface-2 px-3 py-2 text-[13px] text-ink " +
  "placeholder:text-ink-faint outline-none transition-colors focus:border-ink-faint";

export function FormaAgregarConocimiento({ tipo }: { tipo: "servicio" | "dato" | "regla" }) {
  const [estado, agregar, agregando] = useAccionAgente("agregarConocimiento");
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="w-full border-t border-line px-4 py-3 text-left text-[13px] text-ink-mute transition-colors hover:bg-surface-2 hover:text-ink-soft"
      >
        + Agregar {tipo === "servicio" ? "servicio" : tipo === "dato" ? "dato" : "regla"}
      </button>
    );
  }

  return (
    <form
      action={(form) => {
        agregar(form);
        setAbierto(false);
      }}
      className="flex flex-col gap-2.5 border-t border-line bg-surface-2/40 p-4"
    >
      <input type="hidden" name="tipo" value={tipo} />
      <CampoToken />

      <input autoComplete="off"
        type="text"
        name="clave"
        required
        placeholder={
          tipo === "servicio" ? "Nombre del servicio" : tipo === "dato" ? "Ej.: Dirección" : "La regla, tal cual"
        }
        className={campo}
      />

      {tipo !== "regla" ? (
        <input autoComplete="off"
          type="text"
          name="valor"
          placeholder={tipo === "dato" ? "El dato en sí" : "Detalle opcional"}
          className={campo}
        />
      ) : null}

      {tipo === "servicio" ? (
        <div className="grid grid-cols-2 gap-2.5">
          <CampoMonto name="monto" placeholder="Precio en ₡ (vacío = a consultar)" className={campo} />
          <input autoComplete="off" type="number" name="duracionMin" min={0} placeholder="Duración en minutos" className={campo} />
        </div>
      ) : null}

      {estado && !estado.ok ? <p className="text-[12px] text-bad">{estado.error}</p> : null}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={agregando}
          className={cn(
            "rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-paper transition-colors",
            "hover:bg-ink-soft disabled:pointer-events-none disabled:opacity-40"
          )}
        >
          {agregando ? "Guardando…" : "Agregar"}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="rounded-lg border border-line-strong px-3.5 py-2 text-[13px] text-ink-mute transition-colors hover:bg-surface-2"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function AccionesConocimiento({ id, activo }: { id: string; activo: boolean }) {
  const [, alternar, alternando] = useAccionAgente("alternarConocimiento");
  const [, eliminar, eliminando] = useAccionAgente("eliminarConocimiento");

  return (
    <div className="flex flex-none gap-1.5">
      <form action={alternar}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="activo" value={String(activo)} />
        <CampoToken />
        <button
          type="submit"
          disabled={alternando || eliminando}
          className="rounded-md border border-line-strong px-2 py-1 text-[11px] text-ink-mute transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-40"
        >
          {activo ? "Desactivar" : "Activar"}
        </button>
      </form>
      <form
        action={eliminar}
        onSubmit={(e) => {
          if (!confirm("¿Eliminar esto para siempre?")) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <CampoToken />
        <button
          type="submit"
          disabled={alternando || eliminando}
          className="rounded-md border border-line-strong px-2 py-1 text-[11px] text-bad transition-colors hover:bg-bad/10 disabled:pointer-events-none disabled:opacity-40"
        >
          {eliminando ? "…" : "Eliminar"}
        </button>
      </form>
    </div>
  );
}
