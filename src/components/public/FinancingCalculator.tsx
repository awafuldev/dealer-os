"use client";

import { useMemo, useState } from "react";
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
  const { t, formatPrice, lang } = useLanguage();
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
    <div className="rounded-3xl border border-white/15 bg-[#0B0E14]/90 backdrop-blur-xl p-7 sm:p-8 space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h3 className="font-display text-base font-bold text-white tracking-tight">{t("financing.calc_title")}</h3>
        <span className="text-[11px] font-bold text-[#F5C518] tracking-widest uppercase font-display">Tasa Ref. 13%</span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-zinc-400">
          <span>{t("financing.calc_price")}</span>
          <span className="text-[#FFD22E] font-display font-extrabold text-sm bg-[#F5C518]/10 px-3 py-1 rounded-lg border border-[#F5C518]/30">
            {formatPrice(price)}
          </span>
        </div>
        <input
          type="range"
          min={300000}
          max={5000000}
          step={50000}
          value={price}
          onChange={(e) => setPrice(parseInt(e.target.value))}
          className="w-full accent-[#F5C518] cursor-pointer"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-zinc-400">
          <span>{t("financing.calc_downpayment")}</span>
          <span className="text-[#FFD22E] font-display font-extrabold text-sm bg-[#F5C518]/10 px-3 py-1 rounded-lg border border-[#F5C518]/30">
            {downPct}%
          </span>
        </div>
        <input
          type="range"
          min={minDownPaymentPct}
          max={80}
          step={5}
          value={downPct}
          onChange={(e) => setDownPct(parseInt(e.target.value))}
          className="w-full accent-[#F5C518] cursor-pointer"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-zinc-400">
          <span>{t("financing.calc_term")}</span>
          <span className="text-[#FFD22E] font-display font-extrabold text-sm bg-[#F5C518]/10 px-3 py-1 rounded-lg border border-[#F5C518]/30">
            {term} {lang === "en" ? "months" : "meses"}
          </span>
        </div>
        <input
          type="range"
          min={12}
          max={maxTermMonths}
          step={6}
          value={term}
          onChange={(e) => setTerm(parseInt(e.target.value))}
          className="w-full accent-[#F5C518] cursor-pointer"
        />
      </div>

      <div className="pt-5 border-t border-white/10">
        <p className="text-xs text-zinc-400">
          {lang === "en" ? "Financed amount" : "Monto a financiar"}: <span className="text-white font-semibold">{formatPrice(financedAmount)}</span>
        </p>
        <div className="mt-2">
          <p className="font-display text-4xl sm:text-5xl font-black glow-gold-text drop-shadow-[0_4px_20px_rgba(245,197,24,0.35)]">
            {formatPrice(monthlyPayment)}<span className="text-sm font-normal text-zinc-400 font-sans tracking-normal">/{lang === "en" ? "mo" : "mes"}</span>
          </p>
        </div>
        <p className="text-[11px] text-zinc-500 mt-3 leading-relaxed">
          {t("financing.calc_disclaimer")}
        </p>
      </div>
    </div>
  );
}
