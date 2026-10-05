import type { Metadata } from "next";
import { paginaMeta } from "@/lib/seo/pagina-meta";
import { getCopy } from "@/lib/copy";
import { QueAutomatizamosView } from "@/components/views/que-automatizamos-view";

const t = getCopy("en").meta.queAutomatizamos;

export const metadata: Metadata = paginaMeta({
  titulo: t.titulo,
  descripcion: t.descripcion,
  ruta: "/en/what-we-automate",
  idioma: "en",
});

export default function WhatWeAutomatePage() {
  return <QueAutomatizamosView idioma="en" />;
}
