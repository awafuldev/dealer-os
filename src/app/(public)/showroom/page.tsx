import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getPublicSiteData } from "@/lib/siteSettings";
import { toPublicVehicle } from "@/lib/publicVehicle";
import { Hero } from "@/components/public/Hero";
import { InventorySection } from "@/components/public/InventorySection";
import { TrustSection } from "@/components/public/TrustSection";
import { ProcessSection } from "@/components/public/ProcessSection";
import { FinancingSection } from "@/components/public/FinancingSection";
import { TestDriveSection } from "@/components/public/TestDriveSection";
import { RequirementsSection } from "@/components/public/RequirementsSection";
import { InstagramSection } from "@/components/public/InstagramSection";
import { ContactSection } from "@/components/public/ContactSection";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { org, settings } = await getPublicSiteData();
  const description =
    settings.heroSubheadline ||
    `Inventario de vehículos de ${org.name}. Vehículos seleccionados, financiamiento y atención directa por WhatsApp.`;

  return {
    title: `${org.name} — Showroom de Vehículos`,
    description,
    openGraph: {
      title: `${org.name} — Showroom de Vehículos`,
      description,
      type: "website",
    },
  };
}

export default async function ShowroomPage() {
  const { org, settings } = await getPublicSiteData();

  const vehiclesDb = await prisma.vehicle.findMany({
    where: { organizationId: org.id, isPublished: true },
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  const vehicles = vehiclesDb.map(toPublicVehicle);
  const featuredVehicle = vehicles.find((v) => v.featuredOnHome) || vehicles[0] || null;
  const otherSlideVehicles = vehicles.filter((v) => v.id !== featuredVehicle?.id).slice(0, 2);
  const slideImages = [
    "/brand/hero-showroom.jpg",
    ...otherSlideVehicles.slice(0, 1).map((v) => v.coverImage),
  ].filter(Boolean).slice(0, 2);
  const brandCount = new Set(vehicles.map((v) => v.brand)).size;
  const hasFinancing =
    settings.minDownPaymentPct != null && settings.maxTermMonths != null && settings.estimatedRatePct != null;

  return (
    <>
      <Hero
        orgName={org.name}
        whatsapp={org.whatsapp}
        settings={settings}
        slideImages={slideImages}
      />
      <InventorySection vehicles={vehicles} whatsapp={org.whatsapp} orgName={org.name} />
      <TrustSection orgName={org.name} settings={settings} />
      <ProcessSection />
      <FinancingSection whatsapp={org.whatsapp} settings={settings} />
      <TestDriveSection
        vehicles={vehicles.map((v) => ({ id: v.id, brand: v.brand, model: v.model, year: v.year }))}
        whatsapp={org.whatsapp}
        visitHours={settings.visitHours}
        address={org.address}
      />
      <RequirementsSection whatsapp={org.whatsapp} minDownPaymentPct={settings.minDownPaymentPct} />
      <InstagramSection settings={settings} />
      <ContactSection org={org} settings={settings} />
    </>
  );
}
