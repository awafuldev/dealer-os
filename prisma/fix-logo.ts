/**
 * prisma/fix-logo.ts
 * Limpia el logo roto "/logo.png" de la organización en la base de datos.
 * Uso: npm run fix:logo
 */
import { prisma } from "../src/lib/prisma";

async function main() {
  const result = await prisma.organization.updateMany({
    where: { logo: "/logo.png" },
    data: { logo: null },
  });
  if (result.count > 0) {
    console.log(`✅ Logo limpiado en ${result.count} organización(es).`);
  } else {
    console.log("ℹ️  No había logo roto que limpiar.");
  }
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
