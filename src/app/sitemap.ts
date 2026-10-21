import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { paresDeRutas } from "@/lib/i18n";

type Frecuencia = MetadataRoute.Sitemap[number]["changeFrequency"];

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();

  /* Páginas que existen en español Y en inglés: cada una sale dos veces
     (una por idioma) y las dos llevan los `hreflang` cruzados. */
  const prioridades: Record<string, { prioridad: number; frecuencia: Frecuencia }> = {
    "/": { prioridad: 1, frecuencia: "weekly" },
    "/que-automatizamos": { prioridad: 0.9, frecuencia: "weekly" },
    "/planes": { prioridad: 0.9, frecuencia: "weekly" },
    "/diagnostico": { prioridad: 0.8, frecuencia: "monthly" },
    "/nosotros": { prioridad: 0.6, frecuencia: "monthly" },
    "/contacto": { prioridad: 0.6, frecuencia: "monthly" },
  };

  const bilingues = paresDeRutas.flatMap((par) => {
    const { prioridad, frecuencia } = prioridades[par.es];
    /* Inglés apagado (site.sitioIngles): solo la página en español. */
    if (!site.sitioIngles) {
      return [
        {
          url: `${site.url}${par.es}`,
          lastModified: ahora,
          changeFrequency: frecuencia,
          priority: prioridad,
        },
      ];
    }
    const languages = {
      es: `${site.url}${par.es}`,
      en: `${site.url}${par.en}`,
      "x-default": `${site.url}${par.es}`,
    };
    return [par.es, par.en].map((ruta) => ({
      url: `${site.url}${ruta}`,
      lastModified: ahora,
      changeFrequency: frecuencia,
      // El inglés sale un punto por debajo: es la versión nueva y de nicho.
      priority: ruta === par.es ? prioridad : Math.max(prioridad - 0.1, 0.1),
      alternates: { languages },
    }));
  });

  /* Solo en español. */
  const soloEspanol: Array<{
    ruta: string;
    prioridad: number;
    frecuencia: Frecuencia;
  }> = [
    { ruta: "/mis-herramientas", prioridad: 0.7, frecuencia: "monthly" },
    { ruta: "/legal/terminos", prioridad: 0.2, frecuencia: "yearly" },
    { ruta: "/legal/privacidad", prioridad: 0.2, frecuencia: "yearly" },
    { ruta: "/legal/sla", prioridad: 0.2, frecuencia: "yearly" },
  ];

  return [
    ...bilingues,
    ...soloEspanol.map(({ ruta, prioridad, frecuencia }) => ({
      url: `${site.url}${ruta}`,
      lastModified: ahora,
      changeFrequency: frecuencia,
      priority: prioridad,
    })),
  ];
}
