/* ==========================================================================
   Cliente de Supabase para el SERVIDOR (páginas, layouts y route handlers).

   La sesión viaja en cookies. Este cliente las lee de la petición y, cuando
   Supabase renueva el token, las vuelve a escribir.

   Ojo con `setAll`: desde un Server Component no se pueden escribir cookies
   y Next tira. No es un problema porque `src/proxy.ts` corre antes de cada
   petición y ahí sí se renuevan. Por eso el try/catch está vacío a
   propósito y no es un descuido.
   ========================================================================== */
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON, SUPABASE_SERVICE_ROLE, SUPABASE_URL } from "./entorno";

export async function supabaseServidor() {
  const almacen = await cookies();

  return createServerClient(SUPABASE_URL(), SUPABASE_ANON(), {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll(aEscribir) {
        try {
          for (const { name, value, options } of aEscribir) {
            almacen.set(name, value, options);
          }
        } catch {
          /* Server Component: escribe el proxy. Ver comentario de arriba. */
        }
      },
    },
  });
}

/**
 * Cliente ADMINISTRADOR. Se salta TODAS las reglas RLS.
 *
 * Se usa únicamente para lo que el propio usuario no puede hacer: dar de
 * alta clientes, sembrar el catálogo, escribir lo que manda n8n. Nunca para
 * leer datos "más rápido" — para eso está el cliente normal, que respeta
 * las reglas.
 *
 * Si esto llegara al navegador, cualquiera leería y borraría los datos de
 * todos los clientes. De ahí el portazo de abajo.
 */
export function supabaseAdmin() {
  if (typeof window !== "undefined") {
    throw new Error(
      "supabaseAdmin() se llamó desde el navegador. Es solo de servidor."
    );
  }

  return createServerClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE(), {
    auth: { persistSession: false, autoRefreshToken: false },
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
