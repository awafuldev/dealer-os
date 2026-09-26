import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { calculateVehicleFinancials } from "@/lib/financials";
import { FinanceView } from "@/components/FinanceView";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const { user, org } = await requireSession();

  // 1. Vehículos activos para capital
  const activeVehicles = await prisma.vehicle.findMany({
    where: {
      organizationId: org.id,
      status: { in: ["DISPONIBLE", "RESERVADO"] },
    },
    include: { expenses: true },
  });

  let investedInventory = 0;
  let expectedRevenue = 0;
  let projectedProfit = 0;

  activeVehicles.forEach((v) => {
    const fin = calculateVehicleFinancials(v.purchasePrice, v.expenses, v.salePrice);
    investedInventory += fin.totalCost;
    expectedRevenue += fin.salePrice;
    projectedProfit += fin.grossMargin;
  });

  // 2. Ventas y Margen Realizado
  const sales = await prisma.sale.findMany({
    where: { organizationId: org.id },
    include: {
      vehicle: {
        include: { expenses: true },
      },
    },
  });

  let salesVolumeTotal = 0;
  let realizedSalesProfit = 0;

  sales.forEach((s) => {
    salesVolumeTotal += s.finalPrice;
    const vFin = calculateVehicleFinancials(s.vehicle.purchasePrice, s.vehicle.expenses, s.finalPrice);
    realizedSalesProfit += vFin.grossMargin;
  });

  // 3. Desglose de Gastos en Vehículos por Categoría
  const allVehicleExpenses = await prisma.vehicleExpense.findMany({
    where: { vehicle: { organizationId: org.id } },
    include: { vehicle: true },
    orderBy: { date: "desc" },
  });

  const categoryMap: Record<string, number> = {};
  let totalVehicleExpenses = 0;

  allVehicleExpenses.forEach((exp) => {
    categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
    totalVehicleExpenses += exp.amount;
  });

  const vehicleExpensesBreakdown = Object.entries(categoryMap).map(([category, amount]) => ({
    category,
    amount,
  }));

  // 4. Gastos Operativos Generales
  const generalExpenses = await prisma.generalExpense.findMany({
    where: { organizationId: org.id },
    orderBy: { date: "desc" },
  });

  const totalOperatingExpenses = generalExpenses.reduce((acc, g) => acc + g.amount, 0);
  const netProfit = realizedSalesProfit - totalOperatingExpenses;

  const generalExpensesList = generalExpenses.map((g) => ({
    id: g.id,
    category: g.category,
    description: g.description,
    amount: g.amount,
    date: new Date(g.date).toLocaleDateString("es-DO"),
    notes: g.notes,
  }));

  // Vehículos para poder registrar gastos de vehículos si se desea
  const allVehicles = await prisma.vehicle.findMany({
    where: { organizationId: org.id },
    select: { id: true, brand: true, model: true, year: true },
    orderBy: { brand: "asc" },
  });

  const data = {
    investedInventory,
    expectedRevenue,
    projectedProfit,
    salesVolumeTotal,
    realizedSalesProfit,
    totalOperatingExpenses,
    totalVehicleExpenses,
    netProfit,
    vehicleExpensesBreakdown,
    generalExpensesList,
  };

  return (
    <FinanceView
      data={data}
      vehicles={allVehicles.map((v) => ({ id: v.id, name: `${v.brand} ${v.model} ${v.year}` }))}
    />
  );
}
