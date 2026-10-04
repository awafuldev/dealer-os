"use client";

import { useMemo, useState } from "react";
import { formatCurrencyRD } from "@/lib/financials";
import { useLanguage } from "@/components/LanguageContext";

interface FinancingCalculatorProps {
  minDownPaymentPct: number;
  maxTermMonths: number;
  estimatedRatePct: number;
  defaultPrice?: number;
}

export function FinancingCalculator({
  minDownPaymentPct,
  maxTermMonths,
  estimatedRatePct,
  defaultPrice = 1200000,
}: FinancingCalculatorProps) {
  const { t } = useLanguage();
  const [price, setPrice] = useState(defaultPrice);
  const [downPct, setDownPct] = useState(minDownPaymentPct);
  const [term, setTerm] = useState(maxTermMonths);

  const { monthlyPayment, financedAmount } = useMemo(() => {
    const down = price * (downPct / 100);
    const financed = Math.max(price - down, 0);
    const monthlyRate = estimatedRatePct / 100 / 12;
    const payment =
      monthlyRate === 0
        ? financed / term
        : (financed * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
    return { monthlyPayment: payment, financedAmount: financed };
  }, [price, downPct, term, estimatedRatePct]);

  return (
    <div className="bg-[#111A26] border border-white/10 rounded-2xl p-6 space-y-5">
      <h3 className="text-sm font-bold text-white">{t("financing.calc_title")}</h3>

      <div>
        <label className="flex justify-between text-xs text-zinc-400 mb-1.5">
          <span>{t("financing.calc_price")}</span>
          <span className="text-white font-semibold">{formatCurrencyRD(price)}</span>
        </label>
        <input
          type="range"
          min={300000}
          max={5000000}
          step={50000}
          value={price}
          onChange={(e) => setPrice(parseInt(e.target.value))}
          className="w-full accent-[#F5B301]"
        />
      </div>

      <div>
        <label className="flex justify-between text-xs text-zinc-400 mb-1.5">
          <span>{t("financing.calc_downpayment")}</span>
          <span className="text-white font-semibold">{downPct}%</span>
        </label>
        <input
          type="range"
          min={minDownPaymentPct}
          max={80}
          step={5}
          value={downPct}
          onChange={(e) => setDownPct(parseInt(e.target.value))}
          className="w-full accent-[#F5B301]"
        />
      </div>

      <div>
        <label className="flex justify-between text-xs text-zinc-400 mb-1.5">
          <span>{t("financing.calc_term")}</span>
          <span className="text-white font-semibold">{term} meses</span>
        </label>
        <input
          type="range"
          min={12}
          max={maxTermMonths}
          step={6}
          value={term}
          onChange={(e) => setTerm(parseInt(e.target.value))}
          className="w-full accent-[#F5B301]"
        />
      </div>

      <div className="pt-4 border-t border-white/10">
        <p className="text-xs text-zinc-500">Monto a financiar: {formatCurrencyRD(financedAmount)}</p>
        <p className="text-3xl font-bold text-white mt-1">
          {formatCurrencyRD(monthlyPayment)}<span className="text-sm font-normal text-zinc-500">/mes</span>
        </p>
        <p className="text-[11px] text-zinc-600 mt-2">
          {t("financing.calc_disclaimer")}
        </p>
      </div>
    </div>
  );
}
