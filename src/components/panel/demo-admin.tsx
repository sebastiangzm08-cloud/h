"use client";

/* ==========================================================================
   Demos de venta: crear una nueva y administrar las que ya existen.
   Ver demos-venta.sql y crearDemo/pausarDemo/... en admin-acciones.ts.
   ========================================================================== */
import { useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { Pill } from "@/components/panel/ui";
import { useAccionAdmin } from "@/components/panel/usar-accion-admin";
import type { DemoAdmin } from "@/lib/panel/admin";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

const campo =
  "w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink " +
  "placeholder:text-ink-faint transition-colors focus:border-line-strong " +
  "focus:bg-surface-3 focus:outline-none";

function urlDemo(slug: string) {
  return `${site.url}/demo/${slug}`;
}

function BotonCopiar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 1800);
        } catch {
          /* Portapapeles bloqueado (permiso o http sin TLS) — no hay más
             que hacer que dejar el link visible para copiar a mano. */
        }
      }}
      className="inline-flex flex-none items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-[12px] text-ink-soft transition-colors hover:bg-surface-2"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
        {copiado ? <path d="m5 12 5 5 9-9" /> : (
          <>
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M6 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V6" />
          </>
        )}
      </svg>
      {copiado ? "¡Copiado!" : "Copiar link"}
    </button>
  );
}

export function FormaCrearDemo() {
  const [estado, accion, pendiente] = useAccionAdmin("crearDemo");
  const slugCreado =
    estado?.ok && typeof estado.datos?.slug === "string" ? estado.datos.slug : null;

  return (
    <form action={accion} className="flex flex-col gap-4">
      <CampoToken />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">Nombre del negocio</span>
          <input
            autoComplete="off"
            name="nombreNegocio"
            required
            placeholder="Clínica Dental Sonrisa"
            className={campo}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">Rubro (opcional)</span>
          <input
            autoComplete="off"
            name="rubro"
            placeholder="Clínica dental"
            className={campo}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">Trato</span>
          <select autoComplete="off" name="trato" defaultValue="usted" className={cn(campo, "appearance-none")}>
            <option value="usted">De usted</option>
            <option value="vos">De vos</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">Emojis</span>
          <select autoComplete="off" name="emojis" defaultValue="pocos" className={cn(campo, "appearance-none")}>
            <option value="ninguno">Ninguno</option>
            <option value="pocos">Pocos</option>
            <option value="varios">Varios</option>
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-ink-mute">
          URL del logo o foto de perfil (opcional)
        </span>
        <input
          autoComplete="off"
          name="logoUrl"
          type="url"
          placeholder="https://... — si no lo tenés hosteado, dejalo vacío y sale con la inicial"
          className={campo}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-ink-mute">Estilo (opcional)</span>
        <input
          autoComplete="off"
          name="estilo"
          placeholder="Cálido y cercano, como quien atiende bien en el mostrador."
          className={campo}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-ink-mute">
          Servicios y precios reales de este negocio
        </span>
        <textarea
          autoComplete="off"
          name="servicios"
          required
          rows={3}
          placeholder={"Limpieza dental ₡25.000\nConsulta general ₡15.000\nBlanqueamiento ₡60.000"}
          className={cn(campo, "resize-none")}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-ink-mute">Horario real</span>
        <input
          autoComplete="off"
          name="horario"
          required
          placeholder="Lunes a viernes 8am–5pm, sábados 8am–12md"
          className={campo}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-medium text-ink-mute">
          Otro dato que deba saber (opcional)
        </span>
        <textarea
          autoComplete="off"
          name="notaExtra"
          rows={2}
          placeholder="Ej.: acepta SINPE y tarjeta, no atiende feriados."
          className={cn(campo, "resize-none")}
        />
      </label>

      {estado && !estado.ok ? (
        <p role="alert" className="rounded-lg bg-bad/10 px-3.5 py-3 text-[12.5px] text-bad">
          {estado.error}
        </p>
      ) : null}
      {slugCreado ? (
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg bg-ok/10 px-3.5 py-3 text-[12.5px] text-ok">
          <span className="truncate">{urlDemo(slugCreado)}</span>
          <BotonCopiar texto={urlDemo(slugCreado)} />
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pendiente}
        className={cn(
          "inline-flex h-11 w-fit items-center justify-center rounded-full bg-ink px-6 text-[13.5px] font-medium text-paper",
          "transition-colors hover:bg-ink-soft disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        {pendiente ? "Creando…" : "Crear demo y generar link"}
      </button>
    </form>
  );
}

export function FilaDemo({ demo }: { demo: DemoAdmin }) {
  const [, pausar, pendientePausar] = useAccionAdmin("pausarDemo");
  const [, reactivar, pendienteReactivar] = useAccionAdmin("reactivarDemo");
  const [, eliminar, pendienteEliminar] = useAccionAdmin("eliminarDemo");
  const [confirmando, setConfirmando] = useState(false);

  return (
    <div className="flex flex-col gap-2.5 border-b border-line px-1.5 py-3.5 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium text-ink">{demo.nombreNegocio}</p>
          <p className="mt-0.5 text-[11.5px] text-ink-faint">
            {demo.rubro || "Sin rubro"} · {demo.mensajesUsados}/{demo.mensajesTope} mensajes usados
          </p>
        </div>
        <Pill tono={demo.activo ? "ok" : "idle"}>{demo.activo ? "Activa" : "Pausada"}</Pill>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 flex-1 truncate rounded-lg bg-surface-3 px-3 py-1.5 font-mono text-[11.5px] text-ink-mute">
          {urlDemo(demo.slug)}
        </span>
        <BotonCopiar texto={urlDemo(demo.slug)} />

        {demo.activo ? (
          <form action={pausar}>
            <input type="hidden" name="demoId" value={demo.id} />
            <CampoToken />
            <button
              type="submit"
              disabled={pendientePausar}
              className="rounded-full border border-line-strong px-3 py-1.5 text-[12px] text-ink-soft transition-colors hover:bg-surface-2 disabled:opacity-50"
            >
              Pausar
            </button>
          </form>
        ) : (
          <form action={reactivar}>
            <input type="hidden" name="demoId" value={demo.id} />
            <CampoToken />
            <button
              type="submit"
              disabled={pendienteReactivar}
              className="rounded-full border border-line-strong px-3 py-1.5 text-[12px] text-ink-soft transition-colors hover:bg-surface-2 disabled:opacity-50"
            >
              Reactivar
            </button>
          </form>
        )}

        {confirmando ? (
          <form action={eliminar} className="flex items-center gap-1.5">
            <input type="hidden" name="demoId" value={demo.id} />
            <CampoToken />
            <span className="text-[11.5px] text-bad">¿Seguro?</span>
            <button
              type="submit"
              disabled={pendienteEliminar}
              className="rounded-full bg-bad/15 px-3 py-1.5 text-[12px] text-bad transition-colors hover:bg-bad/25 disabled:opacity-50"
            >
              Sí, eliminar
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="rounded-full px-2 py-1.5 text-[12px] text-ink-faint hover:text-ink-soft"
            >
              Cancelar
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="rounded-full px-3 py-1.5 text-[12px] text-ink-faint transition-colors hover:text-bad"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
