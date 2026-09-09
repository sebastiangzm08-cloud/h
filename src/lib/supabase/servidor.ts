/* ==========================================================================
   Cliente de Supabase para el SERVIDOR (páginas, layouts y route handlers).

   La sesión viaja en cookies. Este cliente sólo las LEE. La renovación del
   token la hace el cliente del navegador (`navegador.ts`), que sí puede
   escribir cookies de forma confiable. Por eso `autoRefreshToken` está en
   false y el `setAll` con try/catch vacío no es un descuido: si Next no
   deja escribir la cookie desde un Server Component, no pasa nada.
   ========================================================================== */
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON, SUPABASE_SERVICE_ROLE, SUPABASE_URL } from "./entorno";

export async function supabaseServidor() {
  const almacen = await cookies();

  return createServerClient(SUPABASE_URL(), SUPABASE_ANON(), {
    // El servidor NUNCA renueva la sesión: eso lo hace el navegador (que sí
    // puede escribir cookies bien). Renovar acá rota el refresh token y, si
    // la cookie nueva no llega al navegador, lo deja afuera. `getUser()`
    // sigue validando el token actual, sólo que sin rotarlo.
    auth: { autoRefreshToken: false, persistSession: false },
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
