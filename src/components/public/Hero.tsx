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
    <section className="relative overflow-hidden border-b border-white/10 min-h-[640px] lg:min-h-[740px] flex items-center bg-[#0B0E14]">
      {/* Background Media with MotorLand Lighting Veils */}
      <div className="absolute inset-0">
        {slides.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={orgName}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              i === active ? "opacity-100 scale-100" : "opacity-0 scale-105"
            } transition-transform duration-[7000ms]`}
          />
        ))}
        {/* Veils & Ambient Gold Spotlight */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/85 to-[#0B0E14]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-black/60" />
        <div className="pointer-events-none absolute -left-32 top-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(245,197,24,0.24),transparent_65%)] blur-3xl opacity-80" />
        <div className="pointer-events-none absolute right-10 top-10 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,210,46,0.14),transparent_65%)] blur-3xl opacity-60" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full z-10">
        <div className="max-w-2xl">
          {/* Live Badge estilo MotorLand */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#F5C518]/30 bg-white/[0.04] backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(245,197,24,0.15)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5C518] shadow-[0_0_12px_#F5C518] animate-pulse" />
            <span className="text-xs font-bold text-zinc-200 tracking-wide uppercase font-display">
              {t("hero.badge")}
            </span>
          </div>

          <div className="eyebrow-gold mb-4">
            <span>{orgName} EXCLUSIVE SHOWROOM</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.04]">
            <span className="text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">{headline}</span>
            <br />
            <span className="glow-gold-text drop-shadow-[0_6px_30px_rgba(245,197,24,0.45)]">
              {headlineAccent}
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-300 max-w-lg leading-relaxed drop-shadow-sm font-normal">
            {subheadline}
          </p>

          <div className="mt-10 flex flex-wrap gap-4 items-center">
            <Link
              href="#inventario"
              className="btn-gold"
            >
              <span>{t("hero.cta_inventory")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#2CE671] to-[#25D366] text-[#06301A] font-extrabold text-sm shadow-[0_8px_28px_rgba(37,211,102,0.32)] hover:shadow-[0_12px_40px_rgba(37,211,102,0.48)] hover:-translate-y-0.5 transition-all font-display tracking-tight"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{t("hero.cta_whatsapp")}</span>
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
