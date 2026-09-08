/* ==========================================================================
   Las llaves de Supabase, leídas en un solo lugar.

   Next reemplaza `process.env.NEXT_PUBLIC_*` en tiempo de compilación, así
   que hay que escribirlas literales — un `process.env[nombre]` dinámico no
   se reemplaza y llega `undefined` al navegador.

   Si falta una, el error dice CUÁL falta y DÓNDE ponerla. Un `undefined`
   silencioso adentro del cliente de Supabase se manifiesta media hora
   después como "Invalid API key" y no como "te falta una variable".
   ========================================================================== */

function exigir(nombre: string, valor: string | undefined): string {
  if (!valor) {
    throw new Error(
      `Falta ${nombre} en web/.env.local. Está en Supabase → Project Settings → API.`
    );
  }
  return valor;
}

export const SUPABASE_URL = () =>
  exigir("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);

export const SUPABASE_ANON = () =>
  exigir("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** Solo servidor. Se salta RLS: nunca importar esto desde un componente cliente. */
export const SUPABASE_SERVICE_ROLE = () =>
  exigir("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);

/** A dónde vuelve el enlace del correo. En producción cambia a la url real. */
export const SITIO = () =>
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3311";
