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
    <header className="sticky top-0 z-50 bg-[#0B0E14]/90 backdrop-blur-xl border-b border-[#F5C518]/15 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 md:h-24 flex items-center justify-between gap-4">
        <Link href="/showroom" className="flex items-center gap-3 shrink-0 group">
          {logo && !logoError ? (
            <img
              src={logo}
              alt={orgName}
              onError={() => setLogoError(true)}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl object-contain bg-white/[0.05] p-1.5 border border-white/10 group-hover:border-[#F5C518]/40 group-hover:shadow-[0_0_20px_rgba(245,197,24,0.2)] transition-all"
            />
          ) : (
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#FFD22E] to-[#F5C518] flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(245,197,24,0.3)]">
              {orgName.charAt(0)}
            </div>
          )}
          <span className="font-display font-extrabold text-lg sm:text-xl text-white tracking-tight hidden sm:inline-block group-hover:text-[#FFD22E] transition-colors">
            {orgName}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-display">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold pb-1 border-b-2 transition-all ${
                i === 0
                  ? "text-[#F5C518] border-[#F5C518] drop-shadow-[0_0_10px_rgba(245,197,24,0.4)]"
                  : "text-zinc-300 border-transparent hover:text-white hover:border-[#F5C518]/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <LanguageSwitch variant="showroom" />
          <CurrencySwitch variant="showroom" />
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#2CE671] to-[#25D366] text-[#06301A] font-extrabold text-xs sm:text-sm shadow-[0_4px_18px_rgba(37,211,102,0.32)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.48)] hover:-translate-y-0.5 transition-all font-display tracking-tight"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              {t("nav.whatsapp")}
            </a>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitch variant="showroom" />
          <CurrencySwitch variant="showroom" />
          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-white hover:text-[#F5C518] transition-colors"
            aria-label="Abrir menú"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-[#F5C518]/15 bg-[#0B0E14]/98 backdrop-blur-2xl px-6 py-6 flex flex-col gap-2 animate-in fade-in duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-3 text-base font-semibold text-zinc-200 hover:text-[#F5C518] border-b border-white/5 last:border-0 transition-colors font-display"
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
              className="mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#2CE671] to-[#25D366] text-[#06301A] font-extrabold text-sm shadow-md font-display"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              {t("nav.whatsapp_write")}
            </a>
          )}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-xs text-zinc-500 hover:text-[#F5C518] transition-colors font-display"
            >
              {t("nav.admin")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
