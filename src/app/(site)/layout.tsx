import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DraftBanner } from "@/components/draft-banner";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DraftBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
