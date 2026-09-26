import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { CustomersView } from "@/components/CustomersView";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const { user, org } = await requireSession();

  const customersDb = await prisma.customer.findMany({
    where: { organizationId: org.id },
    include: {
      leads: true,
      sales: true,
      reservations: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const availableVehiclesDb = await prisma.vehicle.findMany({
    where: {
      organizationId: org.id,
      status: { in: ["DISPONIBLE", "RESERVADO"] },
    },
    select: { id: true, brand: true, model: true, year: true },
    orderBy: { brand: "asc" },
  });

  const customers = customersDb.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    whatsapp: c.whatsapp,
    email: c.email,
    cedulaOrRnc: c.cedulaOrRnc,
    budget: c.budget,
    notes: c.notes,
    leadsCount: c.leads.length,
    salesCount: c.sales.length,
    reservationsCount: c.reservations.length,
    createdAt: new Date(c.createdAt).toLocaleDateString("es-DO"),
  }));

  const availableVehicles = availableVehiclesDb.map((v) => ({
    id: v.id,
    name: `${v.brand} ${v.model} ${v.year}`,
  }));

  return (
    <CustomersView
      customers={customers}
      availableVehicles={availableVehicles}
      orgName={org.name}
    />
  );
}
