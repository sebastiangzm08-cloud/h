import type { Idioma } from "@/lib/i18n";
import { es, type Copy } from "./es";
import { en } from "./en";

export type { Copy };

/** Textos de interfaz y de páginas, en el idioma pedido. */
export function getCopy(idioma: Idioma): Copy {
  return idioma === "en" ? en : es;
}
