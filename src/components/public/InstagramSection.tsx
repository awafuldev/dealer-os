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
    <section id="instagram" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-white/10 scroll-mt-24">
      <p className="text-xs font-semibold tracking-[0.2em] text-[#F5B301] uppercase mb-2">{t("instagram.badge")}</p>
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8 max-w-lg">
        {t("instagram.title")}
      </h2>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-br from-[#111A26] to-[#0A101A] border border-white/10 hover:border-white/25 rounded-3xl p-8 sm:p-10 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F5B301]/15 flex items-center justify-center shrink-0">
            <AtSign className="w-7 h-7 text-[#F5B301]" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#F5B301] uppercase mb-1">{t("instagram.follow")}</p>
            <h3 className="text-2xl font-bold text-white">{handle}</h3>
            <p className="text-sm text-zinc-400 mt-0.5">{t("instagram.desc")}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-white shrink-0">
          {t("instagram.view_profile")}
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </a>
    </section>
  );
}
