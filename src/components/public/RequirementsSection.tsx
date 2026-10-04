"use client";

import { MessageCircle, FileCheck } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/financials";
import { useLanguage } from "@/components/LanguageContext";

interface RequirementsSectionProps {
  whatsapp: string | null;
  minDownPaymentPct: number | null;
}

export function RequirementsSection({ whatsapp, minDownPaymentPct }: RequirementsSectionProps) {
  const { t } = useLanguage();
  const waLink = whatsapp
    ? buildWhatsAppLink(whatsapp, "Hola, tengo una duda sobre los requisitos para comprar un vehículo.")
    : null;

  const items = [
    {
      title: t("req.item1_title"),
      text: t("req.item1_text"),
    },
    {
      title: t("req.item2_title"),
      text: t("req.item2_text"),
    },
    {
      title: minDownPaymentPct ? t("req.item3_title_pct", { pct: minDownPaymentPct }) : t("req.item3_title_default"),
      text: t("req.item3_text"),
    },
    {
      title: t("req.item4_title"),
      text: t("req.item4_text"),
    },
  ];

  return (
    <section id="requisitos" className="border-t border-[#F5C518]/15 bg-[#0B0E14] scroll-mt-24 py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <div className="eyebrow-gold mb-3">
              <span>{t("req.badge")}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight max-w-xl text-white">
              {t("req.title")}
            </h2>
          </div>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold-ghost shrink-0"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>{t("req.cta")}</span>
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.title} className="motorland-card p-7 flex gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-[#F5C518]/10 border border-[#F5C518]/25 text-[#F5C518] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 group-hover:bg-[#F5C518] group-hover:text-black transition-all duration-300">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-white group-hover:text-[#FFD22E] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
