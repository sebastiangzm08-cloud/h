import type { NextConfig } from "next";

/* Las variables NEXT_PUBLIC_* se hornean en `next build`: tienen que estar
   presentes durante la compilación (no solo en runtime). En el VPS eso lo
   provee EasyPanel desde la pestaña Environment del servicio. */
const nextConfig: NextConfig = {
  /* `www.hoshizora.agency` y `hoshizora.agency` sirven el mismo sitio pero
     son dos hosts distintos para el navegador: una cookie de sesión puesta
     en uno NO viaja al otro (confirmado con una prueba real). Sin esto,
     entrar por `www` a veces y sin `www` otras veces pedía login de nuevo
     cada vez aunque la sesión siguiera viva. Todo el tráfico de `www` se
     manda al dominio sin `www`, que es el mismo que usa `NEXT_PUBLIC_SITE_URL`
     para los enlaces de correo. */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.hoshizora.agency" }],
        destination: "https://hoshizora.agency/:path*",
        permanent: true,
      },
    ];
  },
  experimental: {
    /* Hay dos layouts raíz (español e inglés, uno por idioma): el 404 de URLs
       que no existen no se puede armar con un layout, así que se declara
       completo en `src/app/global-not-found.tsx`. */
    globalNotFound: true,
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
