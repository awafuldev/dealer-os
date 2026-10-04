"use client";

import { ShieldCheck } from "lucide-react";
import type { PublicSiteSettings } from "@/lib/siteSettings";
import { useLanguage } from "@/components/LanguageContext";

export function TrustSection({ orgName, settings }: { orgName: string; settings: PublicSiteSettings }) {
  const { t } = useLanguage();
  const blocks = [
    { title: settings.trustTitle1, text: settings.trustText1 },
    { title: settings.trustTitle2, text: settings.trustText2 },
    { title: settings.trustTitle3, text: settings.trustText3 },
    { title: settings.trustTitle4, text: settings.trustText4 },
    { title: settings.trustTitle5, text: settings.trustText5 },
    { title: settings.trustTitle6, text: settings.trustText6 },
  ].filter((b) => b.title && b.text);

  return (
    <section id="nosotros" className="border-t border-[#F5C518]/15 bg-[#0B0E14] scroll-mt-24 relative overflow-hidden py-24">
      {/* Luz ambiental */}
      <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(245,197,24,0.07),transparent_65%)] blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="eyebrow-gold mb-3">
          <span>{t("trust.badge")}</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight max-w-3xl text-white">
          {t("trust.title", { name: orgName })}
        </h2>
        <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          {t("trust.desc")}
        </p>

        {blocks.length > 0 && (
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blocks.map((b, i) => (
              <div
                key={i}
                className="motorland-card p-7 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F5C518]/10 border border-[#F5C518]/25 text-[#F5C518] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#F5C518] group-hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(245,197,24,0.15)]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-white group-hover:text-[#FFD22E] transition-colors">
                  {b.title}
                </h3>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  {b.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
