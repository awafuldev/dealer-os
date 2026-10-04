"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Language, translations, TranslationKey } from "@/lib/i18n";

export type Currency = "DOP" | "USD";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  exchangeRate: number;
  formatPrice: (amountInDop: number) => string;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY_LANG = "dealer_os_language";
const STORAGE_KEY_CURR = "dealer_os_currency";
export const DEFAULT_EXCHANGE_RATE = 60.0; // 1 USD = 60 DOP

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("es");
  const [currency, setCurrencyState] = useState<Currency>("DOP");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY_LANG) as Language | null;
      if (savedLang === "es" || savedLang === "en") {
        setLangState(savedLang);
        document.documentElement.lang = savedLang;
      }
      const savedCurr = localStorage.getItem(STORAGE_KEY_CURR) as Currency | null;
      if (savedCurr === "DOP" || savedCurr === "USD") {
        setCurrencyState(savedCurr);
      } else if (savedLang === "en") {
        setCurrencyState("USD");
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    // Automáticamente cambiar moneda si cambia de idioma:
    // Español -> DOP, Inglés -> USD
    const nextCurr: Currency = newLang === "en" ? "USD" : "DOP";
    setCurrencyState(nextCurr);

    try {
      localStorage.setItem(STORAGE_KEY_LANG, newLang);
      localStorage.setItem(STORAGE_KEY_CURR, nextCurr);
      document.documentElement.lang = newLang;
    } catch {
      // ignore
    }
  };

  const setCurrency = (newCurr: Currency) => {
    setCurrencyState(newCurr);
    try {
      localStorage.setItem(STORAGE_KEY_CURR, newCurr);
    } catch {
      // ignore
    }
  };

  const toggleLang = () => {
    setLang(lang === "es" ? "en" : "es");
  };

  const toggleCurrency = () => {
    setCurrency(currency === "DOP" ? "USD" : "DOP");
  };

  const formatPrice = useMemo(() => {
    return (amountInDop: number): string => {
      if (isNaN(amountInDop)) return currency === "DOP" ? "RD$0" : "US$0";

      if (currency === "USD") {
        const usd = Math.round(amountInDop / DEFAULT_EXCHANGE_RATE);
        return `US$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(usd)}`;
      }

      return `RD$${new Intl.NumberFormat("es-DO", { maximumFractionDigits: 0 }).format(amountInDop)}`;
    };
  }, [currency]);

  const t = useMemo(() => {
    return (key: TranslationKey, params?: Record<string, string | number>): string => {
      const dict = translations[lang] || translations["es"];
      let text = (dict as any)[key] || (translations["es"] as any)[key] || key;

      if (params) {
        Object.entries(params).forEach(([paramKey, val]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(val));
        });
      }

      return text;
    };
  }, [lang]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        currency,
        setCurrency,
        toggleCurrency,
        exchangeRate: DEFAULT_EXCHANGE_RATE,
        formatPrice,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Graceful fallback if called outside provider
    const fallbackT = (key: TranslationKey, params?: Record<string, string | number>) => {
      let text = (translations["es"] as any)[key] || key;
      if (params) {
        Object.entries(params).forEach(([paramKey, val]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(val));
        });
      }
      return text;
    };
    return {
      lang: "es" as Language,
      setLang: () => {},
      toggleLang: () => {},
      currency: "DOP" as Currency,
      setCurrency: () => {},
      toggleCurrency: () => {},
      exchangeRate: DEFAULT_EXCHANGE_RATE,
      formatPrice: (amt: number) => `RD$${new Intl.NumberFormat("es-DO").format(amt)}`,
      t: fallbackT,
    };
  }
  return ctx;
}
