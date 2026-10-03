"use client";

import { useState } from "react";
import {
  MessageCircle,
  Phone,
  Clock,
  Plus,
  Search,
  X,
  Car,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileEdit,
  User,
  Sparkles,
} from "lucide-react";
import { buildWhatsAppLink } from "@/lib/financials";
import { updateLeadStageAction, addLeadActivityAction } from "@/actions/leadPipelineActions";
import { createLeadAction } from "@/actions/crmActions";

export interface LeadItem {
  id: string;
  customerId: string;
  customerName: string;
  whatsapp: string;
  vehicleId: string | null;
  vehicleName: string;
  vehicleCover?: string | null;
  source: string;
  stage: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  nextFollowUp?: string | null;
  lastActivityContent?: string | null;
  lastActivityDate?: string | null;
}

interface LeadsPipelineViewProps {
  leads: LeadItem[];
  orgName: string;
  availableVehicles: Array<{ id: string; name: string; image?: string | null }>;
  customers: Array<{ id: string; name: string; whatsapp: string }>;
}

const ORDERED_STAGES = [
  { key: "NUEVO", label: "Nuevo", activeColor: "bg-[#cc62d5] text-white", normalColor: "bg-[#f4f5f6] text-[#737577]" },
  { key: "CONTACTADO", label: "Contactado", activeColor: "bg-[#131517] text-white", normalColor: "bg-[#f4f5f6] text-[#737577]" },
  { key: "INTERESADO", label: "Interesado", activeColor: "bg-[#cc62d5] text-white", normalColor: "bg-[#f4f5f6] text-[#737577]" },
  { key: "NEGOCIACION", label: "Negociación", activeColor: "bg-[#ec660d] text-white", normalColor: "bg-[#f4f5f6] text-[#737577]" },
  { key: "RESERVADO", label: "Reservado", activeColor: "bg-[#ec660d] text-white", normalColor: "bg-[#f4f5f6] text-[#737577]" },
  { key: "VENDIDO", label: "Vendido", activeColor: "bg-emerald-600 text-white", normalColor: "bg-[#f4f5f6] text-[#737577]" },
];

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "Sin fecha";
  const target = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Mañana";
  if (diffDays === -1) return "Ayer";
  if (diffDays < -1) return `Atrasado hace ${Math.abs(diffDays)}d`;
  if (diffDays > 1) return `En ${diffDays} días`;
  return target.toLocaleDateString("es-DO", { day: "numeric", month: "short" });
}

function isDueTodayOrOverdue(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const target = new Date(dateStr);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return target.getTime() <= endOfToday.getTime();
}

export function LeadsPipelineView({
  leads,
  orgName,
  availableVehicles,
  customers,
}: LeadsPipelineViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("TODOS");
  const [showNewModal, setShowNewModal] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [notingLead, setNotingLead] = useState<LeadItem | null>(null);
  const [noteQuickFollowUp, setNoteQuickFollowUp] = useState<number | null>(1); // 1 = mañana
  const [customDate, setCustomDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Clasificación: Para hoy / atrasados vs resto
  const activeLeads = leads.filter((l) => l.stage !== "VENDIDO" && l.stage !== "PERDIDO");
  const todayFollowUps = activeLeads.filter((l) => isDueTodayOrOverdue(l.nextFollowUp));
  const otherLeads = leads.filter((l) => !isDueTodayOrOverdue(l.nextFollowUp));

  // Filtrado general por búsqueda y chip
  const filterList = (list: LeadItem[]) => {
    return list.filter((l) => {
      const matchSearch =
        l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.whatsapp.includes(searchTerm) ||
        l.vehicleName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStage = stageFilter === "TODOS" || l.stage === stageFilter;
      return matchSearch && matchStage;
    });
  };

  const handleStageChange = async (leadId: string, nextStage: string) => {
    const form = new FormData();
    form.append("leadId", leadId);
    form.append("stage", nextStage);
    const res = await updateLeadStageAction(form);
    if (res.success) {
      setMessage({ type: "success", text: `Estado cambiado a ${nextStage}.` });
    }
  };

  const handleCreateLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await createLeadAction(form);
    setLoading(false);
    if (res.success) {
      setMessage({ type: "success", text: "Prospecto guardado exitosamente." });
      setShowNewModal(false);
      setShowMoreDetails(false);
    } else {
      setMessage({ type: "error", text: res.error || "No se pudo guardar el prospecto." });
    }
  };

  const handleSaveNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!notingLead) return;
    setLoading(true);
    const form = new FormData(e.currentTarget);
    form.append("leadId", notingLead.id);

    // Calcular fecha de próximo contacto
    let targetDate = new Date();
    if (noteQuickFollowUp !== null) {
      targetDate.setDate(targetDate.getDate() + noteQuickFollowUp);
      form.append("nextFollowUp", targetDate.toISOString());
    } else if (customDate) {
      form.append("nextFollowUp", new Date(customDate).toISOString());
    }

    const res = await addLeadActivityAction(form);
    setLoading(false);
    if (res.success) {
      setMessage({ type: "success", text: "Anotación y fecha de seguimiento guardadas." });
      setNotingLead(null);
      setCustomDate("");
    } else {
      setMessage({ type: "error", text: res.error || "Error al anotar." });
    }
  };

  const renderLeadCard = (lead: LeadItem, isPriority = false) => {
    const waUrl = buildWhatsAppLink(
      lead.whatsapp,
      `Hola ${lead.customerName}, le saludamos de ${orgName} respecto al vehículo ${lead.vehicleName}. ¿En qué podemos asistirle?`
    );

    return (
      <div
        key={lead.id}
        className={`bg-white border rounded-[28px] sm:rounded-[32px] p-5 shadow-2xs flex flex-col justify-between transition-all ${
          isPriority
            ? "border-[#cc62d5]/60 hover:border-[#cc62d5] ring-1 ring-[#cc62d5]/20"
            : "border-[#b3b5b7]/30 hover:border-[#cc62d5]/40"
        }`}
      >
        <div>
          {/* Top: Customer & Priority Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#131517] truncate">{lead.customerName}</h3>
                {isPriority && (
                  <span className="px-2 py-0.5 rounded-full bg-[#cc62d5]/15 text-[#cc62d5] text-[10px] font-black tracking-wide shrink-0">
                    PARA HOY
                  </span>
                )}
              </div>
              <p className="text-xs text-[#737577] font-mono mt-0.5">{lead.whatsapp}</p>
            </div>
            <span className="text-[11px] font-semibold text-[#737577] bg-[#f4f5f6] px-2.5 py-1 rounded-full shrink-0">
              {lead.source}
            </span>
          </div>

          {/* Vehicle Info */}
          <div className="mt-3.5 flex items-center gap-2.5 p-2.5 bg-[#f4f5f6]/80 rounded-2xl">
            {lead.vehicleCover ? (
              <img
                src={lead.vehicleCover}
                alt=""
                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#b3b5b7]/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#737577] shrink-0 border border-[#b3b5b7]/30">
                <Car className="w-5 h-5 stroke-[1.5]" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold uppercase text-[#737577] block">Interesado en:</span>
              <p className="text-xs font-bold text-[#131517] truncate">{lead.vehicleName}</p>
            </div>
          </div>

          {/* Fechas claras: Último contacto y Seguimiento */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs py-2 border-t border-b border-[#f4f5f6]">
            <div>
              <span className="text-[10px] text-[#737577] block">Último contacto:</span>
              <span className="font-semibold text-[#131517] text-[11px]">
                {formatRelativeTime(lead.lastActivityDate || lead.updatedAt)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#737577] block">Seguimiento:</span>
              <span
                className={`font-bold text-[11px] ${
                  isDueTodayOrOverdue(lead.nextFollowUp) ? "text-[#ec660d]" : "text-[#131517]"
                }`}
              >
                {formatRelativeTime(lead.nextFollowUp)}
              </span>
            </div>
          </div>

          {lead.notes && (
            <p className="text-xs text-[#737577] italic mt-2.5 line-clamp-2 bg-[#f4f5f6]/40 p-2 rounded-xl">
              "{lead.notes}"
            </p>
          )}

          {/* Selector visual de etapas en orden */}
          <div className="mt-4">
            <span className="text-[10px] font-bold text-[#737577] uppercase tracking-wider block mb-1.5">
              Estado:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {ORDERED_STAGES.map((st) => {
                const isActive = lead.stage === st.key;
                return (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => handleStageChange(lead.id, st.key)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive ? st.activeColor : st.normalColor
                    } hover:opacity-80`}
                  >
                    {st.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => handleStageChange(lead.id, "PERDIDO")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  lead.stage === "PERDIDO"
                    ? "bg-[#b3b5b7] text-white"
                    : "bg-[#f4f5f6] text-[#737577] hover:text-[#e83b47]"
                }`}
              >
                Perdido
              </button>
            </div>
          </div>
        </div>

        {/* 3 Botones de Acción Grandes: WhatsApp, Llamar, Anotar */}
        <div className="mt-5 pt-3.5 border-t border-[#f4f5f6] grid grid-cols-3 gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl bg-[#131517] hover:bg-[#333537] text-white text-xs font-bold transition-all text-center"
            title="Escribir por WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>WhatsApp</span>
          </a>

          <a
            href={`tel:${lead.whatsapp}`}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl bg-[#f4f5f6] hover:bg-[#e8e9ea] text-[#131517] text-xs font-bold transition-all text-center"
            title="Llamar al cliente"
          >
            <Phone className="w-3.5 h-3.5 text-[#737577]" />
            <span>Llamar</span>
          </a>

          <button
            type="button"
            onClick={() => {
              setNotingLead(lead);
              setNoteQuickFollowUp(1);
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl bg-[#cc62d5]/10 hover:bg-[#cc62d5]/20 text-[#cc62d5] text-xs font-bold transition-all text-center cursor-pointer"
            title="Anotar seguimiento"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Anotar</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header: Pregunta clave y CTA principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#cc62d5] uppercase tracking-wider">
            Gestión Comercial
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#131517] mt-0.5">
            Prospectos
          </h1>
          <p className="text-xs sm:text-sm text-[#737577] mt-1">
            ¿A quién tienes que contactar hoy para cerrar ventas?
          </p>
        </div>

        {/* ÚNICA ACCIÓN PRINCIPAL (Botón Magenta Grande) */}
        <button
          onClick={() => {
            setShowNewModal(true);
            setMessage(null);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[22px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          Nuevo Prospecto
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

      {/* Buscador & Chips de Estado (Filtro Simple sin tablas) */}
      <div className="bg-white border border-[#b3b5b7]/30 rounded-[28px] sm:rounded-[36px] p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#737577] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar prospecto por nombre, teléfono o vehículo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/30 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#131517] placeholder-[#737577] focus:outline-none focus:border-[#cc62d5] focus:bg-white transition-all"
          />
        </div>

        {/* Chips de filtro por estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setStageFilter("TODOS")}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
              stageFilter === "TODOS"
                ? "bg-[#cc62d5] text-white shadow-2xs"
                : "bg-[#f4f5f6] text-[#737577] hover:text-[#131517]"
            }`}
          >
            Todos ({leads.length})
          </button>
          {ORDERED_STAGES.map((st) => (
            <button
              key={st.key}
              type="button"
              onClick={() => setStageFilter(st.key)}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
                stageFilter === st.key
                  ? "bg-[#cc62d5] text-white shadow-2xs"
                  : "bg-[#f4f5f6] text-[#737577] hover:text-[#131517]"
              }`}
            >
              {st.label} ({leads.filter((l) => l.stage === st.key).length})
            </button>
          ))}
          <button
            type="button"
            onClick={() => setStageFilter("PERDIDO")}
            className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
              stageFilter === "PERDIDO"
                ? "bg-[#b3b5b7] text-white shadow-2xs"
                : "bg-[#f4f5f6] text-[#737577] hover:text-[#131517]"
            }`}
          >
            Perdidos ({leads.filter((l) => l.stage === "PERDIDO").length})
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: "PARA HOY" (Seguimientos pendientes de hoy y atrasados) */}
      {filterList(todayFollowUps).length > 0 && (
        <div className="space-y-3.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#cc62d5] animate-pulse"></div>
            <h2 className="text-sm font-extrabold text-[#131517] uppercase tracking-wider">
              Para hoy y pendientes urgentes ({filterList(todayFollowUps).length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filterList(todayFollowUps).map((l) => renderLeadCard(l, true))}
          </div>
        </div>
      )}

      {/* SECCIÓN 2: TODOS LOS DEMÁS PROSPECTOS */}
      <div className="space-y-3.5">
        <h2 className="text-sm font-extrabold text-[#737577] uppercase tracking-wider">
          {filterList(todayFollowUps).length > 0 ? "Otros prospectos" : "Todos los prospectos"} ({filterList(otherLeads).length})
        </h2>

        {filterList(leads).length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#b3b5b7]/40 rounded-[32px] bg-white p-8">
            <Clock className="w-12 h-12 text-[#b3b5b7] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#131517]">
              {leads.length === 0 ? "Aún no tienes prospectos registrados" : "No se encontraron prospectos con este filtro"}
            </h3>
            <p className="text-xs text-[#737577] mt-1 max-w-sm mx-auto">
              {leads.length === 0
                ? "Registra las personas que te escriben por WhatsApp o visitan tu patio para no perder ninguna venta."
                : "Prueba buscando con otro término o seleccionando 'Todos'."}
            </p>
            {leads.length === 0 && (
              <button
                onClick={() => setShowNewModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 mt-4 rounded-[22px] bg-[#cc62d5] text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Nuevo Prospecto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filterList(otherLeads).map((l) => renderLeadCard(l, false))}
          </div>
        )}
      </div>

      {/* MODAL 1: NUEVO PROSPECTO (3 CAMPOS OBLIGATORIOS, RESTO PLEGADO) */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-[#131517]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] sm:rounded-[40px] max-w-md w-full p-6 sm:p-7 shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowNewModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#f4f5f6] text-[#737577] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-bold text-[#cc62d5] uppercase tracking-wider">
                Registro rápido
              </span>
              <h3 className="text-xl font-extrabold text-[#131517] mt-0.5">Nuevo Prospecto</h3>
              <p className="text-xs text-[#737577]">
                Solo 3 datos básicos para no perder el contacto.
              </p>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              {/* Campo 1: Nombre */}
              <div>
                <label className="block text-xs font-bold text-[#131517] mb-1">
                  1. Nombre del cliente *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#131517] focus:outline-none focus:border-[#cc62d5] focus:bg-white transition-all"
                />
              </div>

              {/* Campo 2: Teléfono / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-[#131517] mb-1">
                  2. Teléfono o WhatsApp *
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  required
                  placeholder="Ej. 809-555-1234"
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#131517] font-mono focus:outline-none focus:border-[#cc62d5] focus:bg-white transition-all"
                />
              </div>

              {/* Campo 3: Vehículo de interés con foto y nombre */}
              <div>
                <label className="block text-xs font-bold text-[#131517] mb-1">
                  3. Vehículo de interés
                </label>
                <select
                  name="vehicleId"
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#131517] focus:outline-none focus:border-[#cc62d5] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="">Interés general / No especificado</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      🚗 {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plegable: Más detalles opcionales */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowMoreDetails(!showMoreDetails)}
                  className="text-xs font-bold text-[#cc62d5] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {showMoreDetails ? "− Menos opciones" : "+ Más detalles (opcional)"}
                </button>

                {showMoreDetails && (
                  <div className="mt-3 space-y-3 p-3.5 bg-[#f4f5f6] rounded-2xl text-xs animate-in fade-in">
                    <div>
                      <label className="block font-semibold text-[#131517] mb-1">Origen del prospecto</label>
                      <select
                        name="source"
                        defaultValue="WhatsApp"
                        className="w-full bg-white border border-[#b3b5b7]/30 rounded-xl px-3 py-2 text-xs"
                      >
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Web">Página Web</option>
                        <option value="Presencial">Visita al Patio</option>
                        <option value="Referido">Referido</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#131517] mb-1">Nota inicial</label>
                      <textarea
                        name="notes"
                        rows={2}
                        placeholder="Ej. Busca financiamiento con 30% de inicial."
                        className="w-full bg-white border border-[#b3b5b7]/30 rounded-xl p-2.5 text-xs"
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón Principal de Envío */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar Prospecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: "ANOTAR" (Hoja simple: ¿Qué pasó? y ¿Cuándo volver a contactar?) */}
      {notingLead && (
        <div className="fixed inset-0 z-50 bg-[#131517]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] sm:rounded-[40px] max-w-md w-full p-6 sm:p-7 shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setNotingLead(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#f4f5f6] text-[#737577] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-bold text-[#cc62d5] uppercase tracking-wider">
                Anotar Seguimiento
              </span>
              <h3 className="text-xl font-extrabold text-[#131517] mt-0.5">{notingLead.customerName}</h3>
              <p className="text-xs text-[#737577]">
                Registra qué hablaste y programa cuándo llamarle de nuevo.
              </p>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#131517] mb-1">
                  ¿Qué pasó en la conversación? *
                </label>
                <textarea
                  name="content"
                  required
                  rows={3}
                  autoFocus
                  placeholder="Ej. Le mandé fotos de la Honda CR-V. Va a consultar con el banco y me avisa."
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl p-3 text-xs sm:text-sm text-[#131517] focus:outline-none focus:border-[#cc62d5] focus:bg-white transition-all"
                ></textarea>
              </div>

              {/* Botones rápidos: ¿Cuándo volver a contactar? */}
              <div>
                <label className="block text-xs font-bold text-[#131517] mb-1.5">
                  ¿Cuándo volver a contactar?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNoteQuickFollowUp(1);
                      setCustomDate("");
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      noteQuickFollowUp === 1
                        ? "bg-[#cc62d5] text-white shadow-xs"
                        : "bg-[#f4f5f6] text-[#737577] hover:text-[#131517]"
                    }`}
                  >
                    Mañana
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNoteQuickFollowUp(3);
                      setCustomDate("");
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      noteQuickFollowUp === 3
                        ? "bg-[#cc62d5] text-white shadow-xs"
                        : "bg-[#f4f5f6] text-[#737577] hover:text-[#131517]"
                    }`}
                  >
                    En 3 días
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNoteQuickFollowUp(7);
                      setCustomDate("");
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      noteQuickFollowUp === 7
                        ? "bg-[#cc62d5] text-white shadow-xs"
                        : "bg-[#f4f5f6] text-[#737577] hover:text-[#131517]"
                    }`}
                  >
                    En 1 semana
                  </button>
                </div>

                {/* Elegir fecha manual */}
                <div className="mt-2.5">
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => {
                      setCustomDate(e.target.value);
                      setNoteQuickFollowUp(null);
                    }}
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-xl px-3 py-2 text-xs text-[#131517]"
                  />
                </div>
              </div>

              {/* Guardar en un solo toque */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar Nota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
