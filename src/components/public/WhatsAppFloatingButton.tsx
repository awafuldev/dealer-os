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

  const link = buildWhatsAppLink(whatsapp, "Hola, quisiera más información sobre sus vehículos disponibles.");

  return (
    <>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex fixed bottom-8 right-8 z-40 items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#2CE671] to-[#25D366] text-[#06301A] font-extrabold shadow-[0_10px_34px_rgba(37,211,102,0.45)] hover:shadow-[0_16px_45px_rgba(37,211,102,0.65)] transition-all duration-300 hover:scale-105 group font-display tracking-tight border border-white/20"
        aria-label="Escríbenos por WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#06301A]" />
        </span>
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-bold uppercase tracking-wider">WhatsApp</span>
      </a>

      {!isVehicleDetail && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-[#2CE671] to-[#25D366] text-[#06301A] font-extrabold text-sm shadow-[0_-4px_20px_rgba(0,0,0,0.6)] font-display"
          style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#06301A] animate-pulse" />
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>Hablar por WhatsApp</span>
        </a>
      )}
    </>
  );
}
