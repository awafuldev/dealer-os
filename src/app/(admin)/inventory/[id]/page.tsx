import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { calculateVehicleFinancials } from "@/lib/financials";
import { VehicleDetailView } from "@/components/VehicleDetailView";

export const dynamic = "force-dynamic";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, org } = await requireSession();

  const vehicleDb = await prisma.vehicle.findFirst({
    where: { id, organizationId: org.id },
    include: {
      images: { orderBy: { order: "asc" } },
      expenses: { orderBy: { date: "desc" } },
      reservations: {
        include: { customer: true },
        orderBy: { createdAt: "desc" },
      },
      sales: {
        include: { customer: true },
        take: 1,
      },
    },
  });

  if (!vehicleDb) {
    notFound();
  }

  const fin = calculateVehicleFinancials(
    vehicleDb.purchasePrice,
    vehicleDb.expenses,
    vehicleDb.salePrice
  );

  const customersDb = await prisma.customer.findMany({
    where: { organizationId: org.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const vehicle = {
    id: vehicleDb.id,
    brand: vehicleDb.brand,
    model: vehicleDb.model,
    year: vehicleDb.year,
    vin: vehicleDb.vin,
    plate: vehicleDb.plate,
    color: vehicleDb.color,
    transmission: vehicleDb.transmission,
    fuel: vehicleDb.fuel,
    drivetrain: vehicleDb.drivetrain,
    mileage: vehicleDb.mileage,
    purchasePrice: vehicleDb.purchasePrice,
    salePrice: vehicleDb.salePrice,
    status: vehicleDb.status,
    notes: vehicleDb.notes,
    slug: vehicleDb.slug,
    bodyType: vehicleDb.bodyType,
    description: vehicleDb.description,
    vinPublic: vehicleDb.vinPublic,
    featuredOnHome: vehicleDb.featuredOnHome,
    isPublished: vehicleDb.isPublished,
    images: vehicleDb.images.map((img) => ({ id: img.id, url: img.url, isCover: img.isCover })),
    expenses: vehicleDb.expenses.map((exp) => ({
      id: exp.id,
      category: exp.category,
      description: exp.description,
      amount: exp.amount,
      date: new Date(exp.date).toLocaleDateString("es-DO"),
    })),
    reservations: vehicleDb.reservations.map((r) => ({
      id: r.id,
      customerName: r.customer.name,
      amount: r.amount,
      status: r.status,
      date: new Date(r.createdAt).toLocaleDateString("es-DO"),
    })),
    sale: vehicleDb.sales[0]
      ? {
          id: vehicleDb.sales[0].id,
          customerName: vehicleDb.sales[0].customer.name,
          finalPrice: vehicleDb.sales[0].finalPrice,
          balance: vehicleDb.sales[0].balance,
          saleDate: new Date(vehicleDb.sales[0].saleDate).toLocaleDateString("es-DO"),
        }
      : null,
    totalExpenses: fin.totalExpenses,
    totalCost: fin.totalCost,
    grossMargin: fin.grossMargin,
    roiPercentage: fin.roiPercentage,
  };

  return <VehicleDetailView vehicle={vehicle} customers={customersDb} />;
}
