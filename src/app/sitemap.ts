import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganization } from "@/lib/tenant";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.SITE_URL || "https://kiryauto.com";

  try {
    const org = await getDefaultOrganization();
    const vehicles = await prisma.vehicle.findMany({
      where: { organizationId: org.id, isPublished: true },
      select: { slug: true, updatedAt: true },
    });

    return [
      {
        url: `${baseUrl}/showroom`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      ...vehicles
        .filter((v) => v.slug)
        .map((v) => ({
          url: `${baseUrl}/showroom/vehiculos/${v.slug}`,
          lastModified: v.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })),
    ];
  } catch {
    return [{ url: `${baseUrl}/showroom`, lastModified: new Date() }];
  }
}
