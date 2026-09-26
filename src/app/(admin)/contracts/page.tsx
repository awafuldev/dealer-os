import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { DocumentsView } from "@/components/DocumentsView";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const { user, org } = await requireSession();

  const [documentsDb, salesDb, customersDb, vehiclesDb] = await Promise.all([
    prisma.document.findMany({
      where: { organizationId: org.id },
      include: {
        customer: true,
        vehicle: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sale.findMany({
      where: { organizationId: org.id },
      include: {
        vehicle: true,
        customer: true,
      },
      orderBy: { saleDate: "desc" },
    }),
    prisma.customer.findMany({
      where: { organizationId: org.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.vehicle.findMany({
      where: { organizationId: org.id },
      select: { id: true, brand: true, model: true, year: true },
      orderBy: { brand: "asc" },
    }),
  ]);

  const documents = documentsDb.map((d) => ({
    id: d.id,
    title: d.title,
    category: d.category,
    status: d.status,
    fileUrl: d.fileUrl,
    fileSize: d.fileSize,
    uploadedBy: d.uploadedBy,
    createdAt: new Date(d.createdAt).toLocaleDateString("es-DO"),
    customerName: d.customer ? d.customer.name : null,
    vehicleName: d.vehicle ? `${d.vehicle.brand} ${d.vehicle.model} ${d.vehicle.year}` : null,
    saleId: d.saleId,
    notes: d.notes,
  }));

  const sales = salesDb.map((s) => ({
    id: s.id,
    vehicleName: `${s.vehicle.brand} ${s.vehicle.model} ${s.vehicle.year}`,
    customerName: s.customer.name,
    finalPrice: s.finalPrice,
    saleDate: new Date(s.saleDate).toLocaleDateString("es-DO"),
  }));

  return (
    <DocumentsView
      documents={documents}
      sales={sales}
      customers={customersDb}
      vehicles={vehiclesDb.map((v) => ({ id: v.id, name: `${v.brand} ${v.model} ${v.year}` }))}
    />
  );
}
