"use client";

/* ==========================================================================
   Demos de venta: crear una nueva y administrar las que ya existen.
   Ver demos-venta.sql y crearDemo/pausarDemo/... en admin-acciones.ts.

   Solo la usa `admin/demos/page.tsx`. Rediseño 2026-09-30: presentación
   (campos de 44 px y 16 px, grupos, medidor de mensajes). Mismas acciones y
   mismos campos de siempre.
   ========================================================================== */
import { useState, type ReactNode } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { Medidor, Pill } from "@/components/panel/ui";
import { useAccionAdmin } from "@/components/panel/usar-accion-admin";
import {
  BTN_CHICO_SECUNDARIO,
  BTN_PELIGRO_SOLIDO,
  BTN_PRIMARIO,
  BTN_TEXTO,
  CAMPO,
  CAMPO_AREA,
  ETIQUETA,
  MensajeAccion,
  Selector,
} from "@/components/admin/admin-ui";
import { BotonCopiar } from "@/components/admin/boton-copiar";
import { useEnvio } from "@/components/admin/usar-envio";
import type { DemoAdmin } from "@/lib/panel/admin";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

function urlDemo(slug: string) {
  return `${site.url}/demo/${slug}`;
}

function Campo({
  etiqueta,
  ayuda,
  children,
  className,
}: {
  etiqueta: string;
  ayuda?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className={ETIQUETA}>{etiqueta}</span>
      {children}
      {ayuda ? <span className="text-[11.5px] leading-snug text-ink-faint">{ayuda}</span> : null}
    </label>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3.5">
      <h3 className="font-mono text-[10.5px] font-medium tracking-[0.14em] text-ink-faint uppercase">{titulo}</h3>
      {children}
    </div>
  );
}

export function FormaCrearDemo() {
  const [estado, accion, pendiente] = useAccionAdmin("crearDemo");
  const envio = useEnvio(estado, accion);
  const slugCreado =
    estado?.ok && typeof estado.datos?.slug === "string" ? estado.datos.slug : null;

  return (
    <form {...envio} className="flex flex-col gap-6">
      <CampoToken />

      <fieldset className="flex min-w-0 flex-col gap-6">
        <Grupo titulo="El negocio">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombre del negocio *">
              <input
                autoComplete="off"
                name="nombreNegocio"
                required
                placeholder="Clínica Dental Sonrisa"
                className={CAMPO}
              />
            </Campo>
            <Campo etiqueta="Rubro (opcional)">
              <input autoComplete="off" name="rubro" placeholder="Clínica dental" className={CAMPO} />
            </Campo>
          </div>
          <Campo
            etiqueta="URL del logo o foto de perfil (opcional)"
            ayuda="Si no lo tenés hosteado, dejalo vacío y sale con la inicial."
          >
            <input
              autoComplete="off"
              name="logoUrl"
              type="url"
              inputMode="url"
              placeholder="https://…"
              className={CAMPO}
            />
          </Campo>
        </Grupo>

        <Grupo titulo="Cómo habla">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Trato">
              <Selector autoComplete="off" name="trato" defaultValue="usted">
                <option value="usted">De usted</option>
                <option value="vos">De vos</option>
              </Selector>
            </Campo>
            <Campo etiqueta="Emojis">
              <Selector autoComplete="off" name="emojis" defaultValue="pocos">
                <option value="ninguno">Ninguno</option>
                <option value="pocos">Pocos</option>
                <option value="varios">Varios</option>
              </Selector>
            </Campo>
          </div>
          <Campo etiqueta="Estilo (opcional)">
            <input
              autoComplete="off"
              name="estilo"
              placeholder="Cálido y cercano, como quien atiende bien en el mostrador."
              className={CAMPO}
            />
          </Campo>
        </Grupo>

        <Grupo titulo="Lo que sabe del negocio">
          <Campo
            etiqueta="Servicios y precios reales de este negocio *"
            ayuda="Uno por línea. El bot nunca inventa lo que no le des."
          >
            <textarea
              autoComplete="off"
              name="servicios"
              required
              rows={4}
              placeholder={"Limpieza dental ₡25.000\nConsulta general ₡15.000\nBlanqueamiento ₡60.000"}
              className={CAMPO_AREA}
            />
          </Campo>
          <Campo etiqueta="Horario real *">
            <input
              autoComplete="off"
              name="horario"
              required
              placeholder="Lunes a viernes 8am–5pm, sábados 8am–12md"
              className={CAMPO}
            />
          </Campo>
          <Campo etiqueta="Otro dato que deba saber (opcional)">
            <textarea
              autoComplete="off"
              name="notaExtra"
              rows={2}
              placeholder="Ej.: acepta SINPE y tarjeta, no atiende feriados."
              className={cn(CAMPO_AREA, "min-h-[72px]")}
            />
          </Campo>
        </Grupo>
      </fieldset>

      <MensajeAccion estado={estado && !estado.ok ? estado : null} />
      {slugCreado ? (
        <div
          role="status"
          className="flex flex-col gap-2.5 rounded-xl border border-ok/30 bg-ok/10 p-3.5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-ok">Demo creada. Este es el link para el prospecto:</p>
            <p className="mt-0.5 truncate font-mono text-[12px] text-ink-soft">{urlDemo(slugCreado)}</p>
          </div>
          <BotonCopiar texto={urlDemo(slugCreado)} etiqueta="Copiar link" />
        </div>
      ) : null}

      <button type="submit" disabled={pendiente} className={cn(BTN_PRIMARIO, "self-start")}>
        {pendiente ? "Creando la demo…" : "Crear demo y generar link"}
      </button>
    </form>
  );
}

export function FilaDemo({ demo }: { demo: DemoAdmin }) {
  const [, pausar, pendientePausar] = useAccionAdmin("pausarDemo");
  const [, reactivar, pendienteReactivar] = useAccionAdmin("reactivarDemo");
  const [resEliminar, eliminar, pendienteEliminar] = useAccionAdmin("eliminarDemo");
  const [confirmando, setConfirmando] = useState(false);

  return (
    <div className="flex flex-col gap-3.5 py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold break-words text-ink">{demo.nombreNegocio}</p>
          <p className="mt-0.5 text-[12px] text-ink-faint">{demo.rubro || "Sin rubro"}</p>
        </div>
        <Pill tono={demo.activo ? "ok" : "idle"}>{demo.activo ? "Activa" : "Pausada"}</Pill>
      </div>

      <Medidor etiqueta="Mensajes usados" usado={demo.mensajesUsados} tope={demo.mensajesTope} formato="miles" />

      <div className="flex items-center gap-2 rounded-xl bg-surface-3 py-1 pr-1 pl-3">
        <span className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-ink-mute">{urlDemo(demo.slug)}</span>
        <BotonCopiar texto={urlDemo(demo.slug)} etiqueta="Copiar" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <a
          href={urlDemo(demo.slug)}
          target="_blank"
          rel="noopener noreferrer"
          className={BTN_CHICO_SECUNDARIO}
        >
          Abrir demo
        </a>

        {demo.activo ? (
          <form action={pausar}>
            <input type="hidden" name="demoId" value={demo.id} />
            <CampoToken />
            <button type="submit" disabled={pendientePausar} className={BTN_CHICO_SECUNDARIO}>
              {pendientePausar ? "Pausando…" : "Pausar"}
            </button>
          </form>
        ) : (
          <form action={reactivar}>
            <input type="hidden" name="demoId" value={demo.id} />
            <CampoToken />
            <button type="submit" disabled={pendienteReactivar} className={BTN_CHICO_SECUNDARIO}>
              {pendienteReactivar ? "Reactivando…" : "Reactivar"}
            </button>
          </form>
        )}

        {confirmando ? (
          <form action={eliminar} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="demoId" value={demo.id} />
            <CampoToken />
            <span className="text-[12px] text-bad">¿Eliminar esta demo?</span>
            <button
              type="submit"
              disabled={pendienteEliminar}
              className={cn(BTN_PELIGRO_SOLIDO, "h-11 px-4 text-[12.5px] sm:h-9")}
            >
              {pendienteEliminar ? "Eliminando…" : "Sí, eliminar"}
            </button>
            <button type="button" onClick={() => setConfirmando(false)} className={BTN_TEXTO}>
              Cancelar
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className={cn(BTN_TEXTO, "hover:text-bad")}
          >
            Eliminar
          </button>
        )}
      </div>
      <MensajeAccion estado={resEliminar && !resEliminar.ok ? resEliminar : null} />
    </div>
  );
}
