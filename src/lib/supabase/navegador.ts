/* ==========================================================================
   Cliente de Supabase para el NAVEGADOR.

   Usa la llave `anon`, que es pública a propósito: no da acceso a nada por
   sí sola. Quien decide qué puede leer cada quien son las reglas RLS de la
   base, no este archivo.

   `createBrowserClient` ya devuelve una sola instancia por página, así que
   llamarlo muchas veces no crea muchos clientes.
   ========================================================================== */
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON, SUPABASE_URL } from "./entorno";

export function supabaseNavegador() {
  return createBrowserClient(SUPABASE_URL(), SUPABASE_ANON());
}
