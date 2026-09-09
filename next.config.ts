import type { NextConfig } from "next";

/* Las variables NEXT_PUBLIC_* se hornean en `next build`: tienen que estar
   presentes durante la compilación (no solo en runtime). En el VPS eso lo
   provee EasyPanel desde la pestaña Environment del servicio. */
const nextConfig: NextConfig = {
  experimental: {
    /* Detrás del proxy de EasyPanel (Traefik), Next recibe un `Host` interno
       (`localhost:3000`) distinto del `Origin` real del navegador (el
       dominio). Sin esto, Next trata el POST de un Server Action como
       cross-origin y le descarta las cookies -> "Auth session missing" en las
       acciones del admin. Acá van los orígenes legítimos. */
    serverActions: {
      allowedOrigins: [
        "hoshizora.agency",
        "www.hoshizora.agency",
        "hoshizora-web-web.ftavvk.easypanel.host",
        "*.easypanel.host",
      ],
    },
  },
};

export default nextConfig;
