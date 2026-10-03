"use client";

import { useState } from "react";
import { Search, Plus, MessageCircle, Phone, Mail, UserCheck, Calendar, DollarSign, X, Edit3, Trash2, Users, CheckCircle2, AlertCircle, ShoppingBag, Clock } from "lucide-react";
import { formatCurrencyRD, buildWhatsAppLink } from "@/lib/financials";
import { createCustomerAction, updateCustomerAction, deleteCustomerAction, createLeadAction } from "@/actions/crmActions";

interface CustomerItem {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string;
  email: string | null;
  cedulaOrRnc: string | null;
  budget: number | null;
  notes: string | null;
  leadsCount: number;
  salesCount: number;
  reservationsCount: number;
  createdAt: string;
}

interface CustomersViewProps {
  customers: CustomerItem[];
  availableVehicles: Array<{ id: string; name: string }>;
  orgName: string;
}

export function CustomersView({ customers, availableVehicles, orgName }: CustomersViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);
  const [leadModalCustomer, setLeadModalCustomer] = useState<CustomerItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [activeFilterTab, setActiveFilterTab] = useState<"todos" | "clientes" | "prospectos">("todos");

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.whatsapp.includes(searchTerm) ||
      (c.cedulaOrRnc && c.cedulaOrRnc.includes(searchTerm)) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilterTab === "clientes") {
      return c.salesCount > 0;
    }
    if (activeFilterTab === "prospectos") {
      return c.salesCount === 0 && c.leadsCount > 0;
    }
    return true;
  });

  const handleCreateCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await createCustomerAction(form);
    setLoading(false);
    if (res.success) {
      setMessage({ type: "success", text: "Cliente registrado exitosamente." });
      setShowCreateModal(false);
    } else {
      setMessage({ type: "error", text: res.error || "Error al crear cliente." });
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setLoading(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    form.append("customerId", editingCustomer.id);
    const res = await updateCustomerAction(form);
    setLoading(false);
    if (res.success) {
      setMessage({ type: "success", text: "Cliente actualizado exitosamente." });
      setEditingCustomer(null);
    } else {
      setMessage({ type: "error", text: res.error || "Error al actualizar cliente." });
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("Â¿Eliminar este cliente? No se puede deshacer.")) return;
    setLoading(true);
    const form = new FormData();
    form.append("customerId", customerId);
    const res = await deleteCustomerAction(form);
    setLoading(false);
    if (res.success) {
      setMessage({ type: "success", text: "Cliente eliminado del directorio." });
    } else {
      setMessage({ type: "error", text: res.error || "Error al eliminar cliente." });
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    if (leadModalCustomer) form.append("customerId", leadModalCustomer.id);

    const res = await createLeadAction(form);
    setLoading(false);
    if (res.success) {
      setMessage({ type: "success", text: "Prospecto registrado correctamente." });
      setLeadModalCustomer(null);
    } else {
      setMessage({ type: "error", text: res.error || "No se pudo registrar el prospecto." });
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#cc62d5] uppercase tracking-wider">
            Directorio Comercial
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#131517] mt-0.5">
            Clientes y Compradores
          </h1>
          <p className="text-xs sm:text-sm text-[#737577] mt-1">
            {customers.length} {customers.length === 1 ? "contacto registrado" : "contactos registrados"} en tu dealer.
          </p>
        </div>

        <button
          onClick={() => {
            setShowCreateModal(true);
            setMessage(null);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          + Nuevo Cliente
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

      {/* Filtros por Segmento y Buscador */}
      <div className="bg-white border border-[#b3b5b7]/30 rounded-[28px] sm:rounded-[36px] p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveFilterTab("todos")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilterTab === "todos"
                ? "bg-[#cc62d5] text-white shadow-2xs"
                : "bg-[#f4f5f6] text-[#737577] hover:text-[#131517]"
            }`}
          >
            Todos ({customers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTab("clientes")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilterTab === "clientes"
                ? "bg-[#cc62d5] text-white shadow-2xs"
                : "bg-[#f4f5f6] text-[#737577] hover:text-[#131517]"
            }`}
          >
            Compradores ({customers.filter((c) => c.salesCount > 0).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTab("prospectos")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilterTab === "prospectos"
                ? "bg-[#cc62d5] text-white shadow-2xs"
                : "bg-[#f4f5f6] text-[#737577] hover:text-[#131517]"
            }`}
          >
            Prospectos Activos ({customers.filter((c) => c.salesCount === 0 && c.leadsCount > 0).length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#737577] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, telÃ©fono, cÃ©dula o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/30 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#131517] placeholder-[#737577] focus:outline-none focus:border-[#cc62d5] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Lista de Clientes */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#b3b5b7]/40 rounded-[32px] bg-white p-8">
          <Users className="w-12 h-12 text-[#b3b5b7] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#131517]">
            {customers.length === 0 ? "AÃºn no tienes clientes registrados" : "No se encontraron clientes"}
          </h3>
          <p className="text-xs text-[#737577] mt-1 max-w-sm mx-auto">
            {customers.length === 0
              ? "Registra clientes para asociarlos a cotizaciones, ventas y contratos."
              : "Prueba buscando con otro tÃ©rmino."}
          </p>
          {customers.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 mt-4 rounded-[19px] bg-[#cc62d5] text-white text-xs font-semibold shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Agregar primer cliente
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => {
            const waUrl = buildWhatsAppLink(
              c.whatsapp,
              `Hola ${c.name}, le escribimos de ${orgName}. Â¿En quÃ© podemos asistirle hoy?`
            );

            return (
              <div
                key={c.id}
                className="bg-white border border-[#b3b5b7]/30 hover:border-[#cc62d5]/60 transition-all rounded-[32px] p-5 sm:p-6 flex flex-col justify-between shadow-2xs group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-[#cc62d5]/10 text-[#cc62d5] font-black text-sm flex items-center justify-center shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-[#131517] truncate">{c.name}</h3>
                        <p className="text-[11px] text-[#737577] font-mono">{c.whatsapp}</p>
                      </div>
                    </div>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-[#131517] hover:bg-[#333537] text-white shrink-0 transition-colors"
                      title="Escribir por WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    </a>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f4f5f6] space-y-2 text-xs">
                    {c.cedulaOrRnc && (
                      <div className="flex justify-between text-[#737577]">
                        <span>CÃ©dula / RNC:</span>
                        <span className="font-mono font-bold text-[#131517]">{c.cedulaOrRnc}</span>
                      </div>
                    )}
                    {c.budget && (
                      <div className="flex justify-between text-[#737577]">
                        <span>Presupuesto:</span>
                        <span className="font-bold text-[#131517]">{formatCurrencyRD(c.budget)}</span>
                      </div>
                    )}
                    {c.notes && (
                      <p className="text-[11px] text-[#737577] bg-[#f4f5f6] p-2.5 rounded-2xl line-clamp-2 mt-2">
                        {c.notes}
                      </p>
                    )}
                  </div>

                  {/* Badges de Actividad */}
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    {c.salesCount > 0 && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#cc62d5]/15 text-[#cc62d5] flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" /> {c.salesCount} {c.salesCount === 1 ? "compra" : "compras"}
                      </span>
                    )}
                    {c.leadsCount > 0 && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#131517]/5 text-[#131517] flex items-center gap-1 border border-[#b3b5b7]/30">
                        <Clock className="w-3 h-3 text-[#ec660d]" /> {c.leadsCount} en seguimiento
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-[#f4f5f6] flex items-center justify-between">
                  <button
                    onClick={() => setLeadModalCustomer(c)}
                    className="text-xs font-semibold text-[#cc62d5] hover:underline cursor-pointer"
                  >
                    + Registrar interés
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingCustomer(c)}
                      className="p-1.5 rounded-xl hover:bg-[#f4f5f6] text-[#737577] hover:text-[#131517] cursor-pointer"
                      title="Editar cliente"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(c.id)}
                      className="p-1.5 rounded-xl hover:bg-[#e83b47]/10 text-[#737577] hover:text-[#e83b47] cursor-pointer"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Crear Cliente */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#131517]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f4f5f6]">
              <h3 className="font-bold text-[#131517] text-base">Registrar Nuevo Cliente</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#737577] hover:text-[#131517] p-1.5 rounded-full hover:bg-[#f4f5f6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#131517] mb-1">Nombre Completo *</label>
                <input
                  name="name"
                  required
                  placeholder="Ej. Fernando Ramos"
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] focus:outline-none focus:border-[#cc62d5] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">WhatsApp (RD) *</label>
                  <input
                    name="whatsapp"
                    required
                    placeholder="8295551234"
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-mono focus:outline-none focus:border-[#cc62d5] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">CÃ©dula o RNC</label>
                  <input
                    name="cedulaOrRnc"
                    placeholder="001-XXXXXXX-X"
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-mono focus:outline-none focus:border-[#cc62d5] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">TelÃ©fono Alterno</label>
                  <input
                    name="phone"
                    placeholder="8095550000"
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Presupuesto (RD$)</label>
                  <input
                    name="budget"
                    type="number"
                    placeholder="Ej. 1200000"
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Correo ElectrÃ³nico</label>
                <input
                  name="email"
                  type="email"
                  placeholder="cliente@correo.com"
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Notas / Preferencias</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Interesado en camionetas doble cabina o SUV compacta..."
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-semibold text-xs shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Cliente */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-[#131517]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f4f5f6]">
              <h3 className="font-bold text-[#131517] text-base">Editar Cliente</h3>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-[#737577] hover:text-[#131517] p-1.5 rounded-full hover:bg-[#f4f5f6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#131517] mb-1">Nombre Completo *</label>
                <input
                  name="name"
                  defaultValue={editingCustomer.name}
                  required
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">WhatsApp (RD) *</label>
                  <input
                    name="whatsapp"
                    defaultValue={editingCustomer.whatsapp}
                    required
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">CÃ©dula o RNC</label>
                  <input
                    name="cedulaOrRnc"
                    defaultValue={editingCustomer.cedulaOrRnc || ""}
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">TelÃ©fono Alterno</label>
                  <input
                    name="phone"
                    defaultValue={editingCustomer.phone || ""}
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Presupuesto (RD$)</label>
                  <input
                    name="budget"
                    type="number"
                    defaultValue={editingCustomer.budget || ""}
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Correo ElectrÃ³nico</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingCustomer.email || ""}
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Notas</label>
                <textarea
                  name="notes"
                  defaultValue={editingCustomer.notes || ""}
                  rows={2}
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-semibold text-xs shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Actualizando..." : "Actualizar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Interés para este Cliente */}
      {leadModalCustomer && (
        <div className="fixed inset-0 z-50 bg-[#131517]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f4f5f6]">
              <div>
                <h3 className="font-bold text-[#131517] text-base">Registrar Interés para {leadModalCustomer.name}</h3>
                <p className="text-xs text-[#737577]">Asocia un vehÃ­culo de interÃ©s</p>
              </div>
              <button
                onClick={() => setLeadModalCustomer(null)}
                className="text-[#737577] hover:text-[#131517] p-1.5 rounded-full hover:bg-[#f4f5f6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLeadSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#131517] mb-1">VehÃ­culo de InterÃ©s</label>
                <select
                  name="vehicleId"
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                >
                  <option value="">InterÃ©s general (sin vehÃ­culo especÃ­fico)</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Etapa</label>
                  <select
                    name="stage"
                    defaultValue="INTERESADO"
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3 py-2.5 text-[#131517] font-bold"
                  >
                    <option value="NUEVO">Nuevo</option>
                    <option value="CONTACTADO">Contactado</option>
                    <option value="INTERESADO">Interesado</option>
                    <option value="NEGOCIACION">NegociaciÃ³n</option>
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
                    <option value="Visita Patio">Visita en Patio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Notas</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Detalles sobre su consulta..."
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-semibold text-xs shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Registrar InterÃ©s"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

