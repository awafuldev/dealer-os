import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Iniciando Seed de datos dominicanos para Dealer OS...");

  // 1. Limpiar base de datos
  await prisma.auditLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.salePayment.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.leadActivity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vehicleExpense.deleteMany();
  await prisma.vehicleImage.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.generalExpense.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 2. Crear Organización Principal (Kiry Auto)
  const org = await prisma.organization.create({
    data: {
      name: "Kiry Auto",
      rnc: "131-45678-9",
      phone: "809-555-0100",
      whatsapp: "829-555-0199",
      email: "contacto@kiryauto.com",
      address: null, // Configúralo desde /settings cuando tengas la dirección real
      logo: "/logo.png",
    },
  });

  console.log(`✅ Organización creada: ${org.name} (${org.id})`);

  // 3. Crear Usuario Administrador Principal
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: "Administrador",
      email: "admin@dealer.com",
      passwordHash,
      role: "ADMIN",
      active: true,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: "Asesor de Ventas",
      email: "ventas@dealer.com",
      passwordHash,
      role: "SALES",
      active: true,
    },
  });

  const financeUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: "Gestor Financiero",
      email: "finanzas@dealer.com",
      passwordHash,
      role: "FINANCE",
      active: true,
    },
  });

  console.log(`✅ Usuarios creados: Admin (${admin.email}), Ventas (${salesUser.email}), Finanzas (${financeUser.email})`);

  // 4. Crear Vehículos representativos de RD
  const v1 = await prisma.vehicle.create({
    data: {
      organizationId: org.id,
      brand: "Toyota",
      model: "RAV4 XLE",
      year: 2022,
      vin: "2T3C1RFV4NW102938",
      plate: "G549210",
      color: "Blanco Perla",
      transmission: "Automática",
      fuel: "Gasolina",
      drivetrain: "AWD",
      mileage: 34500,
      purchasePrice: 1250000,
      salePrice: 1550000,
      status: "DISPONIBLE",
      acquisitionDate: new Date("2026-07-15"),
      notes: "Condiciones impecables. Sunroof, asientos en piel, pantalla carplay.",
      isPublished: true,
      slug: "toyota-rav4-xle-2022",
      bodyType: "SUV",
      description:
        "Toyota RAV4 XLE 2022 en condiciones impecables. Incluye sunroof, asientos en piel, pantalla táctil con CarPlay y mantenimientos al día. Ideal para familia, con espacio de carga amplio y tracción AWD.",
      vinPublic: true,
      featuredOnHome: true,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1581540222194-0defbeed7d88?auto=format&fit=crop&w=800&q=80", isCover: true, order: 1 },
          { url: "https://images.unsplash.com/photo-1568605117276-b6c17a1d0e9c?auto=format&fit=crop&w=800&q=80", isCover: false, order: 2 },
          { url: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80", isCover: false, order: 3 },
        ],
      },
      expenses: {
        create: [
          { category: "Traspaso", description: "Traspaso de matrícula DGII", amount: 15000 },
          { category: "Gomas", description: "Juego de 2 gomas traseras nuevas Michelin", amount: 20000 },
          { category: "Detailing", description: "Tratamiento cerámico y lavado profundo interior", amount: 8000 },
          { category: "Mecánica", description: "Cambio de aceite full sintético y filtros", amount: 12000 },
          { category: "Transporte", description: "Grúa desde Haina a Bella Vista", amount: 5000 },
          { category: "Otros", description: "Inspección mecánica y batería nueva", amount: 25000 },
        ],
      },
    },
  });

  const v2 = await prisma.vehicle.create({
    data: {
      organizationId: org.id,
      brand: "Honda",
      model: "CR-V EX-L",
      year: 2021,
      vin: "7FARW2H82ME091823",
      plate: "G483921",
      color: "Gris Moderno",
      transmission: "Automática",
      fuel: "Gasolina",
      drivetrain: "FWD",
      mileage: 48200,
      purchasePrice: 1100000,
      salePrice: 1380000,
      status: "RESERVADO",
      acquisitionDate: new Date("2026-06-20"),
      notes: "Un solo dueño en RD. Llave inteligente, compuerta eléctrica.",
      isPublished: true,
      slug: "honda-cr-v-ex-l-2021",
      bodyType: "SUV",
      description:
        "Honda CR-V EX-L 2021, un solo dueño en República Dominicana. Llave inteligente, compuerta eléctrica y cámara de reversa. Actualmente reservada.",
      vinPublic: false,
      featuredOnHome: false,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=800&q=80", isCover: true, order: 1 },
        ],
      },
      expenses: {
        create: [
          { category: "Traspaso", description: "Impuestos DGII", amount: 14000 },
          { category: "Detailing", description: "Pulido exterior y limpieza de alfombras", amount: 7000 },
        ],
      },
    },
  });

  const v3 = await prisma.vehicle.create({
    data: {
      organizationId: org.id,
      brand: "Hyundai",
      model: "Tucson GL",
      year: 2022,
      vin: "KM8JM3AC1NU772819",
      plate: "G602931",
      color: "Negro Obsidiana",
      transmission: "Automática",
      fuel: "Gasolina",
      drivetrain: "FWD",
      mileage: 29000,
      purchasePrice: 1180000,
      salePrice: 1460000,
      status: "VENDIDO",
      acquisitionDate: new Date("2026-08-01"),
      notes: "Vehículo vendido este mes a crédito con Banco Popular.",
      isPublished: false,
      slug: "hyundai-tucson-gl-2022",
      bodyType: "SUV",
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=800&q=80", isCover: true, order: 1 },
        ],
      },
      expenses: {
        create: [
          { category: "Traspaso", description: "Traspaso y marbete", amount: 16000 },
          { category: "Mecánica", description: "Mantenimiento general", amount: 9500 },
        ],
      },
    },
  });

  const v4 = await prisma.vehicle.create({
    data: {
      organizationId: org.id,
      brand: "Toyota",
      model: "Corolla LE",
      year: 2020,
      vin: "4T1B11HK5LU827163",
      plate: "A938210",
      color: "Plata Metálico",
      transmission: "Automática",
      fuel: "Gasolina",
      drivetrain: "FWD",
      mileage: 62000,
      purchasePrice: 780000,
      salePrice: 975000,
      status: "DISPONIBLE",
      acquisitionDate: new Date("2026-05-10"), // > 90 días en inventario para alerta
      notes: "Económico y fiable. Requiere revisión de precio por días en inventario.",
      isPublished: true,
      slug: "toyota-corolla-le-2020",
      bodyType: "Sedán",
      description:
        "Toyota Corolla LE 2020, económico y confiable. Excelente opción de entrada, bajo consumo de combustible y mantenimientos accesibles.",
      vinPublic: false,
      featuredOnHome: false,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80", isCover: true, order: 1 },
        ],
      },
      expenses: {
        create: [
          { category: "Traspaso", description: "Traspaso", amount: 12000 },
          { category: "Gomas", description: "Gomas delanteras", amount: 14000 },
        ],
      },
    },
  });

  const v5 = await prisma.vehicle.create({
    data: {
      organizationId: org.id,
      brand: "Kia",
      model: "Sportage LX",
      year: 2021,
      vin: "KNDPM3AC8M7281902",
      plate: "G521094",
      color: "Azul Marino",
      transmission: "Automática",
      fuel: "Gasolina",
      drivetrain: "FWD",
      mileage: 41000,
      purchasePrice: 990000,
      salePrice: 1240000,
      status: "DISPONIBLE",
      acquisitionDate: new Date("2026-07-28"),
      notes: "Cámara de reversa, pantalla táctil, mantenimientos al día.",
      isPublished: true,
      slug: "kia-sportage-lx-2021",
      bodyType: "SUV",
      description:
        "Kia Sportage LX 2021 con cámara de reversa, pantalla táctil y mantenimientos al día. Buen equilibrio entre espacio, consumo y confort.",
      vinPublic: false,
      featuredOnHome: false,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80", isCover: true, order: 1 },
        ],
      },
    },
  });

  console.log(`✅ 5 Vehículos creados con fotos y gastos.`);

  // 5. Crear Clientes
  const c1 = await prisma.customer.create({
    data: {
      organizationId: org.id,
      name: "Juan Pérez",
      phone: "809-555-1234",
      whatsapp: "8295551234",
      email: "juan.perez@gmail.com",
      cedulaOrRnc: "001-1829384-5",
      budget: 1600000,
      notes: "Interesado en SUV familiar. Busca financiamiento con inicial de RD$400,000.",
    },
  });

  const c2 = await prisma.customer.create({
    data: {
      organizationId: org.id,
      name: "Dra. Carmen Gómez",
      phone: "809-555-5678",
      whatsapp: "8495555678",
      email: "carmen.gomez@medicosrd.com",
      cedulaOrRnc: "402-2938475-1",
      budget: 1400000,
      notes: "Reservó la Honda CR-V 2021. Espera aprobación bancaria.",
    },
  });

  const c3 = await prisma.customer.create({
    data: {
      organizationId: org.id,
      name: "Lic. Roberto Medina",
      phone: "809-555-9012",
      whatsapp: "8095559012",
      email: "roberto.medina@bufeterd.com",
      cedulaOrRnc: "001-0987654-3",
      budget: 1500000,
      notes: "Compró Hyundai Tucson 2022. Entrega realizada.",
    },
  });

  const c4 = await prisma.customer.create({
    data: {
      organizationId: org.id,
      name: "Ing. Kelvin Rosario",
      phone: "829-555-4321",
      whatsapp: "8295554321",
      email: "kelvin.rosario@constructora.do",
      cedulaOrRnc: "031-1029384-9",
      budget: 1000000,
      notes: "Preguntó por el Corolla LE vía Instagram. Pendiente de seguimiento.",
    },
  });

  console.log(`✅ Clientes creados con WhatsApp y Cédulas RD.`);

  // 6. Leads y Seguimientos
  const l1 = await prisma.lead.create({
    data: {
      organizationId: org.id,
      customerId: c1.id,
      vehicleId: v1.id,
      assignedUserId: salesUser.id,
      source: "WhatsApp",
      stage: "INTERESADO",
      nextFollowUp: new Date(Date.now() + 1000 * 60 * 60 * 2), // Hoy en 2 horas
      notes: "Desea probar la Toyota RAV4 2022 mañana sábado en la mañana.",
    },
  });

  const l2 = await prisma.lead.create({
    data: {
      organizationId: org.id,
      customerId: c2.id,
      vehicleId: v2.id,
      assignedUserId: salesUser.id,
      source: "Web",
      stage: "RESERVADO",
      nextFollowUp: new Date(Date.now() + 1000 * 60 * 60 * 24), // Mañana
      notes: "Reserva formalizada con RD$50,000.",
    },
  });

  const l3 = await prisma.lead.create({
    data: {
      organizationId: org.id,
      customerId: c4.id,
      vehicleId: v4.id,
      assignedUserId: salesUser.id,
      source: "Instagram",
      stage: "NUEVO",
      nextFollowUp: new Date(Date.now() + 1000 * 60 * 60 * 4), // Hoy
      notes: "Solicitó cotización por DM de Instagram.",
    },
  });

  // Actividades de Lead
  await prisma.leadActivity.create({
    data: {
      leadId: l1.id,
      userId: salesUser.id,
      type: "mensaje",
      content: "Se le envió catálogo y fotos de la RAV4 vía WhatsApp.",
    },
  });

  // 7. Reservas
  await prisma.reservation.create({
    data: {
      organizationId: org.id,
      customerId: c2.id,
      vehicleId: v2.id,
      amount: 50000,
      paymentMethod: "Transferencia",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 72), // 3 días
      status: "CONFIRMADA",
      notes: "Reserva de RD$50,000 recibida en Banco BHD.",
      createdBy: salesUser.name,
    },
  });

  // 8. Venta y Pagos reales (Hyundai Tucson -> Roberto Medina)
  const sale = await prisma.sale.create({
    data: {
      organizationId: org.id,
      vehicleId: v3.id,
      customerId: c3.id,
      sellerId: salesUser.id,
      finalPrice: 1450000,
      downPayment: 450000,
      financedAmount: 1000000,
      balance: 1000000, // Falta desembolso del banco
      status: "COMPLETADA",
      saleDate: new Date(),
      notes: "Venta cerrada. Inicial cobrado de RD$450,000 en cheque certificado.",
    },
  });

  await prisma.salePayment.create({
    data: {
      saleId: sale.id,
      amount: 450000,
      method: "Transferencia",
      status: "PAGADO",
      receipt: "REC-2026-089",
      notes: "Pago de inicial verificado en cuenta Banco Popular.",
      createdBy: financeUser.name,
    },
  });

  // 9. Documentos
  await prisma.document.create({
    data: {
      organizationId: org.id,
      customerId: c3.id,
      vehicleId: v3.id,
      saleId: sale.id,
      title: "Contrato de Venta Firmado - Roberto Medina",
      category: "Contrato",
      fileUrl: "/docs/contrato-v3-c3.pdf",
      uploadedBy: salesUser.name,
    },
  });

  // 10. Gastos Generales de la Empresa
  await prisma.generalExpense.createMany({
    data: [
      { organizationId: org.id, category: "Local", description: "Alquiler de patio y oficina", amount: 120000 },
      { organizationId: org.id, category: "Marketing", description: "Pauta publicitaria en Meta e Instagram Ads", amount: 35000 },
      { organizationId: org.id, category: "Servicios", description: "Energía eléctrica EdeSur e Internet Claro", amount: 18500 },
    ],
  });

  // 11. Auditoría Inicial
  await prisma.auditLog.createMany({
    data: [
      {
        organizationId: org.id,
        userId: admin.id,
        action: "CREAR_VEHICULO",
        entity: "Vehicle",
        entityId: v1.id,
        details: "Registró Toyota RAV4 2022 con precio RD$1,550,000",
      },
      {
        organizationId: org.id,
        userId: salesUser.id,
        action: "CREAR_RESERVA",
        entity: "Reservation",
        entityId: v2.id,
        details: "Registró reserva de RD$50,000 para Honda CR-V 2021 de Carmen Gómez",
      },
      {
        organizationId: org.id,
        userId: financeUser.id,
        action: "REGISTRAR_PAGO",
        entity: "SalePayment",
        entityId: sale.id,
        details: "Confirmó pago de inicial de RD$450,000 para Hyundai Tucson 2022",
      },
    ],
  });

  // 12. Configuración del sitio público (Kiry Auto)
  // Todo lo de aquí es contenido editorial/de ejemplo, editable luego desde
  // /settings. No incluye estadísticas, certificaciones ni tasas reales —
  // esos campos quedan configurables por el dealer antes de salir a producción.
  await prisma.siteSettings.create({
    data: {
      organizationId: org.id,
      instagramHandle: "@kiryauto",
      instagramUrl: "https://instagram.com/kiryauto",
      trustTitle1: "Vehículos seleccionados",
      trustText1: "Cada unidad pasa por una revisión antes de publicarse en el inventario.",
      trustTitle2: "Proceso transparente",
      trustText2: "Conoces el estado, kilometraje y condición real del vehículo antes de visitarnos.",
      trustTitle3: "Atención directa",
      trustText3: "Hablas directamente con un asesor por WhatsApp, sin intermediarios.",
      trustTitle4: "Documentación al día",
      trustText4: "Te acompañamos en el traspaso y la documentación de tu compra.",
      trustTitle5: "Test drive cuando quieras",
      trustText5: "Coordina una cita y móntate en la unidad antes de decidir.",
      trustTitle6: "Respuesta rápida",
      trustText6: "Te contestamos por WhatsApp el mismo día que escribes.",
      visitHours: "Lunes a sábado, 9:00 a.m. – 6:00 p.m.",
      financingIntro:
        "Te ayudamos a evaluar tus opciones de financiamiento y a preparar la documentación para tu solicitud.",
      // Valores de ejemplo para poder probar la calculadora — reemplázalos
      // desde /settings con las condiciones reales antes de publicar.
      minDownPaymentPct: 20,
      maxTermMonths: 60,
      estimatedRatePct: 14.5,
    },
  });

  console.log("🚀 Seed completado exitosamente con datos 100% dominicanos y relaciones consistentes.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
