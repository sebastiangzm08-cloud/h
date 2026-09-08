/* ==========================================================================
   Puerta del panel. Correo + contraseña.

   El enlace mágico quedó para después: el correo que trae Supabase gratis
   manda 2 por hora y solo a miembros de la organización, así que no sirve
   para clientes. La cuenta la crea el admin y le pasa la contraseña al
   cliente. Igual que se entra a cualquier panel de hosting.

   No lleva la barra lateral: usa solo el layout raíz (tipografías +
   MotionConfig). El fondo oscuro sale de `.panel-scope`.
   ========================================================================== */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ConstellationMark } from "@/components/constellation";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { FormAcceso } from "./form-acceso";

export const metadata: Metadata = {
  title: "Acceso · Panel Hoshizora",
  robots: { index: false, follow: false },
};

export default async function AccesoPage({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string }>;
}) {
  const { volver } = await searchParams;

  // Si ya entró, no tiene nada que hacer acá.
  const supabase = await supabaseServidor();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims?.sub) redirect(volver || "/panel");

  return (
    <main className="panel-scope relative grid min-h-dvh place-items-center overflow-hidden bg-paper px-5 py-16 text-ink-soft">
      {/* Telón de fondo: la constelación, apenas visible. Puro adorno. */}
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
          Entrá a tu panel
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-faint">
          Con el correo y la contraseña que te pasamos. ¿No la tenés a mano?{" "}
          <a
            href="https://wa.me/50660791641?text=Hola%2C%20necesito%20mi%20acceso%20al%20panel"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-mute underline decoration-line-strong underline-offset-2 hover:text-ink-soft"
          >
            Escribinos
          </a>
          .
        </p>

        <FormAcceso volver={volver} />

        <p className="mt-8 text-center font-mono text-[10.5px] tracking-wide text-ink-faint">
          Área privada · cada quien ve solo lo suyo
        </p>
      </div>
    </main>
  );
}
