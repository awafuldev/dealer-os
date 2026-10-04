"use client";

import { Car, MessageCircle, Wrench, KeyRound } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export function ProcessSection() {
  const { t } = useLanguage();

  const steps = [
    { n: "01", icon: Car, title: t("process.step1_title"), text: t("process.step1_text") },
    { n: "02", icon: MessageCircle, title: t("process.step2_title"), text: t("process.step2_text") },
    { n: "03", icon: Wrench, title: t("process.step3_title"), text: t("process.step3_text") },
    { n: "04", icon: KeyRound, title: t("process.step4_title"), text: t("process.step4_text") },
  ];

  return (
    <section id="proceso" className="max-w-7xl mx-auto px-4 sm:px-6 py-24 border-t border-[#F5C518]/15 scroll-mt-24 relative">
      <div className="eyebrow-gold mb-3">
        <span>{t("process.badge")}</span>
      </div>
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight max-w-xl mb-4 text-white">
        {t("process.title")}
      </h2>
      <p className="text-zinc-400 max-w-xl mb-14 text-base sm:text-lg leading-relaxed">
        {t("process.desc")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s) => (
          <div key={s.n} className="motorland-card p-7 group">
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#F5C518]/10 border border-[#F5C518]/25 text-[#F5C518] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#F5C518] group-hover:text-black transition-all duration-300">
                <s.icon className="w-5 h-5" />
              </div>
              <span className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-b from-[#FFD22E] to-white/10">
                {s.n}
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-white group-hover:text-[#FFD22E] transition-colors">
              {s.title}
            </h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              {s.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
