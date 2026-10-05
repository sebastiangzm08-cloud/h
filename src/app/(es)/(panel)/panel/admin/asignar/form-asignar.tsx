"use client";

/* ==========================================================================
   Asignar una automatización a un cliente.

   Llama a `asignarAutomatizacion` (un POST normal a `/api/admin/…`), que
   resuelve el slug contra el catálogo de la base y crea la fila en
   `asignaciones`. El precio se prellena con el del catálogo, pero se puede
   ajustar — y para las que se cotizan (Prospección) arranca vacío.

   Rediseño 2026-09-30: mismos campos y mismo envío. Cambian la jerarquía, el
   mensaje de resultado (con enlace a la ficha del cliente) y los campos, que
   miden 44 px y 16 px en celular.
   ========================================================================== */
import { useMemo, useState } from "react";
import Link from "next/link";
import { useAccionAdmin } from "@/components/panel/usar-accion-admin";
import { CampoMonto } from "@/components/panel/campo-monto";
import { CampoToken } from "@/components/panel/campo-token";
import { colones } from "@/components/panel/ui";
import {
  BTN_PRIMARIO,
  BTN_SECUNDARIO,
  CAMPO,
  ETIQUETA,
  MensajeAccion,
  Selector,
} from "@/components/admin/admin-ui";
import { useEnvio } from "@/components/admin/usar-envio";
import { cn } from "@/lib/utils";

type OpcionCliente = { id: string; nombre: string };
type OpcionAut = {
  slug: string;
  nombre: string;
  plan: string;
  precio: number | null;
};

export function FormAsignar({
  clientes,
  automatizaciones,
  clienteInicial,
}: {
  clientes: OpcionCliente[];
  automatizaciones: OpcionAut[];
  clienteInicial?: string;
}) {
  const [estado, accion, pendiente] = useAccionAdmin("asignarAutomatizacion");
  const envio = useEnvio(estado, accion, { limpiarSiOk: false });

  const [clienteId, setClienteId] = useState(
    clientes.some((c) => c.id === clienteInicial) ? (clienteInicial as string) : (clientes[0]?.id ?? "")
  );
  const [slug, setSlug] = useState(automatizaciones[0]?.slug ?? "");
  const autSel = useMemo(
    () => automatizaciones.find((a) => a.slug === slug),
    [automatizaciones, slug]
  );

  if (clientes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line-strong px-5 py-8 text-center text-[13px] text-ink-faint">
        No hay clientes todavía. Dá de alta uno primero.
      </p>
    );
  }

  return (
    <form {...envio} className="flex flex-col gap-5">
      <CampoToken />
      <fieldset className="flex min-w-0 flex-col gap-4">
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className={ETIQUETA}>Cliente</span>
          <Selector name="clienteId" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Selector>
        </label>

        <label className="flex min-w-0 flex-col gap-1.5">
          <span className={ETIQUETA}>Automatización</span>
          <Selector name="slug" value={slug} onChange={(e) => setSlug(e.target.value)}>
            {automatizaciones.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.nombre} — Plan {a.plan}
              </option>
            ))}
          </Selector>
        </label>

        <label className="flex min-w-0 flex-col gap-1.5">
          <span className={ETIQUETA}>Precio mensual (₡)</span>
          <CampoMonto
            key={slug}
            name="precio"
            defaultValue={autSel?.precio ?? undefined}
            placeholder="Ej. 45.000"
            className={CAMPO}
          />
          <span className={cn("text-[11.5px] leading-snug", autSel?.precio == null ? "text-warn" : "text-ink-faint")}>
            {autSel?.precio == null
              ? "Esta se cotiza: no tiene precio de lista, ponele el que acordaron."
              : `Precio de lista: ${colones(autSel.precio)}/mes. Cambialo si le hacés precio de fundador.`}
          </span>
        </label>
      </fieldset>

      <MensajeAccion estado={estado} />

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pendiente} className={BTN_PRIMARIO}>
          {pendiente ? "Asignando…" : "Asignar"}
        </button>
        {estado?.ok && clienteId ? (
          <Link href={`/panel/admin/clientes/${clienteId}`} prefetch={false} className={BTN_SECUNDARIO}>
            Ver ficha del cliente
          </Link>
        ) : null}
      </div>
    </form>
  );
}
