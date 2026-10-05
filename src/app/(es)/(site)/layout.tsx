import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DraftBanner } from "@/components/draft-banner";
import { LanguageNotice } from "@/components/language-notice";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DraftBanner />
      <Navbar idioma="es" />
      <main className="flex-1">{children}</main>
      <Footer idioma="es" />
      <LanguageNotice />
    </>
  );
}
