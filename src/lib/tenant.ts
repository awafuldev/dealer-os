import { prisma } from "./prisma";

export async function getDefaultOrganization() {
  try {
    let org = await prisma.organization.findFirst({
      include: {
        siteSettings: true,
      },
    });

    if (!org) {
      const orgName = process.env.DEALER_NAME || "Dealer OS";
      const orgPhone = process.env.DEALER_PHONE || "809-555-0100";
      const orgWhatsapp = process.env.DEALER_WHATSAPP || "8295550199";
      const orgEmail = process.env.DEALER_EMAIL || "contacto@dealer.com";

      org = await prisma.organization.create({
        data: {
          name: orgName,
          rnc: "131-45678-9",
          phone: orgPhone,
          whatsapp: orgWhatsapp,
          email: orgEmail,
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
          siteSettings: true,
        },
      });
    }

    return org;
  } catch (error) {
    console.error("Error en getDefaultOrganization:", error);
    return {
      id: "default-org",
      name: process.env.DEALER_NAME || "Dealer OS",
      rnc: "131-45678-9",
      phone: process.env.DEALER_PHONE || "809-555-0100",
      whatsapp: process.env.DEALER_WHATSAPP || "8295550199",
      email: process.env.DEALER_EMAIL || "contacto@dealer.com",
      address: "República Dominicana",
      logo: "/logo.png",
      createdAt: new Date(),
      updatedAt: new Date(),
      siteSettings: null,
    };
  }
}
