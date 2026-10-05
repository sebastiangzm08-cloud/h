import type { Metadata } from "next";
import { paginaMeta } from "@/lib/seo/pagina-meta";
import { getCopy } from "@/lib/copy";
import { planes } from "@/lib/content";
import { DiagnosticoView } from "@/components/views/diagnostico-view";

const t = getCopy("es").meta.diagnostico;

export const metadata: Metadata = paginaMeta({
  titulo: t.titulo,
  descripcion: t.descripcion,
  ruta: "/diagnostico",
});

export default async function DiagnosticoPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; periodo?: string }>;
}) {
  const params = await searchParams;
  const plan = planes.find((p) => p.id === params.plan);
  const periodoInicial = params.periodo === "anual" ? "anual" : "mensual";

  return (
    <DiagnosticoView idioma="es" plan={plan} periodoInicial={periodoInicial} />
  );
}
