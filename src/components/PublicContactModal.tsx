"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, X } from "lucide-react";
import { submitPublicLeadAction } from "@/actions/publicLeadActions";

interface PublicContactModalProps {
  vehicle?: {
    id: string;
    brand: string;
    model: string;
    year: number;
    price: string;
  };
  label?: string;
  variant?: "solid" | "outline";
  className?: string;
}

export function PublicContactModal({ vehicle, label, variant = "outline", className }: PublicContactModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const defaultMessage = vehicle
    ? `Hola, me interesa el ${vehicle.brand} ${vehicle.model} ${vehicle.year}. ¿Podrían darme más información?`
    : "Hola, me gustaría recibir más información sobre el inventario disponible.";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const form = new FormData(e.currentTarget);
    if (vehicle) form.append("vehicleId", vehicle.id);

    const res = await submitPublicLeadAction(form);
    setLoading(false);

    if (res.success) {
      setStatus({
        type: "success",
        text: "Solicitud enviada. Un asesor del dealer te contactará en breve.",
      });
      setTimeout(() => {
        setIsOpen(false);
        setStatus(null);
      }, 2200);
    } else {
      setStatus({ type: "error", text: res.error || "Error al enviar la solicitud." });
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={
          className ||
          (variant === "solid"
            ? "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#F5B301] hover:bg-[#FFC933] text-black font-semibold text-sm transition-colors"
            : "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-white/25 hover:border-white/50 text-white font-semibold text-sm transition-colors")
        }
      >
        <Mail className="w-4 h-4" />
        {label || "Solicitar información"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111A26] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-bold text-white text-lg">Solicitar información</h3>
                {vehicle && (
                  <p className="text-xs text-[#F5B301] font-medium mt-0.5">
                    {vehicle.brand} {vehicle.model} {vehicle.year} · {vehicle.price}
                  </p>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {status && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  status.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{status.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-zinc-300 font-medium mb-1 text-xs">Nombre completo *</label>
                <input
                  name="name"
                  required
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#F5B301]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1 text-xs">WhatsApp o teléfono *</label>
                <input
                  name="phone"
                  required
                  placeholder="809-555-1234"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#F5B301] font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1 text-xs">Mensaje (opcional)</label>
                <textarea
                  name="message"
                  rows={3}
                  defaultValue={defaultMessage}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#F5B301]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#F5B301] hover:bg-[#FFC933] text-black font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {loading ? "Enviando..." : "Enviar solicitud"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
