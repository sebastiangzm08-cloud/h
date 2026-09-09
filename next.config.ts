import type { NextConfig } from "next";

/* Las variables NEXT_PUBLIC_* se hornean en `next build`: tienen que estar
   presentes durante la compilación (no solo en runtime). En el VPS eso lo
   provee EasyPanel desde la pestaña Environment del servicio. */
const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
