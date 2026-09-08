/* ==========================================================================
   Proxy (en Next 16 esto era `middleware.ts`). Corre antes de renderizar
   cualquier ruta.

   Acá solo delega: toda la lógica de sesión vive en
   `src/lib/supabase/proxy.ts`. El `matcher` deja fuera estáticos e
   imágenes — si no, el proxy se traga el CSS y el panel carga sin estilos.
   ========================================================================== */
import type { NextRequest } from "next/server";
import { pasarSesion } from "@/lib/supabase/proxy";

export async function proxy(req: NextRequest) {
  return pasarSesion(req);
}

export const config = {
  matcher: ["/panel/:path*", "/acceso"],
};
