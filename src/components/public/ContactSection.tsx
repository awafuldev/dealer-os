import { MessageCircle, Phone, AtSign } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/financials";
import { PublicContactModal } from "@/components/PublicContactModal";
import type { PublicSiteSettings } from "@/lib/siteSettings";

interface OrgLike {
  name: string;
  phone: string | null;
  whatsapp: string | null;
}

export function ContactSection({ org, settings }: { org: OrgLike; settings: PublicSiteSettings }) {
  const waLink = org.whatsapp
    ? buildWhatsAppLink(org.whatsapp, `Hola, me gustaría más información sobre el inventario de ${org.name}.`)
    : null;

  return (
    <section id="contacto" className="max-w-7xl mx-auto px-4 sm:px-6 py-24 border-t border-white/10 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#F5B301] uppercase mb-3">Visítanos</p>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">¿Listo para tu próximo vehículo?</h2>
        <p className="mt-4 text-zinc-400">
          Escríbenos y un asesor de {org.name} te ayuda a encontrar la unidad correcta.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#F5B301] hover:bg-[#FFC933] text-black font-semibold text-sm transition-colors w-full sm:w-auto"
            >
              <MessageCircle className="w-4 h-4" />
              Hablar por WhatsApp
            </a>
          )}
          <PublicContactModal variant="outline" label="Solicitar información" />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-zinc-400">
          {org.phone && (
            <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#F5B301]" /> {org.phone}</span>
          )}
          {(settings.instagramHandle || settings.instagramUrl) && (
            <a
              href={settings.instagramUrl || `https://instagram.com/${settings.instagramHandle?.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <AtSign className="w-4 h-4 text-[#F5B301]" /> {settings.instagramHandle}
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
