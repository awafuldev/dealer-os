"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/financials";
import type { PublicSiteSettings } from "@/lib/siteSettings";

import { useLanguage } from "@/components/LanguageContext";

interface HeroProps {
  orgName: string;
  whatsapp: string | null;
  settings: PublicSiteSettings;
  slideImages: string[]; // [0] = imagen oficial del hero; el resto, vehículos reales destacados
}

export function Hero({ orgName, whatsapp, settings, slideImages }: HeroProps) {
  const { t, lang } = useLanguage();
  const [active, setActive] = useState(0);
  const slides = slideImages.length > 0 ? slideImages : ["/brand/hero-showroom.jpg"];

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  const headline = lang === "en"
    ? t("hero.default_headline")
    : (settings.heroHeadline || t("hero.default_headline"));
  const headlineAccent = lang === "en"
    ? t("hero.default_headline_accent")
    : "te está esperando.";
  const subheadline = lang === "en"
    ? t("hero.default_subheadline")
    : (settings.heroSubheadline || t("hero.default_subheadline"));

  const waLink = whatsapp
    ? buildWhatsAppLink(whatsapp, `Hola, me gustaría más información sobre el inventario de ${orgName}.`)
    : null;

  return (
    <section className="relative overflow-hidden border-b border-white/10 min-h-[600px] lg:min-h-[700px] flex items-center">
      <div className="absolute inset-0">
        {slides.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={orgName}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070B] via-[#0A101A]/85 to-[#0A101A]/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A101A]/40 via-transparent to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 w-full">
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#F5B301] uppercase mb-5">
            <span className="w-5 h-[2px] bg-[#F5B301]" />
            {t("hero.badge")}
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            <span className="text-white">{headline}</span>
            <br />
            <span className="text-[#F5B301]">{headlineAccent}</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-zinc-300 max-w-md leading-relaxed">
            {subheadline}
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link
              href="#inventario"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#F5B301] hover:bg-[#FFC933] text-black font-semibold text-sm transition-colors"
            >
              {t("hero.cta_inventory")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-white/25 hover:border-white/50 text-white font-semibold text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {t("hero.cta_whatsapp")}
              </a>
            )}
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 right-6 sm:right-10 flex items-center gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ir a la imagen ${i + 1}`}
              className={`text-xs font-semibold transition-colors ${
                i === active ? "text-[#F5B301]" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
