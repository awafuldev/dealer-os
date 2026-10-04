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
    <section id="nosotros" className="border-t border-white/10 bg-[#0A101A] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#F5B301] uppercase mb-2">{t("trust.badge")}</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl">
          {t("trust.title", { name: orgName })}
        </h2>
        <p className="mt-4 text-zinc-400 max-w-xl">
          {t("trust.desc")}
        </p>

        {blocks.length > 0 && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {blocks.map((b, i) => (
              <div key={i} className="p-5 rounded-2xl border border-white/10 bg-[#111A26]">
                <ShieldCheck className="w-5 h-5 text-[#F5B301] mb-3" />
                <h3 className="text-sm font-bold text-white">{b.title}</h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
