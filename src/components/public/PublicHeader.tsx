"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/financials";

const NAV_LINKS = [
  { label: "Inicio", href: "/showroom" },
  { label: "Inventario", href: "/showroom#inventario" },
  { label: "Financiamiento", href: "/showroom#financiamiento" },
  { label: "Nosotros", href: "/showroom#nosotros" },
  { label: "Contacto", href: "/showroom#contacto" },
];

export function PublicHeader({
  orgName,
  whatsapp,
  logo,
}: {
  orgName: string;
  whatsapp: string | null;
  logo?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const waLink = whatsapp
    ? buildWhatsAppLink(whatsapp, `Hola, me gustaría más información sobre el inventario de ${orgName}.`)
    : null;

  return (
    <header className="sticky top-0 z-50 bg-[#05070B]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 md:h-24 flex items-center justify-between gap-4">
        <Link href="/showroom" className="flex items-center gap-3 shrink-0">
          {logo ? (
            <img
              src={logo}
              alt={orgName}
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
          {NAV_LINKS.map((link, i) => (
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

        <div className="hidden md:flex items-center gap-3 shrink-0">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5B301] hover:bg-[#FFC933] text-black font-semibold text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-white"
          aria-label="Abrir menú"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-white/10 bg-[#05070B] px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
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
              Escríbenos por WhatsApp
            </a>
          )}
          <div className="mt-4 pt-3 border-t border-white/10">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Acceso administrativo
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
