import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { calculateVehicleFinancials } from "@/lib/financials";
import { InventoryView } from "@/components/InventoryView";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const { user, org } = await requireSession();

  const vehiclesDb = await prisma.vehicle.findMany({
    where: { organizationId: org.id },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
      expenses: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const vehicles = vehiclesDb.map((v) => {
    const fin = calculateVehicleFinancials(v.purchasePrice, v.expenses, v.salePrice);
    const coverImage =
      v.images.find((img) => img.isCover)?.url ||
      v.images[0]?.url ||
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80";

    return {
      id: v.id,
      brand: v.brand,
      model: v.model,
      year: v.year,
      vin: v.vin,
      plate: v.plate,
      color: v.color,
      transmission: v.transmission,
      fuel: v.fuel,
      mileage: v.mileage,
      purchasePrice: v.purchasePrice,
      salePrice: v.salePrice,
      status: v.status,
      totalExpenses: fin.totalExpenses,
      totalCost: fin.totalCost,
      grossMargin: fin.grossMargin,
      roiPercentage: fin.roiPercentage,
      coverImage,
      isPublished: v.isPublished,
    };
  });

  return <InventoryView vehicles={vehicles} />;
}
