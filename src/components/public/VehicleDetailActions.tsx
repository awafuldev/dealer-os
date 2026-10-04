"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/financials";
import { PublicContactModal } from "@/components/PublicContactModal";
import { useLanguage } from "@/components/LanguageContext";

interface VehicleDetailActionsProps {
  vehicle: { id: string; brand: string; model: string; year: number; price: number };
  whatsapp: string | null;
}

export function VehicleDetailActions({ vehicle, whatsapp }: VehicleDetailActionsProps) {
  const { t, formatPrice } = useLanguage();
  const waLink = whatsapp
    ? buildWhatsAppLink(
        whatsapp,
        `Hola, estoy interesado en el ${vehicle.brand} ${vehicle.model} ${vehicle.year}.`
      )
    : null;

  const priceLabel = formatPrice(vehicle.price);

  return (
    <>
      {/* Desktop / dentro del flujo de la página */}
      <div className="hidden sm:flex gap-3">
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#F5B301] hover:bg-[#FFC933] text-black font-bold text-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {t("detail.whatsapp_cta")}
          </a>
        )}
        <PublicContactModal
          vehicle={{ id: vehicle.id, brand: vehicle.brand, model: vehicle.model, year: vehicle.year, price: priceLabel }}
          variant="outline"
          label={t("detail.info_cta")}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-full border border-white/25 hover:border-white/50 text-white font-bold text-sm transition-colors"
        />
      </div>

      {/* Mobile: barra persistente e inevitable */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#05070B]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 flex gap-2"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-full bg-[#F5B301] text-black font-bold text-xs"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        )}
        <PublicContactModal
          vehicle={{ id: vehicle.id, brand: vehicle.brand, model: vehicle.model, year: vehicle.year, price: priceLabel }}
          label={t("detail.info_short")}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-full border border-white/25 text-white font-bold text-xs"
        />
      </div>
    </>
  );
}
