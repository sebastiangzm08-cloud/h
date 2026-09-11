/* ==========================================================================
   Ruta de DIAGNÓSTICO temporal. Dice qué cookies llegan al servidor y si hay
   sesión. No devuelve valores de cookie ni tokens — sólo nombres y largos.

   `?set=1` escribe dos cookies de prueba (una chica y una del mismo tamaño
   que la de Supabase) para ver si el navegador guarda las grandes.
   Borrar este archivo cuando se cierre el caso de la sesión.
   ========================================================================== */
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseServidor } from "@/lib/supabase/servidor";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ck = await cookies();
  const hd = await headers();
  const crudo = hd.get("cookie") ?? "";
  const quiereSet = new URL(req.url).searchParams.get("set") === "1";

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

  const res = NextResponse.json(
    {
      instruccion: quiereSet
        ? "Cookies de prueba escritas. Ahora abrí /api/diag (sin ?set=1) y mirá si vuelven."
        : "Para escribir cookies de prueba abrí /api/diag?set=1",
      cookiesQueLlegan: ck.getAll().map((c) => `${c.name} (${c.value.length} chars)`),
      largoHeaderCookie: crudo.length,
      hayCookieDeSupabase: /sb-[^=]+-auth-token/.test(crudo),
      pruebaChicaVolvio: /(^|;\s*)diag_chica=/.test(crudo),
      pruebaGrandeVolvio: /(^|;\s*)diag_grande=/.test(crudo),
      usuario,
      errorAuth,
      hostQueVeNext: hd.get("host"),
      xForwardedProto: hd.get("x-forwarded-proto"),
    },
    { headers: { "cache-control": "no-store" } }
  );

  if (quiereSet) {
    // Chica: 3 bytes. Grande: ~2600, el mismo peso que la de Supabase.
    res.cookies.set("diag_chica", "1", { path: "/", sameSite: "lax" });
    res.cookies.set("diag_grande", "x".repeat(2600), { path: "/", sameSite: "lax" });
  }
  return res;
}
