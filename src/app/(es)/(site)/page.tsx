import { paginaMeta } from "@/lib/seo/pagina-meta";
import { getCopy } from "@/lib/copy";
import { HomeView } from "@/components/views/home-view";

const t = getCopy("es").meta.home;

export const metadata = paginaMeta({
  titulo: t.titulo,
  descripcion: t.descripcion,
  ruta: "/",
});

export default function Home() {
  return <HomeView idioma="es" />;
}
