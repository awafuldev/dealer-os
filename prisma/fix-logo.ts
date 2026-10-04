/**
 * prisma/fix-logo.ts
 * Establece el logo de Kiry Auto en la organización.
 * Uso: npm run fix:logo
 */
import { prisma } from "../src/lib/prisma";

async function main() {
  const result = await prisma.organization.updateMany({
    where: {},
    data: { logo: "/brand/kiry-logo.png" },
  });
  console.log(`✅ Logo actualizado en ${result.count} organización(es) → /brand/kiry-logo.png`);
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
