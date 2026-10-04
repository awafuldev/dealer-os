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
    <section id="proceso" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-white/10 scroll-mt-24">
      <p className="text-xs font-semibold tracking-[0.2em] text-[#F5B301] uppercase mb-2">{t("process.badge")}</p>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-lg mb-3">
        {t("process.title")}
      </h2>
      <p className="text-zinc-400 max-w-xl mb-12">
        {t("process.desc")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((s) => (
          <div key={s.n}>
            <div className="w-12 h-12 rounded-xl bg-[#F5B301]/15 flex items-center justify-center mb-4">
              <s.icon className="w-5 h-5 text-[#F5B301]" />
            </div>
            <span className="text-xs font-bold text-white/25">{s.n}</span>
            <h3 className="text-base font-bold text-white mt-1.5">{s.title}</h3>
            <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
