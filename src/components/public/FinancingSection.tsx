"use client";

import { MessageCircle, Landmark, CheckCircle2 } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/financials";
import type { PublicSiteSettings } from "@/lib/siteSettings";
import { FinancingCalculator } from "./FinancingCalculator";
import { useLanguage } from "@/components/LanguageContext";

export function FinancingSection({
  whatsapp,
  settings,
}: {
  whatsapp: string | null;
  settings: PublicSiteSettings;
}) {
  const { t, lang } = useLanguage();
  const banks = settings.financingBanks
    ? settings.financingBanks.split(",").map((b) => b.trim()).filter(Boolean)
    : [];

  const canCalculate =
    settings.minDownPaymentPct != null && settings.maxTermMonths != null && settings.estimatedRatePct != null;

  const waLink = whatsapp
    ? buildWhatsAppLink(whatsapp, "Hola, quisiera información sobre las opciones de financiamiento.")
    : null;

  const bullets = [
    t("financing.bullet1"),
    settings.minDownPaymentPct != null
      ? t("financing.bullet2_with_pct", { pct: settings.minDownPaymentPct })
      : t("financing.bullet2_default"),
    settings.maxTermMonths != null
      ? t("financing.bullet3_with_months", { months: settings.maxTermMonths })
      : t("financing.bullet3_default"),
    t("financing.bullet4"),
  ];

  const introText = lang === "en"
    ? t("financing.intro_default")
    : (settings.financingIntro || t("financing.intro_default"));

  return (
    <section id="financiamiento" className="border-t border-[#F5C518]/15 bg-[#0B0E14] scroll-mt-24 py-24 relative overflow-hidden">
      {/* Luz ambiental dorada */}
      <div className="pointer-events-none absolute right-0 top-1/3 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(245,197,24,0.12),transparent_65%)] blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="rounded-[32px] border border-[#F5C518]/25 p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-[radial-gradient(90%_130%_at_100%_0%,rgba(245,197,24,0.12),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <div className="lg:col-span-6 space-y-6">
            <div className="eyebrow-gold">
              <span>{t("financing.badge")}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {t("financing.title")}
            </h2>
            <p className="text-zinc-300 leading-relaxed text-base sm:text-lg">
              {introText}
            </p>

            <ul className="space-y-3.5 pt-2">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm sm:text-base text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-[#F5C518]/15 flex items-center justify-center shrink-0 mt-0.5 border border-[#F5C518]/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5C518]" />
                  </div>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {banks.length > 0 && (
              <div className="pt-4">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 font-display">{t("financing.banks")}</p>
                <div className="flex flex-wrap gap-2">
                  {banks.map((b) => (
                    <span key={b} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/[0.04] text-xs font-medium text-zinc-200">
                      <Landmark className="w-3.5 h-3.5 text-[#F5C518]" />
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {waLink && (
              <div className="pt-4">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>{t("financing.cta")}</span>
                </a>
              </div>
            )}
          </div>

          <div className="lg:col-span-6">
            {canCalculate ? (
              <FinancingCalculator
                minDownPaymentPct={settings.minDownPaymentPct!}
                maxTermMonths={settings.maxTermMonths!}
                estimatedRatePct={settings.estimatedRatePct!}
              />
            ) : (
              <div className="motorland-card p-8 text-center text-sm text-zinc-400">
                La calculadora estimada estará disponible próximamente. Escríbenos por WhatsApp y te ayudamos a evaluar tus opciones de financiamiento.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
