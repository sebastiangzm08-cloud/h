import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();

  const paginas: Array<{
    ruta: string;
    prioridad: number;
    frecuencia: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { ruta: "/", prioridad: 1, frecuencia: "weekly" },
    { ruta: "/que-automatizamos", prioridad: 0.9, frecuencia: "weekly" },
    { ruta: "/planes", prioridad: 0.9, frecuencia: "weekly" },
    { ruta: "/diagnostico", prioridad: 0.8, frecuencia: "monthly" },
    { ruta: "/mis-herramientas", prioridad: 0.7, frecuencia: "monthly" },
    { ruta: "/nosotros", prioridad: 0.6, frecuencia: "monthly" },
    { ruta: "/contacto", prioridad: 0.6, frecuencia: "monthly" },
    { ruta: "/legal/terminos", prioridad: 0.2, frecuencia: "yearly" },
    { ruta: "/legal/privacidad", prioridad: 0.2, frecuencia: "yearly" },
    { ruta: "/legal/sla", prioridad: 0.2, frecuencia: "yearly" },
  ];

  return paginas.map(({ ruta, prioridad, frecuencia }) => ({
    url: `${site.url}${ruta}`,
    lastModified: ahora,
    changeFrequency: frecuencia,
    priority: prioridad,
  }));
}
