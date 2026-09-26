import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Gauge, Fuel, Palette, Settings2, Hash, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPublicSiteData } from "@/lib/siteSettings";
import { toPublicVehicle } from "@/lib/publicVehicle";
import { formatCurrencyRD } from "@/lib/financials";
import { VehicleGallery } from "@/components/public/VehicleGallery";
import { VehicleDetailActions } from "@/components/public/VehicleDetailActions";

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

  const specs = [
    { icon: Gauge, label: "Kilometraje", value: `${vehicle.mileage.toLocaleString("es-DO")} km` },
    { icon: Settings2, label: "Transmisión", value: vehicle.transmission },
    { icon: Fuel, label: "Combustible", value: vehicle.fuel },
    { icon: Palette, label: "Color", value: vehicle.color },
    { icon: Tag, label: "Tipo", value: vehicle.bodyType },
    { icon: Hash, label: "VIN", value: vehicle.vin },
  ].filter((s) => s.value);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-28 sm:pb-16">
      <Link
        href="/showroom#inventario"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al inventario
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3">
          <VehicleGallery images={vehicle.images} alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div>
            {vehicle.status === "RESERVADO" && (
              <span className="inline-block mb-3 bg-amber-500 text-black text-xs font-bold px-2.5 py-1 rounded-full">
                Reservado
              </span>
            )}
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-zinc-500 mt-0.5">{vehicle.year}</p>
            <p className="text-4xl font-bold text-white mt-4">{formatCurrencyRD(vehicle.price)}</p>
          </div>

          <VehicleDetailActions
            vehicle={{ id: vehicle.id, brand: vehicle.brand, model: vehicle.model, year: vehicle.year, price: vehicle.price }}
            whatsapp={org.whatsapp}
          />

          {specs.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              {specs.map((s) => (
                <div key={s.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5">
                  <s.icon className="w-4 h-4 text-[#F5B301] mb-1.5" />
                  <p className="text-[11px] text-zinc-500">{s.label}</p>
                  <p className="text-sm font-semibold text-white">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {vehicle.description && (
            <div className="pt-2">
              <h2 className="text-sm font-semibold text-white mb-2">Descripción</h2>
              <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">{vehicle.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
