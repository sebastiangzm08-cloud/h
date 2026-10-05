import type { Metadata } from "next";
import { paginaMeta } from "@/lib/seo/pagina-meta";
import { getCopy } from "@/lib/copy";
import { DiagnosticoView } from "@/components/views/diagnostico-view";

const t = getCopy("en").meta.diagnostico;

export const metadata: Metadata = paginaMeta({
  titulo: t.titulo,
  descripcion: t.descripcion,
  ruta: "/en/diagnostic",
  idioma: "en",
});

/* Estática: no lee `?plan=` (hay un solo plan). */
export default function DiagnosticPage() {
  return <DiagnosticoView idioma="en" />;
}
