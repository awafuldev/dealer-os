/**
 * prisma/seed.ts
 *
 * Script de inicialización. Crea la organización y el único usuario
 * administrador a partir de variables de entorno. NO crea datos de demostración.
 *
 * Variables de entorno requeridas (se pueden poner en .env):
 *   ADMIN_EMAIL     – correo del administrador
 *   ADMIN_PASSWORD  – contraseña en texto plano (se hashea aquí mismo)
 *   ADMIN_NAME      – nombre del administrador (opcional, default "Administrador")
 *
 * Variables opcionales para pre-configurar la organización:
 *   DEALER_NAME      – nombre del dealer
 *   DEALER_PHONE     – teléfono
 *   DEALER_WHATSAPP  – número de WhatsApp (solo dígitos)
 *   DEALER_EMAIL     – correo del dealer
 *
 * Uso:
 *   npm run seed
 */

import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  // ─── Leer variables de entorno ──────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "Administrador";

  if (!adminEmail || !adminPassword) {
    console.error("❌ ERROR: Define ADMIN_EMAIL y ADMIN_PASSWORD en tu .env antes de correr el seed.");
    process.exit(1);
  }

  if (adminPassword.length < 8) {
    console.error("❌ ERROR: ADMIN_PASSWORD debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  const dealerName     = process.env.DEALER_NAME     || "Mi Dealer";
  const dealerPhone    = process.env.DEALER_PHONE     || "";
  const dealerWhatsapp = process.env.DEALER_WHATSAPP  || "";
  const dealerEmail    = process.env.DEALER_EMAIL     || "";

  console.log("🌱 Iniciando seed de Dealer OS...");
  console.log(`   Organización: ${dealerName}`);
  console.log(`   Admin email : ${adminEmail}`);

  // ─── Organización ───────────────────────────────────────────────────────────
  let org = await prisma.organization.findFirst();

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name:      dealerName,
        phone:     dealerPhone    || null,
        whatsapp:  dealerWhatsapp || null,
        email:     dealerEmail    || null,
        logo:      null,
        siteSettings: {
          create: {
            heroHeadline:    "Tu próximo vehículo, con total confianza",
            heroSubheadline: "Inventario seleccionado y listo para entrega en República Dominicana.",
            visitHours:      "Lunes a sábado, 9:00 a.m. – 6:00 p.m.",
            minDownPaymentPct:  20,
            maxTermMonths:      60,
            estimatedRatePct:   14.5,
            financingBanks: "Banco Popular, BHD, Banreservas, Scotiabank",
          },
        },
      },
    });
    console.log(`✅ Organización creada: ${org.name} (${org.id})`);
  } else {
    console.log(`ℹ️  Organización existente: ${org.name} (${org.id}) — no se modifica.`);
  }

  // ─── Usuario administrador ───────────────────────────────────────────────────
  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        organizationId: org.id,
        name:           adminName,
        email:          adminEmail,
        passwordHash,
        role:           "ADMIN",
        active:         true,
      },
    });
    console.log(`✅ Usuario administrador creado: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Usuario ya existe: ${adminEmail} — contraseña no se modifica.`);
  }

  console.log("🚀 Seed completado. El dealer está listo para operar.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
