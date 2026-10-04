import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPublicSiteData } from "@/lib/siteSettings";
import { toPublicVehicle } from "@/lib/publicVehicle";
import { formatCurrencyRD } from "@/lib/financials";
import { VehicleDetailViewClient } from "@/components/public/VehicleDetailViewClient";

export const dynamic = "force-dynamic";

async function loadVehicle(slug: string) {
  const { org } = await getPublicSiteData();
  const vehicleDb = await prisma.vehicle.findFirst({
    where: { organizationId: org.id, slug, isPublished: true },
    include: { images: { orderBy: { order: "asc" } } },
  });
  return { org, vehicleDb };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { org, vehicleDb } = await loadVehicle(slug);

  if (!vehicleDb) {
    return { title: `Vehículo no encontrado — ${org.name}` };
  }

  const title = `${vehicleDb.brand} ${vehicleDb.model} ${vehicleDb.year} — ${org.name}`;
  const description =
    vehicleDb.description ||
    `${vehicleDb.brand} ${vehicleDb.model} ${vehicleDb.year} disponible en ${org.name} por ${formatCurrencyRD(vehicleDb.salePrice)}.`;
  const image = vehicleDb.images[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
      type: "website",
    },
  };
}
export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { org, vehicleDb } = await loadVehicle(slug);

  if (!vehicleDb) notFound();

  const vehicle = toPublicVehicle(vehicleDb);

  return <VehicleDetailViewClient vehicle={vehicle} whatsapp={org.whatsapp} />;
}
