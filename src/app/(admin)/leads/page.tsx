import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { LeadsPipelineView } from "@/components/LeadsPipelineView";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { user, org } = await requireSession();

  const [leadsDb, availableVehicles, customersDb] = await Promise.all([
    prisma.lead.findMany({
      where: { organizationId: org.id },
      include: {
        customer: true,
        vehicle: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vehicle.findMany({
      where: { organizationId: org.id, status: { in: ["DISPONIBLE", "RESERVADO"] } },
      select: { id: true, brand: true, model: true, year: true },
      orderBy: { brand: "asc" },
    }),
    prisma.customer.findMany({
      where: { organizationId: org.id },
      select: { id: true, name: true, whatsapp: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const leads = leadsDb.map((l) => ({
    id: l.id,
    customerId: l.customerId,
    customerName: l.customer.name,
    whatsapp: l.customer.whatsapp,
    vehicleId: l.vehicleId,
    vehicleName: l.vehicle ? `${l.vehicle.brand} ${l.vehicle.model} ${l.vehicle.year}` : "Consulta general",
    source: l.source,
    stage: l.stage,
    notes: l.notes,
    followUpFormatted: l.nextFollowUp
      ? new Date(l.nextFollowUp).toLocaleDateString("es-DO", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null,
  }));

  return (
    <LeadsPipelineView
      leads={leads}
      orgName={org.name}
      availableVehicles={availableVehicles.map((v) => ({ id: v.id, name: `${v.brand} ${v.model} ${v.year}` }))}
      customers={customersDb}
    />
  );
}
