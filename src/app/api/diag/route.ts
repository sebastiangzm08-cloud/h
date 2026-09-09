/* ==========================================================================
   Ruta de DIAGNÓSTICO temporal. Dice qué cookies llegan al servidor y si hay
   sesión. No devuelve ningún valor de cookie ni token — sólo nombres, largos
   y el id del usuario. Borrar cuando se cierre el caso de la sesión.
   ========================================================================== */
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseServidor } from "@/lib/supabase/servidor";

export const dynamic = "force-dynamic";

export async function GET() {
  const ck = await cookies();
  const hd = await headers();
  const crudo = hd.get("cookie") ?? "";

  let usuario = "no";
  let errorAuth: string | null = null;
  try {
    const supabase = await supabaseServidor();
    const { data, error } = await supabase.auth.getUser();
    usuario = data?.user?.id ?? "no";
    errorAuth = error?.message ?? null;
  } catch (e) {
    errorAuth = (e as Error).message;
  }

  return NextResponse.json(
    {
      cookiesQueLlegan: ck.getAll().map((c) => `${c.name} (${c.value.length} chars)`),
      largoHeaderCookie: crudo.length,
      hayCookieDeSupabase: /sb-[^=]+-auth-token/.test(crudo),
      usuario,
      errorAuth,
      hostQueVeNext: hd.get("host"),
      xForwardedHost: hd.get("x-forwarded-host"),
      xForwardedProto: hd.get("x-forwarded-proto"),
    },
    { headers: { "cache-control": "no-store" } }
  );
}
