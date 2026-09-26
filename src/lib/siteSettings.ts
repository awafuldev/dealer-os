import { prisma } from "@/lib/prisma";
import { getDefaultOrganization } from "@/lib/tenant";

/**
 * Loads the organization plus its configurable public-site settings.
 * SiteSettings is 1-1 with Organization but may not exist yet, so this
 * always returns a fully-populated (possibly all-null) object instead of
 * forcing every caller to null-check the relation.
 */
export async function getPublicSiteData() {
  const org = await getDefaultOrganization();

  const settings = await prisma.siteSettings.findUnique({
    where: { organizationId: org.id },
  });

  return {
    org,
    settings: settings ?? {
      id: "",
      organizationId: org.id,
      heroHeadline: null,
      heroSubheadline: null,
      instagramHandle: null,
      instagramUrl: null,
      facebookUrl: null,
      mapEmbedUrl: null,
      visitHours: null,
      trustTitle1: null,
      trustText1: null,
      trustTitle2: null,
      trustText2: null,
      trustTitle3: null,
      trustText3: null,
      trustTitle4: null,
      trustText4: null,
      trustTitle5: null,
      trustText5: null,
      trustTitle6: null,
      trustText6: null,
      financingIntro: null,
      financingBanks: null,
      minDownPaymentPct: null,
      maxTermMonths: null,
      estimatedRatePct: null,
      updatedAt: new Date(),
    },
  };
}

export type PublicSiteSettings = Awaited<ReturnType<typeof getPublicSiteData>>["settings"];
