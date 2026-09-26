import type { Metadata } from "next";
import { UserProvider } from "@/components/UserContext";
import { Sidebar } from "@/components/Sidebar";
import { QuickActionModal } from "@/components/QuickActionModal";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dealer OS — Panel de Gestión",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, org } = await requireSession();

  return (
    <div className="bg-[#f4f5f6] text-[#131517] min-h-screen flex flex-col md:flex-row">
      <UserProvider role={user.role} userName={user.name} userEmail={user.email}>
        <Sidebar orgName={org.name} />
        <main className="flex-1 md:pl-64 pb-24 md:pb-8 flex flex-col min-w-0">
          {children}
        </main>
        <QuickActionModal />
      </UserProvider>
    </div>
  );
}
