"use client";

import { useState } from "react";
import { MessageCircle, CheckCircle2, AlertCircle, Clock, MapPin } from "lucide-react";
import { bookTestDriveAction } from "@/actions/publicLeadActions";
import { buildWhatsAppLink } from "@/lib/financials";
import { useLanguage } from "@/components/LanguageContext";

interface VehicleOption {
  id: string;
  brand: string;
  model: string;
  year: number;
}

export function TestDriveSection({
  vehicles,
  whatsapp,
  visitHours,
  address,
}: {
  vehicles: VehicleOption[];
  whatsapp: string | null;
  visitHours: string | null;
  address: string | null;
}) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const waLink = whatsapp
    ? buildWhatsAppLink(whatsapp, "Hola, quisiera agendar una cita para ver un vehículo de su inventario.")
    : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const form = new FormData(e.currentTarget);
    const res = await bookTestDriveAction(form);
    setLoading(false);
    if (res.success) {
      setStatus({ type: "success", text: t("testdrive.success") });
      (e.target as HTMLFormElement).reset();
    } else {
      setStatus({ type: "error", text: res.error || t("testdrive.error") });
    }
  };

  return (
    <section id="cita" className="border-t border-[#F5C518]/15 bg-[#0B0E14] scroll-mt-24 py-24 relative overflow-hidden">
      {/* Luz ambiental */}
      <div className="pointer-events-none absolute -left-40 top-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[radial-gradient(circle,rgba(245,197,24,0.08),transparent_65%)] blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <div className="eyebrow-gold mb-3">
            <span>{t("testdrive.badge")}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t("testdrive.title")}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-lg">
            {t("testdrive.desc")}
          </p>

          <ul className="mt-8 space-y-4 text-sm sm:text-base text-zinc-300">
            {visitHours && (
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F5C518]/10 border border-[#F5C518]/30 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#F5C518]" />
                </div>
                <span>{visitHours}</span>
              </li>
            )}
            {address && (
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F5C518]/10 border border-[#F5C518]/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#F5C518]" />
                </div>
                <span>{address}</span>
              </li>
            )}
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F5C518]/10 border border-[#F5C518]/30 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 text-[#F5C518]" />
              </div>
              <span>{t("testdrive.confirm_whatsapp")}</span>
            </li>
          </ul>

          {waLink && (
            <div className="mt-8">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-white/20 bg-white/[0.04] hover:border-[#F5C518] hover:text-[#FFD22E] text-sm font-semibold transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>{t("testdrive.prefer_chat")}</span>
              </a>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="motorland-card p-7 sm:p-9 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {status && (
            <div
              className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
                status.type === "success"
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/15 border border-red-500/30 text-red-400"
              }`}
            >
              {status.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span>{status.text}</span>
            </div>
          )}

          {/* Honeypot anti-spam */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

          <div>
            <p className="text-xs font-bold text-[#F5C518] uppercase tracking-widest mb-2 font-display">{t("testdrive.step1")}</p>
            <select
              name="vehicleId"
              className="w-full bg-[#151A24] border border-white/15 focus:border-[#F5C518] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all cursor-pointer"
            >
              <option value="">{t("testdrive.undecided")}</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.brand} {v.model} {v.year}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs font-bold text-[#F5C518] uppercase tracking-widest mb-2 font-display">{t("testdrive.step2")}</p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                name="date"
                className="w-full bg-[#151A24] border border-white/15 focus:border-[#F5C518] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all cursor-pointer"
              />
              <input
                type="time"
                name="time"
                className="w-full bg-[#151A24] border border-white/15 focus:border-[#F5C518] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all cursor-pointer"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-[#F5C518] uppercase tracking-widest mb-2 font-display">{t("testdrive.step3")}</p>
            <div className="space-y-3">
              <input
                name="name"
                required
                placeholder={t("testdrive.name_placeholder")}
                className="w-full bg-white/[0.04] border border-white/15 focus:border-[#F5C518] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
              />
              <input
                name="phone"
                required
                placeholder={t("testdrive.phone_placeholder")}
                className="w-full bg-white/[0.04] border border-white/15 focus:border-[#F5C518] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-mono"
              />
              <input
                name="email"
                type="email"
                placeholder={t("testdrive.email_placeholder")}
                className="w-full bg-white/[0.04] border border-white/15 focus:border-[#F5C518] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
              />
              <textarea
                name="notes"
                rows={2}
                placeholder={t("testdrive.notes_placeholder")}
                className="w-full bg-white/[0.04] border border-white/15 focus:border-[#F5C518] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-4 text-base"
          >
            {loading ? t("testdrive.submitting") : t("testdrive.submit")}
          </button>

          <p className="text-[11px] text-zinc-500 leading-relaxed text-center">
            {t("testdrive.privacy")}
          </p>
        </form>
      </div>
    </section>
  );
}
