"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function searchGlobalAction(query: string) {
  if (!query || query.trim().length < 2) {
    return { vehicles: [], customers: [], sales: [] };
  }

  const { user, org } = await requireSession();
  const cleanQ = query.trim().toLowerCase();

  const [vehicles, customers, sales] = await Promise.all([
    prisma.vehicle.findMany({
      where: {
        organizationId: org.id,
        OR: [
          { brand: { contains: cleanQ } },
          { model: { contains: cleanQ } },
          { plate: { contains: cleanQ } },
          { vin: { contains: cleanQ } },
        ],
      },
      select: {
        id: true,
        brand: true,
        model: true,
        year: true,
        plate: true,
        salePrice: true,
        status: true,
      },
      take: 5,
    }),
    prisma.customer.findMany({
      where: {
        organizationId: org.id,
        OR: [
          { name: { contains: cleanQ } },
          { whatsapp: { contains: cleanQ } },
          { cedulaOrRnc: { contains: cleanQ } },
        ],
      },
      select: {
        id: true,
        name: true,
        whatsapp: true,
        cedulaOrRnc: true,
      },
      take: 5,
    }),
    prisma.sale.findMany({
      where: {
        organizationId: org.id,
        OR: [
          { customer: { name: { contains: cleanQ } } },
          { vehicle: { model: { contains: cleanQ } } },
        ],
      },
      include: {
        vehicle: { select: { brand: true, model: true, year: true } },
        customer: { select: { name: true } },
      },
      take: 5,
    }),
  ]);

  return {
    vehicles: vehicles.map((v) => ({
      id: v.id,
      title: `${v.brand} ${v.model} ${v.year}`,
      subtitle: v.plate ? `Placa: ${v.plate}` : `RD$${v.salePrice.toLocaleString()}`,
      status: v.status,
      href: `/inventory/${v.id}`,
    })),
    customers: customers.map((c) => ({
      id: c.id,
      title: c.name,
      subtitle: `WA: ${c.whatsapp} • Cédula: ${c.cedulaOrRnc || "N/A"}`,
      href: `/customers`,
    })),
    sales: sales.map((s) => ({
      id: s.id,
      title: `${s.vehicle.brand} ${s.vehicle.model} -> ${s.customer.name}`,
      subtitle: `RD$${s.finalPrice.toLocaleString()} • Saldo: RD$${s.balance.toLocaleString()}`,
      href: `/sales`,
    })),
  };
}
