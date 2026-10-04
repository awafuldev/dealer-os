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
    <section id="requisitos" className="border-t border-white/10 bg-[#0A101A] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#F5B301] uppercase mb-2">{t("req.badge")}</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-lg">
              {t("req.title")}
            </h2>
          </div>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/25 hover:border-white/50 text-white font-semibold text-sm transition-colors shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              {t("req.cta")}
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.title} className="flex gap-3.5">
              <FileCheck className="w-5 h-5 text-[#F5B301] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
