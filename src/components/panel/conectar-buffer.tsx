"use client";

/* ==========================================================================
   Conectar Buffer, en dos pasos:
     1. registrate y conectá tus redes en Buffer (link a buffer.com)
     2. creá un token "Personal Access" en Buffer (menú de tu organización →
        API → Personal Access → New Key) y pegalo acá → lo verificamos al
        instante contra la API de Buffer.

   Si el token sirve, detectamos tus canales (Instagram / Facebook / TikTok)
   y la conexión queda lista. Si no, te lo decimos en el momento.

   Fase 4b: mismo flujo y misma acción del servidor. El envío va por
   `onSubmit` para que, si el token fallaba, no se vacíe el campo, y los pasos
   se ven como pasos (número + texto + botón debajo, que en celular no cabían
   en la misma línea).
   ========================================================================== */
import { startTransition, useActionState } from "react";
import { MensajeEstado } from "@/components/panel/configuracion/controles";
import { BTN_PRIMARIO, BTN_SECUNDARIO, CAMPO } from "@/components/panel/configuracion/estilos";
import { Spinner } from "@/components/panel/configuracion/iconos-extra";
import { Seccion } from "@/components/panel/configuracion/seccion";
import {
  guardarBuffer,
  type ResultadoConexion,
} from "@/lib/panel/conexion-acciones";
import type { EstadoBuffer } from "@/lib/panel/datos";
import { Pill } from "@/components/panel/ui";
import { cn } from "@/lib/utils";

export function ConectarBuffer({
  estado,
  referencia,
}: {
  estado: EstadoBuffer;
  /** Texto legible de los canales detectados, cuando está conectada. */
  referencia: string | null;
}) {
  const [res, accion, pendiente] = useActionState<
    ResultadoConexion | null,
    FormData
  >(guardarBuffer, null);

  const listo = estado === "listo";

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    startTransition(() => {
      accion(datos);
    });
  }

  return (
    <Seccion
      id="buffer"
      eyebrow="Publicación"
      titulo="Conectar Buffer"
      descripcion={
        listo
          ? "Tus publicaciones salen por ahí."
          : "Buffer es por donde salen tus publicaciones a Instagram, Facebook y TikTok."
      }
      accion={listo ? <Pill tono="ok">Conectada</Pill> : <Pill tono="idle">Falta</Pill>}
    >
      {listo ? (
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-ink-soft">Buffer está conectado.</p>
          {referencia ? <p className="text-[12.5px] break-words text-ink-mute">Canales: {referencia}</p> : null}
          <details className="group">
            <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-full text-[12.5px] text-ink-mute transition-colors outline-none hover:text-ink focus-visible:text-ink [&::-webkit-details-marker]:hidden">
              Cambiar el token
              <span aria-hidden="true" className="transition-transform duration-200 group-open:rotate-90">
                ›
              </span>
            </summary>
            <TokenForm enviar={enviar} pendiente={pendiente} res={res} />
          </details>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <ol className="flex flex-col gap-4">
            <li className="flex gap-3">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-surface-3 font-mono text-[12px] text-ink-mute">
                1
              </span>
              <div className="min-w-0">
                <p className="text-[13px] leading-snug text-ink-soft">
                  Creá tu cuenta gratis en Buffer y conectá ahí tu Instagram y tu Facebook.
                </p>
                <a
                  href="https://buffer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(BTN_PRIMARIO, "mt-2.5")}
                >
                  Abrir Buffer
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-surface-3 font-mono text-[12px] text-ink-mute">
                2
              </span>
              <div className="min-w-0">
                <p className="text-[13px] leading-snug text-ink-soft">
                  En Buffer, abajo a la izquierda tocá el menú de tu organización y andá a{" "}
                  <b className="font-semibold text-ink">API → Personal Access → New Key</b>. Copiá el token que te da
                  y pegalo acá.
                </p>
                <a
                  href="https://publish.buffer.com/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(BTN_SECUNDARIO, "mt-2.5")}
                >
                  Abrir la página de API
                </a>
              </div>
            </li>
          </ol>

          <TokenForm enviar={enviar} pendiente={pendiente} res={res} />
        </div>
      )}
    </Seccion>
  );
}

function TokenForm({
  enviar,
  pendiente,
  res,
}: {
  enviar: (e: React.FormEvent<HTMLFormElement>) => void;
  pendiente: boolean;
  res: ResultadoConexion | null;
}) {
  return (
    <form onSubmit={enviar} className="mt-1 flex flex-col gap-3">
      <input
        name="buffer"
        type="password"
        autoComplete="off"
        aria-label="Token Personal Access de Buffer"
        placeholder="Tu token Personal Access de Buffer"
        className={CAMPO}
        disabled={pendiente}
      />

      {res && !res.ok ? <MensajeEstado ok={false}>{res.error}</MensajeEstado> : null}
      {res && res.ok ? <MensajeEstado ok>{res.mensaje}</MensajeEstado> : null}

      <button type="submit" disabled={pendiente} className={cn(BTN_PRIMARIO, "w-full sm:w-auto sm:self-start")}>
        {pendiente ? (
          <>
            <Spinner className="h-4 w-4" />
            Verificando…
          </>
        ) : (
          "Conectar"
        )}
      </button>
    </form>
  );
}
