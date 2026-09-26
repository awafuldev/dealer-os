import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { SalesView } from "@/components/SalesView";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const { user, org } = await requireSession();

  const salesDb = await prisma.sale.findMany({
    where: { organizationId: org.id },
    include: {
      vehicle: true,
      customer: true,
      seller: true,
      payments: { orderBy: { date: "desc" } },
    },
    orderBy: { saleDate: "desc" },
  });

  const availableVehiclesDb = await prisma.vehicle.findMany({
    where: {
      organizationId: org.id,
      status: { in: ["DISPONIBLE", "RESERVADO"] },
    },
    select: { id: true, brand: true, model: true, year: true, salePrice: true },
    orderBy: { brand: "asc" },
  });

  const customersDb = await prisma.customer.findMany({
    where: { organizationId: org.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const sales = salesDb.map((s) => ({
    id: s.id,
    vehicleName: `${s.vehicle.brand} ${s.vehicle.model} ${s.vehicle.year}`,
    customerName: s.customer.name,
    sellerName: s.seller ? s.seller.name : "Equipo Dealer",
    finalPrice: s.finalPrice,
    downPayment: s.downPayment,
    financedAmount: s.financedAmount,
    balance: s.balance,
    status: s.status,
    saleDate: new Date(s.saleDate).toLocaleDateString("es-DO"),
    paymentsCount: s.payments.length,
    payments: s.payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      method: p.method,
      receipt: p.receipt,
      date: new Date(p.date).toLocaleDateString("es-DO"),
      notes: p.notes,
    })),
  }));

  const availableVehicles = availableVehiclesDb.map((v) => ({
    id: v.id,
    name: `${v.brand} ${v.model} ${v.year}`,
    salePrice: v.salePrice,
  }));

  return (
    <SalesView
      sales={sales}
      availableVehicles={availableVehicles}
      customers={customersDb}
    />
  );
}
