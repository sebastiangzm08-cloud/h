/* ==========================================================================
   Cliente de Supabase para el SERVIDOR (páginas, layouts y route handlers).

   La sesión viaja en cookies. `createServerClient` ya trae `autoRefreshToken`
   en false, así que este cliente básicamente sólo LEE la sesión; el que la
   renueva de verdad es el cliente del navegador (`navegador.ts`), que puede
   escribir cookies. El `setAll` con try/catch vacío no es un descuido: si
   Next no deja escribir desde un Server Component, no pasa nada.
   ========================================================================== */
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON, SUPABASE_SERVICE_ROLE, SUPABASE_URL } from "./entorno";

export async function supabaseServidor() {
  const almacen = await cookies();

  return createServerClient(SUPABASE_URL(), SUPABASE_ANON(), {
    // NO tocar `auth` acá: `persistSession: false` hace que el cliente NO
    // lea la sesión del adaptador de cookies y `getUser()` tira "Auth
    // session missing!". El adaptador de abajo es toda la persistencia.
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
