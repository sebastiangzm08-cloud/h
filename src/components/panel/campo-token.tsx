"use client";

/* ==========================================================================
   Campo oculto con el token de acceso de la sesión.

   Por qué existe: en Netlify, un Server Action llega por POST con cabeceras
   extra de Next (`Next-Router-State-Tree`, `Next-Action`) que, sumadas a la
   cookie de sesión de Supabase (~6 KB en dos trozos), no siempre entran
   enteras en la función. Cuando la cookie no llega, el action no sabe quién
   sos y devuelve "No autorizado."

   Solución: mandamos el token en el CUERPO del POST (nunca en la URL). Es el
   tuyo, dura una hora, va por HTTPS al mismo dominio, y el servidor lo
   revalida contra Supabase con `getUser()` antes de confiar en él —
   `exigirAdmin` en `admin-acciones.ts`.

   Se refresca solo: `onAuthStateChange` lo actualiza si el token rota
   mientras el formulario sigue abierto.
   ========================================================================== */
import { useEffect, useState } from "react";
import { supabaseNavegador } from "@/lib/supabase/navegador";

export function CampoToken() {
  const [token, setToken] = useState("");

  useEffect(() => {
    const sb = supabaseNavegador();
    sb.auth
      .getSession()
      .then(({ data }) => setToken(data.session?.access_token ?? ""));
    const { data: sub } = sb.auth.onAuthStateChange((_evento, sesion) => {
      setToken(sesion?.access_token ?? "");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return <input type="hidden" name="_token" value={token} readOnly />;
}
