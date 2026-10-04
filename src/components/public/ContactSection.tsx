"use client";

import { MessageCircle, Phone, AtSign } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/financials";
import { PublicContactModal } from "@/components/PublicContactModal";
import type { PublicSiteSettings } from "@/lib/siteSettings";
import { useLanguage } from "@/components/LanguageContext";

interface OrgLike {
  name: string;
  phone: string | null;
  whatsapp: string | null;
}

export function ContactSection({ org, settings }: { org: OrgLike; settings: PublicSiteSettings }) {
  const { t } = useLanguage();
  const waLink = org.whatsapp
    ? buildWhatsAppLink(org.whatsapp, `Hola, me gustaría más información sobre el inventario de ${org.name}.`)
    : null;

  return (
    <section id="contacto" className="max-w-7xl mx-auto px-4 sm:px-6 py-28 border-t border-[#F5C518]/15 scroll-mt-24 relative overflow-hidden">
      {/* Luz central dorada */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse,rgba(245,197,24,0.1),transparent_65%)] blur-3xl" />

      <div className="text-center max-w-3xl mx-auto relative z-10">
        <div className="eyebrow-gold justify-center mb-3">
          <span>{t("contact.badge")}</span>
        </div>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
          {t("contact.title")}
        </h2>
        <p className="mt-5 text-base sm:text-lg text-zinc-300 max-w-xl mx-auto leading-relaxed">
          {t("contact.desc", { name: org.name })}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold w-full sm:w-auto text-base px-8 py-4"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>{t("contact.cta_whatsapp")}</span>
            </a>
          )}
          <PublicContactModal variant="outline" label={t("contact.cta_info")} className="btn-gold-ghost w-full sm:w-auto text-base px-8 py-3.5" />
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-zinc-300 font-medium">
          {org.phone && (
            <span className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10">
              <Phone className="w-4 h-4 text-[#F5C518]" /> {org.phone}
            </span>
          )}
          {(settings.instagramHandle || settings.instagramUrl) && (
            <a
              href={settings.instagramUrl || `https://instagram.com/${settings.instagramHandle?.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 hover:border-[#F5C518] hover:text-[#FFD22E] transition-colors"
            >
              <AtSign className="w-4 h-4 text-[#F5C518]" /> {settings.instagramHandle}
            </a>
          )}
        </div>
      </div>

      {settings.mapEmbedUrl && (
        <div className="mt-14 rounded-2xl overflow-hidden border border-white/10 aspect-video max-w-4xl mx-auto">
          <iframe
            src={settings.mapEmbedUrl}
            className="w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </section>
  );
}
