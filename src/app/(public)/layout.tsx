import { getPublicSiteData } from "@/lib/siteSettings";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { WhatsAppFloatingButton } from "@/components/public/WhatsAppFloatingButton";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { org, settings } = await getPublicSiteData();

  return (
    <div className="bg-[#05070B] text-white min-h-screen flex flex-col">
      <PublicHeader orgName={org.name} whatsapp={org.whatsapp} logo={org.logo} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <PublicFooter org={org} settings={settings} />
      <WhatsAppFloatingButton whatsapp={org.whatsapp} />
    </div>
  );
}
