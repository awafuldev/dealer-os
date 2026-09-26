import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.SITE_URL || "https://kiryauto.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/showroom"],
        disallow: [
          "/inventory",
          "/leads",
          "/customers",
          "/sales",
          "/finance",
          "/contracts",
          "/audit",
          "/settings",
          "/api",
          "/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
