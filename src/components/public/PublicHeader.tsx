"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/financials";
import { useLanguage } from "@/components/LanguageContext";
import { LanguageSwitch, CurrencySwitch } from "@/components/LanguageSwitch";

export function PublicHeader({
  orgName,
  whatsapp,
  logo,
}: {
  orgName: string;
  whatsapp: string | null;
  logo?: string | null;
}) {
  const { t } = useLanguage();
  const [logoError, setLogoError] = useState(false);
  const [open, setOpen] = useState(false);
  const waLink = whatsapp
    ? buildWhatsAppLink(whatsapp, `Hola, me gustaría más información sobre el inventario de ${orgName}.`)
    : null;

  const navLinks = [
    { label: t("nav.home"), href: "/showroom" },
    { label: t("nav.inventory"), href: "/showroom#inventario" },
    { label: t("nav.financing"), href: "/showroom#financiamiento" },
    { label: t("nav.about"), href: "/showroom#nosotros" },
    { label: t("nav.contact"), href: "/showroom#contacto" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#05070B]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 md:h-24 flex items-center justify-between gap-4">
        <Link href="/showroom" className="flex items-center gap-3 shrink-0">
          {logo && !logoError ? (
            <img
              src={logo}
              alt={orgName}
              onError={() => setLogoError(true)}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-contain bg-white/5 p-1 border border-white/10"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-black text-lg">
              {orgName.charAt(0)}
            </div>
          )}
          <span className="font-bold text-lg text-white tracking-tight hidden sm:inline-block">
            {orgName}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                i === 0
                  ? "text-[#F5B301] border-[#F5B301]"
                  : "text-zinc-300 border-transparent hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <LanguageSwitch variant="showroom" />
          <CurrencySwitch variant="showroom" />
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5B301] hover:bg-[#FFC933] text-black font-semibold text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t("nav.whatsapp")}
            </a>
          )}
        </div>

        <div className="flex md:hidden items-center gap-1.5">
          <LanguageSwitch variant="showroom" />
          <CurrencySwitch variant="showroom" />
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 text-white"
            aria-label="Abrir menú"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-white/10 bg-[#05070B] px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-3 text-sm font-medium text-zinc-200 border-b border-white/5 last:border-0"
            >
              {link.label}
            </Link>
          ))}
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#F5B301] text-black font-semibold text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              {t("nav.whatsapp_write")}
            </a>
          )}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              {t("nav.admin")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
