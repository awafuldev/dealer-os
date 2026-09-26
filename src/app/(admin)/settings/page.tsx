import { getPublicSiteData } from "@/lib/siteSettings";
import { requireSession } from "@/lib/auth";
import { SiteSettingsView } from "@/components/SiteSettingsView";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user } = await requireSession();
  const { org, settings } = await getPublicSiteData();

  return (
    <SiteSettingsView
      org={{
        name: org.name,
        rnc: org.rnc,
        logo: org.logo,
        phone: org.phone,
        whatsapp: org.whatsapp,
        address: org.address,
        email: org.email,
      }}
      settings={settings}
    />
  );
}
