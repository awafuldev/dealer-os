"use client";

import Link from "next/link";
import { AtSign, Link2, Phone, Mail, MapPin, Clock } from "lucide-react";
import type { PublicSiteSettings } from "@/lib/siteSettings";
import { useLanguage } from "@/components/LanguageContext";
import { LanguageSwitch, CurrencySwitch } from "@/components/LanguageSwitch";

interface OrgLike {
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
}

export function PublicFooter({ org, settings }: { org: OrgLike; settings: PublicSiteSettings }) {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#F5C518]/15 bg-gradient-to-b from-[#0B0E14] to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-12">
        <div>
          <h3 className="font-display text-2xl font-extrabold text-white tracking-tight">{org.name}</h3>
          <p className="text-sm text-zinc-400 mt-3 max-w-xs leading-relaxed">
            {t("footer.desc")}
          </p>
          {(settings.instagramUrl || settings.instagramHandle) && (
            <a
              href={settings.instagramUrl || `https://instagram.com/${settings.instagramHandle?.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 mt-5 text-sm font-medium text-zinc-300 hover:text-[#F5C518] transition-colors"
            >
              <AtSign className="w-4 h-4 text-[#F5C518]" />
              {settings.instagramHandle || "Instagram"}
            </a>
          )}
          {settings.facebookUrl && (
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 mt-2.5 text-sm font-medium text-zinc-300 hover:text-[#F5C518] transition-colors"
            >
              <Link2 className="w-4 h-4 text-[#F5C518]" />
              Facebook
            </a>
          )}
        </div>

        <div>
          <h4 className="font-display text-xs font-bold tracking-[0.22em] uppercase text-[#F5C518] mb-4">{t("footer.nav_title")}</h4>
          <ul className="space-y-2.5 text-sm text-zinc-400">
            <li><Link href="/showroom" className="hover:text-white transition-colors">{t("nav.home")}</Link></li>
            <li><Link href="/showroom#inventario" className="hover:text-white transition-colors">{t("nav.inventory")}</Link></li>
            <li><Link href="/showroom#financiamiento" className="hover:text-white transition-colors">{t("nav.financing")}</Link></li>
            <li><Link href="/showroom#nosotros" className="hover:text-white transition-colors">{t("nav.about")}</Link></li>
            <li><Link href="/showroom#contacto" className="hover:text-white transition-colors">{t("nav.contact")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">{t("footer.contact_title")}</h4>
          <ul className="space-y-2.5 text-sm text-zinc-400">
            {org.phone && (
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#F5B301]" /> {org.phone}</li>
            )}
            {org.email && (
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#F5B301]" /> {org.email}</li>
            )}
            {org.address && (
              <li className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-[#F5B301] mt-0.5" /> <span>{org.address}</span></li>
            )}
            {settings.visitHours && (
              <li className="flex items-start gap-2"><Clock className="w-3.5 h-3.5 text-[#F5B301] mt-0.5" /> <span>{settings.visitHours}</span></li>
            )}
            {!org.phone && !org.email && !org.address && (
              <li className="text-zinc-600">{t("footer.contact_soon")}</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <span>© {year} {org.name}. {t("footer.rights")}</span>

          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitch variant="showroom" />
            <CurrencySwitch variant="showroom" />

            <Link href="/login" className="text-zinc-700 hover:text-zinc-400 transition-colors">
              {t("footer.admin")}
            </Link>

            {/* CETU STUDIOS Credit Badge */}
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/25 transition-all duration-300 group">
              <span className="text-[11px] text-zinc-400 tracking-wider uppercase font-medium">
                {t("footer.made_by")}
              </span>
              <div className="flex items-center gap-1.5">
                <img
                  src="/cetu-studios.png"
                  alt="CETU Studios"
                  className="h-5 w-auto object-contain brightness-125 group-hover:scale-110 transition-transform duration-300"
                />
                <span className="text-white font-bold tracking-wider text-[11px] group-hover:text-[#F5B301] transition-colors">
                  CETU STUDIOS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
