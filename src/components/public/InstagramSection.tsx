"use client";

import { AtSign, ArrowUpRight } from "lucide-react";
import type { PublicSiteSettings } from "@/lib/siteSettings";
import { useLanguage } from "@/components/LanguageContext";

export function InstagramSection({ settings }: { settings: PublicSiteSettings }) {
  const { t } = useLanguage();
  if (!settings.instagramHandle && !settings.instagramUrl) return null;

  const handle = settings.instagramHandle || "@dealer";
  const url = settings.instagramUrl || (settings.instagramHandle ? `https://instagram.com/${handle.replace("@", "")}` : "#");

  return (
    <section id="instagram" className="max-w-7xl mx-auto px-4 sm:px-6 py-24 border-t border-[#F5C518]/15 scroll-mt-24 relative overflow-hidden">
      <div className="eyebrow-gold mb-3">
        <span>{t("instagram.badge")}</span>
      </div>
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-10 max-w-xl text-white">
        {t("instagram.title")}
      </h2>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="motorland-card flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 sm:p-12 group shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#F5C518]/10 border border-[#F5C518]/30 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[#F5C518] group-hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(245,197,24,0.2)] text-[#F5C518]">
            <AtSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#F5C518] uppercase mb-1 font-display">{t("instagram.follow")}</p>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white group-hover:text-[#FFD22E] transition-colors">{handle}</h3>
            <p className="text-sm sm:text-base text-zinc-400 mt-1">{t("instagram.desc")}</p>
          </div>
        </div>
        <span className="btn-gold shrink-0">
          <span>{t("instagram.view_profile")}</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </a>
    </section>
  );
}
