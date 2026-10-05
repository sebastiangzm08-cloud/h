import { paginaMeta } from "@/lib/seo/pagina-meta";
import { getCopy } from "@/lib/copy";
import { HomeView } from "@/components/views/home-view";

const t = getCopy("en").meta.home;

export const metadata = paginaMeta({
  titulo: t.titulo,
  descripcion: t.descripcion,
  ruta: "/en",
  idioma: "en",
});

export default function HomeEn() {
  return <HomeView idioma="en" />;
}
