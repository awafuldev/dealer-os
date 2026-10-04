"use client";

import React from "react";
import { useLanguage } from "./LanguageContext";
import { Globe } from "lucide-react";

interface LanguageSwitchProps {
  variant?: "showroom" | "admin";
  className?: string;
}

export function LanguageSwitch({ variant = "showroom", className = "" }: LanguageSwitchProps) {
  const { lang, setLang } = useLanguage();

  if (variant === "admin") {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div className="flex items-center bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-full p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setLang("es")}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              lang === "es"
                ? "bg-[#cc62d5] text-white shadow-2xs"
                : "text-[#737577] hover:text-[#131517]"
            }`}
          >
            ES
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              lang === "en"
                ? "bg-[#cc62d5] text-white shadow-2xs"
                : "text-[#737577] hover:text-[#131517]"
            }`}
          >
            EN
          </button>
        </div>
      </div>
    );
  }

  // Showroom dark style
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center bg-black/40 border border-white/15 rounded-full p-0.5 backdrop-blur-sm">
        <div className="pl-2 pr-1 text-zinc-400">
          <Globe className="w-3.5 h-3.5" />
        </div>
        <button
          type="button"
          onClick={() => setLang("es")}
          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            lang === "es"
              ? "bg-[#F5B301] text-black shadow-sm"
              : "text-zinc-400 hover:text-white"
          }`}
          title="Español"
        >
          ES
        </button>
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            lang === "en"
              ? "bg-[#F5B301] text-black shadow-sm"
              : "text-zinc-400 hover:text-white"
          }`}
          title="English"
        >
          EN
        </button>
      </div>
    </div>
  );
}
