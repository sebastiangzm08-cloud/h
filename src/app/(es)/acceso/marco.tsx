/* ==========================================================================
   Marco compartido de las pantallas de acceso (entrar, recuperar, nueva
   contraseña). Fondo oscuro, constelación de adorno, marca arriba.
   ========================================================================== */
import type { ReactNode } from "react";
import Link from "next/link";
import { ConstellationMark } from "@/components/constellation";

export function MarcoAcceso({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="panel-scope relative grid min-h-dvh place-items-center overflow-hidden bg-paper px-5 py-16 text-ink-soft">
      <ConstellationMark
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-[420px] w-[420px] text-ink opacity-[0.035]"
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent" />

      <div className="relative w-full max-w-[380px] animate-[entrada_0.5s_var(--ease-out-quart)_both]">
        <Link
          href="/"
          className="mb-9 inline-flex items-center gap-2.5 text-ink transition-opacity hover:opacity-80"
        >
          <ConstellationMark className="h-[26px] w-[26px]" />
          <span className="text-[17px] font-semibold tracking-tight">Hoshizora</span>
          <span className="rounded-full border border-line-strong px-[7px] py-0.5 font-mono text-[9.5px] tracking-[0.11em] text-ink-faint uppercase">
            Panel
          </span>
        </Link>

        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">
          {titulo}
        </h1>
        {descripcion ? (
          <p className="mt-1.5 text-[13px] text-ink-faint">{descripcion}</p>
        ) : null}

        {children}
      </div>
    </main>
  );
}

/** Estilo de input compartido en las pantallas de acceso. */
export const campoAcceso =
  "h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-[14px] text-ink " +
  "placeholder:text-ink-faint transition-colors " +
  "focus:border-line-strong focus:bg-surface-3 focus:outline-none";

/** Botón primario compartido. */
export const botonAcceso =
  "mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 " +
  "text-[13.5px] font-medium tracking-tight text-paper transition-all duration-200 " +
  "ease-out hover:bg-ink-soft active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";
