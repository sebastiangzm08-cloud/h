import { Sidebar } from "@/components/portal/sidebar";
import { MobileTopbar } from "@/components/portal/mobile-topbar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] bg-paper">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
