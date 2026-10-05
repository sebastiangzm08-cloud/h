import type { Metadata } from "next";
import { paginaMeta } from "@/lib/seo/pagina-meta";
import { getCopy } from "@/lib/copy";
import { ContactoView } from "@/components/views/contacto-view";

const t = getCopy("en").meta.contacto;

export const metadata: Metadata = paginaMeta({
  titulo: t.titulo,
  descripcion: t.descripcion,
  ruta: "/en/contact",
  idioma: "en",
});

export default function ContactPage() {
  return <ContactoView idioma="en" />;
}
