"use client";

import { useState } from "react";
import { MessageCircle, Clock, Plus, ChevronRight, X, User, Car, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/financials";
import { updateLeadStageAction } from "@/actions/leadPipelineActions";
import { createLeadAction } from "@/actions/crmActions";

const PIPELINE_STAGES = [
  { key: "NUEVO", label: "Nuevo", badgeColor: "bg-[#cc62d5]/15 text-[#cc62d5]" },
  { key: "CONTACTADO", label: "Contactado", badgeColor: "bg-[#131517]/10 text-[#131517]" },
  { key: "INTERESADO", label: "Interesado", badgeColor: "bg-[#cc62d5]/15 text-[#cc62d5]" },
  { key: "NEGOCIACION", label: "Negociación", badgeColor: "bg-[#ec660d]/15 text-[#ec660d]" },
  { key: "CONVERTIDO", label: "Convertido", badgeColor: "bg-[#131517] text-white" },
  { key: "PERDIDO", label: "Perdido", badgeColor: "bg-[#b3b5b7]/30 text-[#737577]" },
];

interface LeadItem {
  id: string;
  customerId: string;
  customerName: string;
  whatsapp: string;
  vehicleId: string | null;
  vehicleName: string;
  source: string;
  stage: string;
  notes: string | null;
  followUpFormatted: string | null;
}

interface LeadsPipelineViewProps {
  leads: LeadItem[];
  orgName: string;
  availableVehicles: Array<{ id: string; name: string }>;
  customers: Array<{ id: string; name: string; whatsapp: string }>;
}

export function LeadsPipelineView({
  leads,
  orgName,
  availableVehicles,
  customers,
}: LeadsPipelineViewProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [customerMode, setCustomerMode] = useState<"new" | "existing">("new");

  const handleStageChange = async (leadId: string, nextStage: string) => {
    setLoadingId(leadId);
    const form = new FormData();
    form.append("leadId", leadId);
    form.append("stage", nextStage);
    await updateLeadStageAction(form);
    setLoadingId(null);
  };

  const handleCreateLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await createLeadAction(form);
    setLoading(false);
    if (res.success) {
      setMessage({ type: "success", text: "Prospecto registrado en el embudo." });
      setTimeout(() => {
        setShowNewModal(false);
        setMessage(null);
      }, 1000);
    } else {
      setMessage({ type: "error", text: res.error || "Error al registrar prospecto." });
    }
  };

  const getNextStage = (current: string) => {
    const norm = current === "VENDIDO" ? "CONVERTIDO" : current;
    const order = ["NUEVO", "CONTACTADO", "INTERESADO", "NEGOCIACION", "CONVERTIDO"];
    const idx = order.indexOf(norm);
    if (idx !== -1 && idx < order.length - 1) return order[idx + 1];
    return null;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#cc62d5] uppercase tracking-wider">
            CRM & Oportunidades
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#131517] mt-0.5">
            Embudo de Leads
          </h1>
          <p className="text-xs sm:text-sm text-[#737577] mt-1">
            Gestiona tus prospectos interesados y mantén el seguimiento directo por WhatsApp.
          </p>
        </div>

        <button
          onClick={() => {
            setShowNewModal(true);
            setMessage(null);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          + Nuevo Lead
        </button>
      </div>

      {/* Global Message */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs ${
            message.type === "success"
              ? "bg-[#cc62d5]/10 border border-[#cc62d5]/30 text-[#cc62d5]"
              : "bg-[#e83b47]/10 border border-[#e83b47]/30 text-[#e83b47]"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leads.filter(
            (l) => l.stage === stage.key || (stage.key === "CONVERTIDO" && l.stage === "VENDIDO")
          );

          return (
            <div
              key={stage.key}
              className="bg-white border border-[#b3b5b7]/30 rounded-[28px] p-4 flex flex-col justify-between shadow-2xs min-h-[400px]"
            >
              <div>
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f4f5f6]">
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${stage.badgeColor}`}>
                    {stage.label}
                  </span>
                  <span className="text-xs font-bold text-[#737577]">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Leads in this Stage */}
                <div className="space-y-3">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-[#b3b5b7]/30 rounded-2xl">
                      <p className="text-[11px] font-medium text-[#737577]">Sin prospectos</p>
                    </div>
                  ) : (
                    stageLeads.map((lead) => {
                      const waMessage = `Hola ${lead.customerName}, le escribo de ${orgName} sobre su consulta por el ${lead.vehicleName}. ¿Sigue disponible para coordinar una prueba de manejo?`;
                      const waUrl = buildWhatsAppLink(lead.whatsapp, waMessage);
                      const nextStage = getNextStage(lead.stage);

                      return (
                        <div
                          key={lead.id}
                          className="bg-[#f4f5f6] border border-[#b3b5b7]/20 rounded-2xl p-3.5 space-y-2.5 hover:bg-white hover:border-[#cc62d5]/50 transition-all shadow-2xs group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-[#131517] truncate">
                                {lead.customerName}
                              </p>
                              <span className="text-[10px] text-[#737577] block font-mono">
                                {lead.whatsapp}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-[#b3b5b7]/30 text-[#737577]">
                              {lead.source}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-[#cc62d5] font-bold">
                            <Car className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{lead.vehicleName}</span>
                          </div>

                          {lead.notes && (
                            <p className="text-[10px] text-[#737577] bg-white p-2 rounded-xl border border-[#b3b5b7]/20 line-clamp-2">
                              {lead.notes}
                            </p>
                          )}

                          {/* Quick Actions Bar */}
                          <div className="pt-2 border-t border-[#b3b5b7]/20 flex items-center justify-between gap-1">
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#131517] hover:bg-[#333537] text-white text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              <MessageCircle className="w-3 h-3 text-[#25D366]" />
                              WhatsApp
                            </a>

                            {nextStage && (
                              <button
                                onClick={() => handleStageChange(lead.id, nextStage)}
                                disabled={loadingId === lead.id}
                                className="inline-flex items-center gap-0.5 px-2 py-1 rounded-full bg-white hover:bg-[#cc62d5] text-[#131517] hover:text-white border border-[#b3b5b7]/30 text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                                title={`Avanzar a ${nextStage}`}
                              >
                                {loadingId === lead.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <span>Avanzar</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Nuevo Lead */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-[#131517]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f4f5f6]">
              <h3 className="font-bold text-[#131517] text-base">Registrar Nuevo Lead</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-[#737577] hover:text-[#131517] p-1.5 rounded-full hover:bg-[#f4f5f6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-4 text-xs">
              {/* Selector Modo Contacto */}
              <div className="p-1 bg-[#f4f5f6] rounded-full flex gap-1">
                <button
                  type="button"
                  onClick={() => setCustomerMode("new")}
                  className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    customerMode === "new" ? "bg-white text-[#cc62d5] shadow-2xs" : "text-[#737577]"
                  }`}
                >
                  Nuevo Contacto
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode("existing")}
                  className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    customerMode === "existing" ? "bg-white text-[#cc62d5] shadow-2xs" : "text-[#737577]"
                  }`}
                >
                  Cliente Existente
                </button>
              </div>

              {customerMode === "new" ? (
                <>
                  <div>
                    <label className="block font-semibold text-[#131517] mb-1">Nombre Completo *</label>
                    <input
                      name="name"
                      required
                      placeholder="Ej. Roberto Almonte"
                      className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] focus:outline-none focus:border-[#cc62d5] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#131517] mb-1">WhatsApp (RD) *</label>
                    <input
                      name="whatsapp"
                      required
                      placeholder="8095551234"
                      className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-mono focus:outline-none focus:border-[#cc62d5] focus:bg-white"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Seleccionar Cliente *</label>
                  <select
                    name="customerId"
                    required
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-semibold"
                  >
                    <option value="">Selecciona un cliente del directorio...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.whatsapp})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Vehículo de Interés</label>
                <select
                  name="vehicleId"
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                >
                  <option value="">Interés general (sin vehículo específico)</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Etapa Inicial</label>
                  <select
                    name="stage"
                    defaultValue="NUEVO"
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3 py-2.5 text-[#131517] font-bold"
                  >
                    <option value="NUEVO">Nuevo</option>
                    <option value="CONTACTADO">Contactado</option>
                    <option value="INTERESADO">Interesado</option>
                    <option value="NEGOCIACION">Negociación</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Canal de Origen</label>
                  <select
                    name="source"
                    defaultValue="WhatsApp"
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3 py-2.5 text-[#131517]"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Showroom Web">Showroom Web</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Visita Patio">Visita en Patio</option>
                    <option value="Referido">Referido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Notas / Requerimientos</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Tiene inicial de RD$400k, busca entrega antes de fin de mes..."
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-semibold text-xs shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Guardando prospecto..." : "Guardar Prospecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
