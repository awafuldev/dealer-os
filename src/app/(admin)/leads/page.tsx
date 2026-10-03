import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { LeadsPipelineView } from "@/components/LeadsPipelineView";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { user, org } = await requireSession();

  const [leadsDb, availableVehiclesDb, customersDb] = await Promise.all([
    prisma.lead.findMany({
      where: { organizationId: org.id },
      include: {
        customer: true,
        vehicle: {
          include: {
            images: {
              where: { isCover: true },
              take: 1,
            },
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.vehicle.findMany({
      where: { organizationId: org.id, status: { in: ["DISPONIBLE", "RESERVADO"] } },
      select: {
        id: true,
        brand: true,
        model: true,
        year: true,
        images: {
          where: { isCover: true },
          take: 1,
          select: { url: true },
        },
      },
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
    vehicleName: l.vehicle ? `${l.vehicle.brand} ${l.vehicle.model} ${l.vehicle.year}` : "Interés general",
    vehicleCover: l.vehicle?.images[0]?.url || null,
    source: l.source,
    stage: l.stage,
    notes: l.notes,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
    nextFollowUp: l.nextFollowUp ? l.nextFollowUp.toISOString() : null,
    lastActivityContent: l.activities[0]?.content || null,
    lastActivityDate: l.activities[0]?.createdAt ? l.activities[0].createdAt.toISOString() : null,
  }));

  const availableVehicles = availableVehiclesDb.map((v) => ({
    id: v.id,
    name: `${v.brand} ${v.model} ${v.year}`,
    image: v.images[0]?.url || null,
  }));

  return (
    <LeadsPipelineView
      leads={leads}
      orgName={org.name}
      availableVehicles={availableVehicles}
      customers={customersDb}
    />
  );
}
