"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText, Plus, Download, Printer, Trash2, CheckCircle2, Clock, Search, X, FileCheck, AlertCircle, Loader2,
} from "lucide-react";
import { createDocumentAction, deleteDocumentAction, updateDocumentStatusAction } from "@/actions/documentActions";

interface DocumentItem {
  id: string;
  title: string;
  category: string;
  status: string;
  fileUrl: string | null;
  fileSize: number | null;
  uploadedBy: string | null;
  createdAt: string;
  customerName: string | null;
  vehicleName: string | null;
  saleId: string | null;
  notes: string | null;
}

interface SaleDocItem {
  id: string;
  vehicleName: string;
  customerName: string;
  finalPrice: number;
  saleDate: string;
}

interface DocumentsViewProps {
  documents: DocumentItem[];
  sales: SaleDocItem[];
  customers: Array<{ id: string; name: string }>;
  vehicles: Array<{ id: string; name: string }>;
}

export function DocumentsView({ documents, sales, customers, vehicles }: DocumentsViewProps) {
  const [activeTab, setActiveTab] = useState<"documents" | "sales-agreements">("documents");
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("TODOS");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filteredDocs = documents.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.customerName && d.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.vehicleName && d.vehicleName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      d.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "TODOS" || d.category === categoryFilter;
    const matchesStatus = statusFilter === "TODOS" || d.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateDoc = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await createDocumentAction(form);
    setLoading(false);
    if (res.success) {
      setMessage({ type: "success", text: "Documento registrado exitosamente." });
      setShowAddDocModal(false);
    } else {
      setMessage({ type: "error", text: res.error || "Error al registrar documento." });
    }
  };

  const handleToggleStatus = async (docId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Completo" ? "Pendiente" : "Completo";
    const form = new FormData();
    form.append("documentId", docId);
    form.append("status", nextStatus);
    await updateDocumentStatusAction(form);
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm("¿Eliminar este registro de documento?")) return;
    setLoading(true);
    const form = new FormData();
    form.append("documentId", docId);
    const res = await deleteDocumentAction(form);
    setLoading(false);
    if (res.success) {
      setMessage({ type: "success", text: "Documento eliminado." });
    } else {
      setMessage({ type: "error", text: res.error || "Error al eliminar." });
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#cc62d5] uppercase tracking-wider">
            Gestión Documental
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#131517] mt-0.5">
            Documentos &amp; Contratos
          </h1>
          <p className="text-xs sm:text-sm text-[#737577] mt-1">
            Matrículas, pólizas, contratos de venta, recibos y facturas.
          </p>
        </div>
        <button
          onClick={() => { setShowAddDocModal(true); setMessage(null); }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          + Registrar Documento
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs ${
          message.type === "success"
            ? "bg-[#cc62d5]/10 border border-[#cc62d5]/30 text-[#cc62d5]"
            : "bg-[#e83b47]/10 border border-[#e83b47]/30 text-[#e83b47]"
        }`}>
          <div className="flex items-center gap-2">
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-[#f4f5f6] p-1 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab("documents")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === "documents"
              ? "bg-white text-[#cc62d5] shadow-sm border border-[#b3b5b7]/20"
              : "text-[#737577] hover:text-[#131517]"
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          Expedientes ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab("sales-agreements")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === "sales-agreements"
              ? "bg-white text-[#cc62d5] shadow-sm border border-[#b3b5b7]/20"
              : "text-[#737577] hover:text-[#131517]"
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          Actos de Venta ({sales.length})
        </button>
      </div>

      {/* Tab 1: Documents */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white border border-[#b3b5b7]/30 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#737577] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por título, cliente o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#131517] placeholder-[#737577] focus:outline-none focus:border-[#cc62d5]"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-xl px-3 py-2 text-xs font-semibold text-[#131517] focus:outline-none cursor-pointer"
              >
                <option value="TODOS">Todas las categorías</option>
                <option value="Contrato de venta">Contrato de venta</option>
                <option value="Matrícula">Matrícula / Documento</option>
                <option value="Recibo">Recibo / Comprobante</option>
                <option value="Factura">Factura</option>
                <option value="Seguro">Póliza de seguro</option>
                <option value="Cédula">Cédula / Identidad</option>
                <option value="Otros">Otros</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-xl px-3 py-2 text-xs font-semibold text-[#131517] focus:outline-none cursor-pointer"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="Completo">Completos</option>
                <option value="Pendiente">Pendientes</option>
              </select>
            </div>
          </div>

          {/* Document Cards */}
          {filteredDocs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#b3b5b7]/40 rounded-[32px] bg-white">
              <FileText className="w-12 h-12 text-[#b3b5b7] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#131517]">
                {documents.length === 0 ? "Aún no hay documentos registrados" : "Sin resultados"}
              </h3>
              <p className="text-xs text-[#737577] mt-1 max-w-xs mx-auto">
                {documents.length === 0
                  ? "Organiza la documentación de compras, ventas y vehículos aquí."
                  : "Prueba ajustando los filtros de búsqueda."}
              </p>
              {documents.length === 0 && (
                <button
                  onClick={() => setShowAddDocModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 mt-4 rounded-[19px] bg-[#cc62d5] text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Registrar primero
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="bg-white border border-[#b3b5b7]/30 rounded-[24px] p-4 flex items-center gap-4 shadow-2xs hover:border-[#cc62d5]/30 transition-all">
                  <div className="w-10 h-10 rounded-2xl bg-[#cc62d5]/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#cc62d5]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#131517] truncate">{doc.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold bg-[#f4f5f6] text-[#737577] px-2 py-0.5 rounded-full border border-[#b3b5b7]/30">
                        {doc.category}
                      </span>
                      {doc.vehicleName && (
                        <span className="text-[11px] text-[#737577]">{doc.vehicleName}</span>
                      )}
                      {doc.customerName && (
                        <span className="text-[11px] text-[#737577]">· {doc.customerName}</span>
                      )}
                      {!doc.vehicleName && !doc.customerName && (
                        <span className="text-[11px] text-[#737577]">General del Dealer</span>
                      )}
                      <span className="text-[11px] text-[#b3b5b7] font-mono">{doc.createdAt}</span>
                    </div>
                    {doc.notes && <p className="text-[11px] text-[#737577] mt-0.5">{doc.notes}</p>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleStatus(doc.id, doc.status)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                        doc.status === "Completo"
                          ? "bg-[#cc62d5]/10 text-[#cc62d5] border-[#cc62d5]/30 hover:bg-[#cc62d5]/20"
                          : "bg-[#ec660d]/10 text-[#ec660d] border-[#ec660d]/30 hover:bg-[#ec660d]/20"
                      }`}
                      title="Clic para cambiar estado"
                    >
                      {doc.status === "Completo" ? <CheckCircle2 className="w-3.5 h-3.5 inline mr-0.5" /> : <Clock className="w-3.5 h-3.5 inline mr-0.5" />}
                      {doc.status}
                    </button>

                    {doc.fileUrl ? (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full hover:bg-[#f4f5f6] text-[#cc62d5] transition-colors"
                        title="Abrir o descargar archivo"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-[#b3b5b7] px-2">Sin adjunto</span>
                    )}

                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-1.5 rounded-full hover:bg-[#f4f5f6] text-[#b3b5b7] hover:text-[#e83b47] transition-colors cursor-pointer"
                      title="Eliminar documento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Sales agreements */}
      {activeTab === "sales-agreements" && (
        <div className="space-y-4">
          <p className="text-xs text-[#737577]">
            Actos de Venta bajo firma privada generados automáticamente con los datos de las operaciones registradas.
          </p>

          {sales.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#b3b5b7]/40 rounded-[32px] bg-white">
              <Printer className="w-12 h-12 text-[#b3b5b7] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#131517]">No hay ventas cerradas aún</h3>
              <p className="text-xs text-[#737577] mt-1">
                Al registrar una venta en el módulo comercial, podrás generar e imprimir su acto de venta aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sales.map((s) => (
                <div key={s.id} className="bg-white border border-[#b3b5b7]/30 rounded-[32px] p-5 flex flex-col justify-between shadow-2xs hover:border-[#cc62d5]/30 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold bg-[#cc62d5]/10 text-[#cc62d5] px-2.5 py-1 rounded-full border border-[#cc62d5]/20">
                        Acto de Venta
                      </span>
                      <span className="text-[11px] text-[#737577] font-mono">{s.saleDate}</span>
                    </div>
                    <h3 className="text-base font-bold text-[#131517]">{s.vehicleName}</h3>
                    <p className="text-xs text-[#737577] mt-1">Comprador: <span className="font-semibold text-[#131517]">{s.customerName}</span></p>
                  </div>

                  <div className="pt-4 border-t border-[#f4f5f6] flex items-center justify-between mt-4">
                    <span className="text-sm font-black text-[#131517] font-mono">
                      RD\${s.finalPrice.toLocaleString()}
                    </span>
                    <Link
                      href={`/contracts/${s.id}`}
                      target="_blank"
                      className="px-4 py-2 rounded-[19px] bg-[#131517] hover:bg-[#333537] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Ver / Imprimir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Registrar Documento */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 bg-[#131517]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f4f5f6]">
              <div>
                <h3 className="font-bold text-[#131517] text-base">Registrar Documento</h3>
                <p className="text-xs text-[#737577]">Agrega un documento al expediente del dealer.</p>
              </div>
              <button onClick={() => setShowAddDocModal(false)} className="text-[#737577] hover:text-[#131517] p-1.5 rounded-full hover:bg-[#f4f5f6]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoc} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#131517] mb-1">Título del Documento *</label>
                <input
                  name="title" required
                  placeholder="Ej. Matrícula original, Póliza Seguros Universal"
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] focus:outline-none focus:border-[#cc62d5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Categoría</label>
                  <select name="category" className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3 py-2.5 text-[#131517] font-semibold">
                    <option value="Contrato de venta">Contrato de venta</option>
                    <option value="Matrícula">Matrícula / DGII</option>
                    <option value="Recibo">Recibo / Comprobante</option>
                    <option value="Factura">Factura</option>
                    <option value="Seguro">Póliza de seguro</option>
                    <option value="Cédula">Cédula de identidad</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Estado</label>
                  <select name="status" className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3 py-2.5 text-[#131517] font-semibold">
                    <option value="Completo">Completo</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Asociar a Vehículo</label>
                <select name="vehicleId" className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3 py-2.5 text-[#131517]">
                  <option value="">Sin asociar / General</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Asociar a Cliente</label>
                <select name="customerId" className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3 py-2.5 text-[#131517]">
                  <option value="">Sin asociar / General</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Archivo Adjunto (PDF o Imagen)</label>
                <input
                  name="file" type="file"
                  accept=".pdf,image/*,.doc,.docx"
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#737577] file:mr-3 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:text-xs file:bg-[#cc62d5]/10 file:text-[#cc62d5] file:font-semibold cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Notas adicionales</label>
                <input
                  name="notes"
                  placeholder="Vence en diciembre 2026..."
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] focus:outline-none focus:border-[#cc62d5]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setShowAddDocModal(false)}
                  className="flex-1 py-3 rounded-[19px] bg-white border border-[#b3b5b7]/40 text-[#131517] font-semibold hover:bg-[#f4f5f6] cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar Documento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
