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
    <div className="bg-[#0B0E14] text-white min-h-screen flex flex-col relative selection:bg-[#F5C518] selection:text-black">
      {/* Luces de fondo ambientales estilo MotorLand */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(245,197,24,0.12),transparent_70%)] blur-3xl opacity-75" />
        <div className="absolute top-[40%] -left-60 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,197,24,0.06),transparent_65%)] blur-3xl" />
        <div className="absolute top-[70%] -right-60 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(255,210,46,0.06),transparent_65%)] blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <PublicHeader orgName={org.name} whatsapp={org.whatsapp} logo={org.logo} />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <PublicFooter org={org} settings={settings} />
        <WhatsAppFloatingButton whatsapp={org.whatsapp} />
      </div>
    </div>
  );
}
