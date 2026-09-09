"use client";

/* ==========================================================================
   Asignar una automatización a un cliente.

   Llama al Server Action `asignarAutomatizacion`, que resuelve el slug
   contra el catálogo de la base y crea la fila en `asignaciones`. El precio
   se prellena con el del catálogo, pero se puede ajustar — y para las que
   se cotizan (Prospección) arranca vacío.
   ========================================================================== */
import { useActionState, useMemo, useState } from "react";
import {
  asignarAutomatizacion,
  type ResultadoAccion,
} from "@/lib/panel/admin-acciones";
import { CampoToken } from "@/components/panel/campo-token";
import { cn } from "@/lib/utils";

type OpcionCliente = { id: string; nombre: string };
type OpcionAut = {
  slug: string;
  nombre: string;
  plan: string;
  precio: number | null;
};

const campo =
  "h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-[14px] text-ink " +
  "transition-colors focus:border-line-strong focus:bg-surface-3 focus:outline-none";

export function FormAsignar({
  clientes,
  automatizaciones,
  clienteInicial,
}: {
  clientes: OpcionCliente[];
  automatizaciones: OpcionAut[];
  clienteInicial?: string;
}) {
  const [estado, accion, pendiente] = useActionState<
    ResultadoAccion | null,
    FormData
  >(asignarAutomatizacion, null);

  const [slug, setSlug] = useState(automatizaciones[0]?.slug ?? "");
  const autSel = useMemo(
    () => automatizaciones.find((a) => a.slug === slug),
    [automatizaciones, slug]
  );
  const [precio, setPrecio] = useState<string>(
    automatizaciones[0]?.precio != null ? String(automatizaciones[0].precio) : ""
  );

  function cambiarAut(nuevo: string) {
    setSlug(nuevo);
    const a = automatizaciones.find((x) => x.slug === nuevo);
    setPrecio(a?.precio != null ? String(a.precio) : "");
  }

  if (clientes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line-strong bg-white/[0.03] px-5 py-8 text-center text-[13px] text-ink-faint">
        No hay clientes todavía. Dá de alta uno primero.
      </p>
    );
  }

  return (
    <form action={accion} className="flex flex-col gap-5">
      <CampoToken />
      <fieldset className="flex flex-col gap-4" disabled={pendiente}>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">Cliente</span>
          <select
            name="clienteId"
            defaultValue={clienteInicial ?? clientes[0]?.id}
            className={cn(campo, "appearance-none")}
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">Automatización</span>
          <select
            name="slug"
            value={slug}
            onChange={(e) => cambiarAut(e.target.value)}
            className={cn(campo, "appearance-none")}
          >
            {automatizaciones.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.nombre} — Plan {a.plan}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">
            Precio mensual (₡){" "}
            {autSel?.precio == null ? (
              <span className="text-warn">· esta se cotiza</span>
            ) : null}
          </span>
          <input
            name="precio"
            type="number"
            min={0}
            step={1000}
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="Ej. 45000"
            className={campo}
          />
        </label>
      </fieldset>

      {estado && !estado.ok ? (
        <p role="alert" className="rounded-lg bg-bad/10 px-3.5 py-3 text-[12.5px] text-bad">
          {estado.error}
        </p>
      ) : null}
      {estado && estado.ok ? (
        <p role="status" className="rounded-lg bg-ok/10 px-3.5 py-3 text-[12.5px] text-ok">
          {estado.mensaje}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pendiente}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 self-start rounded-full bg-ink px-6 text-[13.5px] font-medium text-paper",
          "transition-all duration-200 ease-out hover:bg-ink-soft active:scale-[0.98]",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        {pendiente ? "Asignando…" : "Asignar"}
      </button>
    </form>
  );
}
