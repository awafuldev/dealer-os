import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { DashboardView } from "@/components/DashboardView";
import { calculateVehicleFinancials } from "@/lib/financials";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { user, org } = await requireSession();

  // 1. Vehículos de la organización
  const vehicles = await prisma.vehicle.findMany({
    where: { organizationId: org.id },
    include: {
      expenses: true,
      sales: true,
      images: {
        orderBy: [{ isCover: "desc" }, { order: "asc" }],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Conteo de vehículos
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.status === "DISPONIBLE").length;
  const reservedVehicles = vehicles.filter((v) => v.status === "RESERVADO").length;
  const soldVehicles = vehicles.filter((v) => v.status === "VENDIDO").length;

  // 3. Cálculos de inventario activo
  const activeVehicles = vehicles.filter((v) => v.status === "DISPONIBLE" || v.status === "RESERVADO");
  let investedCapital = 0;
  let potentialRevenue = 0;
  let potentialProfit = 0;

  activeVehicles.forEach((v) => {
    const fin = calculateVehicleFinancials(v.purchasePrice, v.expenses, v.salePrice);
    investedCapital += fin.totalCost;
    potentialRevenue += fin.salePrice;
    potentialProfit += fin.grossMargin;
  });

  // 4. Ventas y margen realizado
  const sales = await prisma.sale.findMany({
    where: { organizationId: org.id },
    include: {
      vehicle: {
        include: {
          expenses: true,
        },
      },
      customer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  let monthlySalesVolume = 0;
  let monthlySalesProfit = 0;

  sales.forEach((s) => {
    monthlySalesVolume += s.finalPrice;
    const vFin = calculateVehicleFinancials(s.vehicle.purchasePrice, s.vehicle.expenses, s.finalPrice);
    monthlySalesProfit += vFin.grossMargin;
  });

  // 5. Leads y Clientes
  const totalCustomers = await prisma.customer.count({
    where: { organizationId: org.id },
  });

  const activeLeadsCount = await prisma.lead.count({
    where: {
      organizationId: org.id,
      stage: { in: ["NUEVO", "CONTACTADO", "INTERESADO", "NEGOCIACION", "RESERVADO"] },
    },
  });

  const pendingLeads = await prisma.lead.findMany({
    where: {
      organizationId: org.id,
      stage: { in: ["NUEVO", "CONTACTADO", "INTERESADO", "NEGOCIACION", "RESERVADO"] },
    },
    include: {
      customer: true,
      vehicle: true,
    },
    take: 5,
    orderBy: { updatedAt: "desc" },
  });

  const pendingFollowUps = pendingLeads.map((lead) => ({
    id: lead.id,
    customerName: lead.customer.name,
    whatsapp: lead.customer.whatsapp,
    vehicleName: lead.vehicle ? `${lead.vehicle.brand} ${lead.vehicle.model} ${lead.vehicle.year}` : "Interés general",
    notes: lead.notes,
    stage: lead.stage,
  }));

  // 6. Inventario Reciente (últimos 4 vehículos)
  const recentVehicles = vehicles.slice(0, 4).map((v) => ({
    id: v.id,
    brand: v.brand,
    model: v.model,
    year: v.year,
    mileage: v.mileage,
    salePrice: v.salePrice,
    status: v.status,
    coverImage: v.images[0]?.url || "/placeholder-car.jpg",
  }));

  // 7. Actividad Reciente desde AuditLog
  const auditLogs = await prisma.auditLog.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const recentActivity = auditLogs.map((log) => ({
    id: log.id,
    action: log.action,
    entity: log.entity,
    details: log.details || "Acción registrada en el sistema",
    createdAt: log.createdAt.toISOString(),
  }));

  const data = {
    counts: {
      totalVehicles,
      availableVehicles,
      reservedVehicles,
      soldVehicles,
      activeLeads: activeLeadsCount,
      totalCustomers,
    },
    financials: {
      investedCapital,
      potentialRevenue,
      potentialProfit,
      monthlySalesVolume,
      monthlySalesProfit,
    },
    recentVehicles,
    recentActivity,
    pendingFollowUps,
  };

  return <DashboardView data={data} orgName={org.name} />;
}
