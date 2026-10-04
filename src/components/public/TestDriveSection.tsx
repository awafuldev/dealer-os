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
    <section id="cita" className="border-t border-white/10 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#F5B301] uppercase mb-2">{t("testdrive.badge")}</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("testdrive.title")}</h2>
          <p className="mt-4 text-zinc-400 leading-relaxed max-w-md">
            {t("testdrive.desc")}
          </p>

          <ul className="mt-6 space-y-3 text-sm text-zinc-300">
            {visitHours && (
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#F5B301] shrink-0" />
                {visitHours}
              </li>
            )}
            {address && (
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#F5B301] shrink-0" />
                {address}
              </li>
            )}
            <li className="flex items-center gap-2.5">
              <MessageCircle className="w-4 h-4 text-[#F5B301] shrink-0" />
              {t("testdrive.confirm_whatsapp")}
            </li>
          </ul>

          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-7 text-sm font-semibold text-[#F5B301] hover:text-[#FFC933] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t("testdrive.prefer_chat")}
            </a>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111A26] border border-white/10 rounded-2xl p-6 space-y-5">
          {status && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                status.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
            >
              {status.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{status.text}</span>
            </div>
          )}

          {/* Honeypot anti-spam, invisible para personas */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">{t("testdrive.step1")}</p>
            <select
              name="vehicleId"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5B301]"
            >
              <option value="">{t("testdrive.undecided")}</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.brand} {v.model} {v.year}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">{t("testdrive.step2")}</p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                name="date"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5B301]"
              />
              <input
                type="time"
                name="time"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5B301]"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">{t("testdrive.step3")}</p>
            <div className="space-y-3">
              <input
                name="name"
                required
                placeholder={t("testdrive.name_placeholder")}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5B301]"
              />
              <input
                name="phone"
                required
                placeholder={t("testdrive.phone_placeholder")}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5B301] font-mono"
              />
              <input
                name="email"
                type="email"
                placeholder={t("testdrive.email_placeholder")}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5B301]"
              />
              <textarea
                name="notes"
                rows={2}
                placeholder={t("testdrive.notes_placeholder")}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5B301]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#F5B301] hover:bg-[#FFC933] text-black font-bold text-sm transition-colors disabled:opacity-50"
          >
            {loading ? t("testdrive.submitting") : t("testdrive.submit")}
          </button>

          <p className="text-[11px] text-zinc-600 leading-relaxed">
            {t("testdrive.privacy")}
          </p>
        </form>
      </div>
    </section>
  );
}
