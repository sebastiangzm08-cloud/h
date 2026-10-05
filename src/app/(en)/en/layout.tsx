import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DraftBanner } from "@/components/draft-banner";

/* Chrome del sitio en inglés. Sin aviso de cambio de idioma: quien ya está
   en /en tiene el selector ES | EN en la barra. */
export default function SiteLayoutEn({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DraftBanner />
      <Navbar idioma="en" />
      <main className="flex-1">{children}</main>
      <Footer idioma="en" />
    </>
  );
}
