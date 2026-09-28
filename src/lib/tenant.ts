import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export async function getDefaultOrganization() {
  try {
    let org = await prisma.organization.findFirst({
      include: {
        users: true,
      },
    });

    if (!org) {
      console.log("Iniciando creación de organización por defecto...");
      org = await prisma.organization.create({
        data: {
          name: "Kiry Auto",
          rnc: "131-45678-9",
          phone: "809-555-0100",
          whatsapp: "8295550199",
          email: "contacto@kiryauto.com",
          logo: "/logo.png",
          siteSettings: {
            create: {
              heroHeadline: "Tu próximo vehículo con total confianza",
              heroSubheadline: "Vehículos inspeccionados y listos para entrega inmediata en República Dominicana.",
              visitHours: "Lunes a sábado, 9:00 a.m. – 6:00 p.m.",
              minDownPaymentPct: 20,
              maxTermMonths: 60,
              estimatedRatePct: 14.5,
              financingBanks: "Banco Popular, BHD, Banreservas, Scotiabank",
            },
          },
        },
        include: {
          users: true,
        },
      });

      const hash = await bcrypt.hash("admin123", 10);
      await prisma.user.create({
        data: {
          organizationId: org.id,
          name: "Administrador",
          email: "admin@dealer.com",
          passwordHash: hash,
          role: "ADMIN",
          active: true,
        },
      });

      org =
        (await prisma.organization.findUnique({
          where: { id: org.id },
          include: { users: true },
        })) || org;
    }

    return org;
  } catch (error) {
    console.error("Error en getDefaultOrganization:", error);
    // Retorno defensivo para evitar que la página pública caiga en error 500
    return {
      id: "default-org",
      name: "Kiry Auto",
      rnc: "131-45678-9",
      phone: "809-555-0100",
      whatsapp: "8295550199",
      email: "contacto@kiryauto.com",
      address: "Av. 27 de Febrero, Santo Domingo",
      logo: "/logo.png",
      createdAt: new Date(),
      updatedAt: new Date(),
      users: [],
    };
  }
}
