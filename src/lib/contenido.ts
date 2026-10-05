import type { Idioma } from "@/lib/i18n";
import * as contenidoEs from "@/lib/content";
import * as contenidoEn from "@/lib/content-en";

/** Plan(es), automatización(es) y preguntas frecuentes del idioma. Misma
    forma en los dos (ver `content.ts` y `content-en.ts`). Solo para
    Server Components: los componentes de cliente reciben estos datos por
    props, para no cargar todo `content.ts` en el navegador. */
export function getContenido(idioma: Idioma) {
  const c = idioma === "en" ? contenidoEn : contenidoEs;
  return {
    planes: c.planes,
    automatizaciones: c.automatizaciones,
    faq: c.faq,
  };
}
