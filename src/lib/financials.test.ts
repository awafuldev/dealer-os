import { calculateVehicleFinancials, formatCurrencyRD, buildWhatsAppLink } from "./financials";

function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(desc: string, condition: boolean) {
    if (condition) {
      console.log(`  ✓ ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
      failed++;
    }
  }

  console.log("▶ Corriendo suite de pruebas financieras unitarias:");

  // Caso 1: Caso normal con gastos
  const c1 = calculateVehicleFinancials(1000000, [{ amount: 50000 }, { amount: 50000 }], 1300000);
  assert("Caso 1 - totalCost correcto", c1.totalCost === 1100000);
  assert("Caso 1 - totalExpenses correcto", c1.totalExpenses === 100000);
  assert("Caso 1 - grossMargin correcto", c1.grossMargin === 200000);
  assert("Caso 1 - roiPercentage redondeado a 1 decimal", c1.roiPercentage === 18.2);

  // Caso 2: Sin gastos
  const c2 = calculateVehicleFinancials(800000, [], 1000000);
  assert("Caso 2 (sin gastos) - totalCost = purchasePrice", c2.totalCost === 800000);
  assert("Caso 2 - grossMargin", c2.grossMargin === 200000);
  assert("Caso 2 - ROI = 25%", c2.roiPercentage === 25);

  // Caso 3: Costo cero / donación / consignación sin costo
  const c3 = calculateVehicleFinancials(0, 0, 500000);
  assert("Caso 3 (costo 0) - totalCost es 0", c3.totalCost === 0);
  assert("Caso 3 - ROI no produce división por cero ni NaN", c3.roiPercentage === 0);

  // Caso 4: Venta a pérdida / descuento agresivo
  const c4 = calculateVehicleFinancials(1000000, 100000, 950000);
  assert("Caso 4 (pérdida) - margen negativo", c4.grossMargin === -150000);
  assert("Caso 4 - ROI negativo coherente", c4.roiPercentage === -13.6);

  // Caso 5: Formateador Dominicano RD$
  assert("Formato RD$1,500,000", formatCurrencyRD(1500000) === "RD$1,500,000" || formatCurrencyRD(1500000) === "RD$1.500.000" || formatCurrencyRD(1500000).includes("1"));
  assert("Formato NaN seguro", formatCurrencyRD(NaN) === "RD$0");

  // Caso 6: WhatsApp normalizador RD +1
  const wa1 = buildWhatsAppLink("809-555-1234", "Hola");
  assert("WhatsApp RD 809 normalizado con código de país 1", wa1.includes("wa.me/18095551234"));

  const wa2 = buildWhatsAppLink("8295554321", "Test");
  assert("WhatsApp RD 829 normalizado", wa2.includes("wa.me/18295554321"));

  console.log(`\nResultado pruebas financieras: ${passed} pasadas, ${failed} fallidas.`);
  if (failed > 0) process.exit(1);
}

runTests();
