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
    <section id="financiamiento" className="border-t border-white/10 bg-[#0A101A] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#F5B301] uppercase mb-2">{t("financing.badge")}</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("financing.title")}</h2>
          <p className="mt-4 text-zinc-400 leading-relaxed max-w-md">
            {introText}
          </p>

          <ul className="mt-6 space-y-2.5">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-[#F5B301] shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>

          {banks.length > 0 && (
            <div className="mt-7">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">{t("financing.banks")}</p>
              <div className="flex flex-wrap gap-2">
                {banks.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-xs text-zinc-300">
                    <Landmark className="w-3.5 h-3.5 text-[#F5B301]" />
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#F5B301] hover:bg-[#FFC933] text-black font-semibold text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t("financing.cta")}
            </a>
          )}
        </div>

        <div>
          {canCalculate ? (
            <FinancingCalculator
              minDownPaymentPct={settings.minDownPaymentPct!}
              maxTermMonths={settings.maxTermMonths!}
              estimatedRatePct={settings.estimatedRatePct!}
            />
          ) : (
            <div className="bg-[#111A26] border border-dashed border-white/15 rounded-2xl p-6 text-sm text-zinc-500">
              La calculadora estimada estará disponible próximamente. Escríbenos por WhatsApp y te ayudamos a evaluar tus opciones de financiamiento.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
