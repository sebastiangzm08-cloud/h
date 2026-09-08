"use client";

/* ==========================================================================
   Conectar Buffer, en dos pasos:
     1. registrate y conectá tus redes en Buffer (link a buffer.com)
     2. creá un token "Personal Access" en Buffer (menú de tu organización →
        API → Personal Access → New Key) y pegalo acá → lo verificamos al
        instante contra la API de Buffer.

   Si el token sirve, detectamos tus canales (Instagram / Facebook / TikTok)
   y la conexión queda lista. Si no, te lo decimos en el momento.
   ========================================================================== */
import { useActionState } from "react";
import {
  guardarBuffer,
  type ResultadoConexion,
} from "@/lib/panel/conexion-acciones";
import type { EstadoBuffer } from "@/lib/panel/datos";
import { Caja, CajaHead, Pill } from "@/components/panel/ui";
import { cn } from "@/lib/utils";

const campo =
  "h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-[13.5px] text-ink " +
  "placeholder:text-ink-faint transition-colors focus:border-line-strong " +
  "focus:bg-surface-3 focus:outline-none";

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

  return (
    <Caja>
      <CajaHead eyebrow="Publicación" titulo="Conectar Buffer">
        {listo ? (
          <Pill tono="ok">Conectada</Pill>
        ) : (
          <Pill tono="idle">Falta</Pill>
        )}
      </CajaHead>

      {listo ? (
        <div className="flex flex-col gap-2">
          <p className="text-[13px] text-ink-soft">
            Buffer está conectado. Tus publicaciones salen por ahí.
          </p>
          {referencia ? (
            <p className="text-[12px] text-ink-faint">Canales: {referencia}</p>
          ) : null}
          <details className="mt-1 text-[12px] text-ink-faint">
            <summary className="cursor-pointer hover:text-ink-mute">
              Cambiar el token
            </summary>
            <TokenForm accion={accion} pendiente={pendiente} res={res} />
          </details>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ol className="flex flex-col gap-3 text-[13px] text-ink-soft">
            <li className="flex gap-2.5">
              <span className="font-mono text-[11px] text-ink-faint">1.</span>
              <div>
                Creá tu cuenta gratis en Buffer y conectá ahí tu Instagram y tu
                Facebook.
                <a
                  href="https://buffer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex h-8 items-center rounded-full bg-ink px-3.5 text-[12px] font-medium text-paper transition-colors hover:bg-ink-soft"
                >
                  Abrir Buffer
                </a>
              </div>
            </li>
            <li className="flex gap-2.5">
              <span className="font-mono text-[11px] text-ink-faint">2.</span>
              <div>
                En Buffer, abajo a la izquierda tocá el menú de tu organización
                y andá a <b>API → Personal Access → New Key</b>. Copiá el token
                que te da y pegalo acá.
                <a
                  href="https://publish.buffer.com/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex h-8 items-center rounded-full border border-line-strong px-3.5 text-[12px] text-ink transition-colors hover:bg-surface-2"
                >
                  Abrir la página de API
                </a>
              </div>
            </li>
          </ol>

          <TokenForm accion={accion} pendiente={pendiente} res={res} />
        </div>
      )}
    </Caja>
  );
}

function TokenForm({
  accion,
  pendiente,
  res,
}: {
  accion: (fd: FormData) => void;
  pendiente: boolean;
  res: ResultadoConexion | null;
}) {
  return (
    <form action={accion} className="mt-2 flex flex-col gap-2.5">
      <input
        name="buffer"
        type="password"
        autoComplete="off"
        placeholder="Tu token Personal Access de Buffer"
        className={campo}
        disabled={pendiente}
      />

      {res && !res.ok ? (
        <p role="alert" className="rounded-lg bg-bad/10 px-3 py-2.5 text-[12.5px] text-bad">
          {res.error}
        </p>
      ) : null}
      {res && res.ok ? (
        <p role="status" className="rounded-lg bg-ok/10 px-3 py-2.5 text-[12.5px] text-ok">
          {res.mensaje}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pendiente}
        className={cn(
          "inline-flex h-10 items-center justify-center self-start rounded-full border border-line-strong px-5 text-[12.5px] text-ink transition-colors hover:bg-surface-2",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        {pendiente ? "Verificando…" : "Conectar"}
      </button>
    </form>
  );
}
