/**
 * prisma/seed-demo.ts
 *
 * Agrega vehículos de demostración al showroom para que los clientes puedan
 * ver cómo se ve el panel antes de cargar su propio inventario.
 *
 * Uso:
 *   npm run seed:demo
 *
 * Los vehículos se agregan solo si no hay ninguno publicado todavía.
 */

import { prisma } from "../src/lib/prisma";

const DEMO_VEHICLES = [
  {
    brand: "Toyota",
    model: "Corolla XSE",
    year: 2023,
    salePrice: 1_350_000,
    purchasePrice: 1_100_000,
    mileage: 12_500,
    transmission: "Automática",
    fuel: "Gasolina",
    color: "Blanco Perla",
    bodyType: "Sedán",
    slug: "toyota-corolla-xse-2023",
    description: "Sedán compacto en excelentes condiciones. Económico, confiable y con bajo kilometraje.",
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=900&q=80",
    featuredOnHome: true,
  },
  {
    brand: "Honda",
    model: "CR-V EX",
    year: 2022,
    salePrice: 1_890_000,
    purchasePrice: 1_580_000,
    mileage: 28_000,
    transmission: "Automática",
    fuel: "Gasolina",
    color: "Gris Moderno",
    bodyType: "SUV",
    slug: "honda-crv-ex-2022",
    description: "SUV familiar con amplio espacio interior, eficiente y muy bien equipado.",
    image: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=900&q=80",
    featuredOnHome: false,
  },
  {
    brand: "Hyundai",
    model: "Tucson Híbrido",
    year: 2023,
    salePrice: 2_100_000,
    purchasePrice: 1_750_000,
    mileage: 8_000,
    transmission: "Automática",
    fuel: "Híbrido",
    color: "Azul Cielo",
    bodyType: "SUV",
    slug: "hyundai-tucson-hibrido-2023",
    description: "Versión híbrida con tecnología de punta, bajo consumo y garantía de fábrica.",
    image: "https://images.unsplash.com/photo-1570071677470-c04398af73ca?w=900&q=80",
    featuredOnHome: false,
  },
  {
    brand: "Kia",
    model: "Sportage EX",
    year: 2022,
    salePrice: 1_750_000,
    purchasePrice: 1_450_000,
    mileage: 19_000,
    transmission: "Automática",
    fuel: "Gasolina",
    color: "Negro Profundo",
    bodyType: "SUV",
    slug: "kia-sportage-ex-2022",
    description: "Diseño premium, interior moderno y pantalla táctil de 10.25 pulgadas.",
    image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=900&q=80",
    featuredOnHome: false,
  },
  {
    brand: "Nissan",
    model: "Sentra SR",
    year: 2022,
    salePrice: 1_150_000,
    purchasePrice: 920_000,
    mileage: 32_000,
    transmission: "CVT",
    fuel: "Gasolina",
    color: "Rojo Pasión",
    bodyType: "Sedán",
    slug: "nissan-sentra-sr-2022",
    description: "Sedán deportivo, eficiente y fácil de manejar en la ciudad.",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900&q=80",
    featuredOnHome: false,
  },
  {
    brand: "Chevrolet",
    model: "Trailblazer RS",
    year: 2023,
    salePrice: 1_620_000,
    purchasePrice: 1_350_000,
    mileage: 15_000,
    transmission: "Automática",
    fuel: "Gasolina",
    color: "Naranja Metálico",
    bodyType: "SUV",
    slug: "chevrolet-trailblazer-rs-2023",
    description: "SUV compacta con estilo atrevido, turboalimentada y muy ágil.",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&q=80",
    featuredOnHome: false,
  },
  {
    brand: "Mitsubishi",
    model: "Outlander 4WD",
    year: 2021,
    salePrice: 1_480_000,
    purchasePrice: 1_200_000,
    mileage: 45_000,
    transmission: "Automática",
    fuel: "Gasolina",
    color: "Plata Diamante",
    bodyType: "SUV",
    slug: "mitsubishi-outlander-4wd-2021",
    description: "7 pasajeros, tracción 4WD, ideal para carretera y ciudad.",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&q=80",
    featuredOnHome: false,
  },
  {
    brand: "Ford",
    model: "Escape SE",
    year: 2022,
    salePrice: 1_580_000,
    purchasePrice: 1_300_000,
    mileage: 22_000,
    transmission: "Automática",
    fuel: "Gasolina",
    color: "Blanco Oxford",
    bodyType: "SUV",
    slug: "ford-escape-se-2022",
    description: "SUV americana confiable, cargador inalámbrico, asientos de cuero.",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&q=80",
    featuredOnHome: false,
  },
];

async function main() {
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.error("❌ No hay organización. Corre npm run seed primero.");
    process.exit(1);
  }

  const existingCount = await prisma.vehicle.count({
    where: { organizationId: org.id, isPublished: true },
  });

  if (existingCount > 0) {
    console.log(`ℹ️  Ya hay ${existingCount} vehículo(s) publicado(s). No se agregan demos.`);
    console.log("   Para forzar la carga, elimina los vehículos existentes primero.");
    process.exit(0);
  }

  console.log("🚗 Cargando vehículos de demostración...");

  for (const v of DEMO_VEHICLES) {
    // Verificar colisión de slug
    const existing = await prisma.vehicle.findFirst({
      where: { organizationId: org.id, slug: v.slug },
    });
    const slug = existing ? `${v.slug}-demo` : v.slug;

    const vehicle = await prisma.vehicle.create({
      data: {
        organizationId: org.id,
        brand: v.brand,
        model: v.model,
        year: v.year,
        salePrice: v.salePrice,
        purchasePrice: v.purchasePrice,
        mileage: v.mileage,
        transmission: v.transmission,
        fuel: v.fuel,
        color: v.color,
        bodyType: v.bodyType,
        description: v.description,
        slug,
        status: "DISPONIBLE",
        isPublished: true,
        featuredOnHome: v.featuredOnHome,
        acquisitionDate: new Date(),
      },
    });

    await prisma.vehicleImage.create({
      data: {
        vehicleId: vehicle.id,
        url: v.image,
        order: 1,
        isCover: true,
      },
    });

    console.log(`   ✅ ${v.brand} ${v.model} ${v.year} — RD$${v.salePrice.toLocaleString("es-DO")}`);
  }

  console.log(`\n🚀 ${DEMO_VEHICLES.length} vehículos de demo cargados exitosamente.`);
  console.log("   Ya puedes ver el showroom con inventario completo.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed-demo:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
