"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/financials";

/**
 * Global WhatsApp CTA for the public showroom.
 * - Desktop: small circular floating button, always visible.
 * - Mobile: full-width bottom bar, EXCEPT on individual vehicle pages,
 *   which render their own persistent CTA bar (WhatsApp + Solicitar
 *   información together) via VehicleDetailActions. Avoids stacking
 *   two fixed bottom bars on top of each other.
 */
export function WhatsAppFloatingButton({ whatsapp }: { whatsapp: string | null }) {
  const pathname = usePathname();
  const isVehicleDetail = pathname?.includes("/vehiculos/");

  if (!whatsapp) return null;

  const link = buildWhatsAppLink(whatsapp, "Hola, quisiera más información sobre un vehículo de Kiry Auto.");

  return (
    <>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex fixed bottom-6 right-6 z-40 items-center justify-center w-14 h-14 rounded-full bg-[#F5B301] hover:bg-[#FFC933] shadow-xl shadow-black/40 transition-transform hover:scale-105"
        aria-label="Escríbenos por WhatsApp"
      >
        <MessageCircle className="w-6 h-6 text-black" />
      </a>

      {!isVehicleDetail && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-2 py-3.5 bg-[#F5B301] text-black font-bold text-sm"
          style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
        >
          <MessageCircle className="w-4 h-4" />
          Escríbenos por WhatsApp
        </a>
      )}
    </>
  );
}
