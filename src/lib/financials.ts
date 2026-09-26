/**
 * Centralized Financial Calculations & Dominican Currency Utilities
 * Single Source of Truth for Margins, Costs and ROI
 */

export interface VehicleFinancials {
  purchasePrice: number;
  totalExpenses: number;
  totalCost: number;
  salePrice: number;
  grossMargin: number;
  roiPercentage: number;
}

export function calculateVehicleFinancials(
  purchasePrice: number,
  expenses: { amount: number }[] | number,
  salePrice: number
): VehicleFinancials {
  const totalExpenses = typeof expenses === "number"
    ? expenses
    : expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);

  const totalCost = purchasePrice + totalExpenses;
  const grossMargin = salePrice - totalCost;
  const roiPercentage = totalCost > 0 ? (grossMargin / totalCost) * 100 : 0;

  return {
    purchasePrice,
    totalExpenses,
    totalCost,
    salePrice,
    grossMargin,
    roiPercentage: Math.round(roiPercentage * 10) / 10,
  };
}

/**
 * Format currency in Dominican Pesos (RD$) or USD
 */
export function formatCurrencyRD(amount: number, currency: "DOP" | "USD" = "DOP"): string {
  if (isNaN(amount)) return "RD$0";
  const formatted = new Intl.NumberFormat("es-DO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return currency === "DOP" ? `RD$${formatted}` : `US$${formatted}`;
}

/**
 * Formats a clean WhatsApp click-to-chat URL with preloaded contextual message
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  // Normalize numbers: remove dashes, spaces, symbols
  let cleanNumber = phone.replace(/\D/g, "");

  // If Dominican standard format (10 digits: 809, 829, 849), prefix with '1'
  if (cleanNumber.length === 10 && (cleanNumber.startsWith("809") || cleanNumber.startsWith("829") || cleanNumber.startsWith("849"))) {
    cleanNumber = `1${cleanNumber}`;
  }

  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMsg}`;
}
