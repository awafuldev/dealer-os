"use client";

import { useState } from "react";
import {
  DollarSign, TrendingUp, Wallet, Building, Plus, Trash2, X, CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import { formatCurrencyRD } from "@/lib/financials";
import { createGeneralExpenseAction, deleteGeneralExpenseAction } from "@/actions/financeActions";

interface FinanceData {
  investedInventory: number;
  expectedRevenue: number;
  projectedProfit: number;
  salesVolumeTotal: number;
  realizedSalesProfit: number;
  totalOperatingExpenses: number;
  totalVehicleExpenses: number;
  netProfit: number;
  vehicleExpensesBreakdown: Array<{ category: string; amount: number }>;
  generalExpensesList: Array<{
    id: string;
    category: string;
    description: string;
    amount: number;
    date: string;
    notes?: string | null;
  }>;
}

export function FinanceView({
  data,
  vehicles,
}: {
  data: FinanceData;
  vehicles: Array<{ id: string; name: string }>;
}) {
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCreateGeneralExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await createGeneralExpenseAction(form);
    setLoading(false);
    if (res.success) {
      setMessage({ type: "success", text: "Gasto operativo registrado exitosamente." });
      setShowAddExpenseModal(false);
    } else {
      setMessage({ type: "error", text: res.error || "Error al registrar gasto." });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("¿Eliminar este gasto operativo?")) return;
    setLoading(true);
    const form = new FormData();
    form.append("expenseId", id);
    const res = await deleteGeneralExpenseAction(form);
    setLoading(false);
    if (res.success) {
      setMessage({ type: "success", text: "Gasto eliminado." });
    } else {
      setMessage({ type: "error", text: res.error || "Error al eliminar gasto." });
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#cc62d5] uppercase tracking-wider">
            Panel Financiero
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#131517] mt-0.5">
            Finanzas &amp; Rentabilidad
          </h1>
          <p className="text-xs sm:text-sm text-[#737577] mt-1">
            Consolidación de costos, ventas, gastos operativos y margen neto real.
          </p>
        </div>
        <button
          onClick={() => { setShowAddExpenseModal(true); setMessage(null); }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          + Gasto Operativo
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#b3b5b7]/30 rounded-[28px] p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#737577]">Capital en Patio</span>
            <Wallet className="w-4 h-4 text-[#b3b5b7]" />
          </div>
          <p className="text-xl font-black text-[#131517] tracking-tight">{formatCurrencyRD(data.investedInventory)}</p>
          <p className="text-[11px] text-[#737577] mt-1">Compra + adecuación activa</p>
        </div>

        <div className="bg-white border border-[#cc62d5]/30 rounded-[28px] p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#cc62d5]">Margen Realizado</span>
            <DollarSign className="w-4 h-4 text-[#cc62d5]" />
          </div>
          <p className="text-xl font-black text-[#cc62d5] tracking-tight">{formatCurrencyRD(data.realizedSalesProfit)}</p>
          <p className="text-[11px] text-[#737577] mt-1">Ventas ({formatCurrencyRD(data.salesVolumeTotal)}) − Costos</p>
        </div>

        <div className="bg-white border border-[#b3b5b7]/30 rounded-[28px] p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#737577]">Gastos Operativos</span>
            <Building className="w-4 h-4 text-[#ec660d]" />
          </div>
          <p className="text-xl font-black text-[#ec660d] tracking-tight">{formatCurrencyRD(data.totalOperatingExpenses)}</p>
          <p className="text-[11px] text-[#737577] mt-1">Local, nómina, marketing</p>
        </div>

        <div className={`bg-white border rounded-[28px] p-5 shadow-2xs ${
          data.netProfit >= 0 ? "border-[#cc62d5]/30" : "border-[#e83b47]/30"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold ${data.netProfit >= 0 ? "text-[#cc62d5]" : "text-[#e83b47]"}`}>
              Margen Neto
            </span>
            <TrendingUp className={`w-4 h-4 ${data.netProfit >= 0 ? "text-[#cc62d5]" : "text-[#e83b47]"}`} />
          </div>
          <p className={`text-xl font-black tracking-tight ${data.netProfit >= 0 ? "text-[#cc62d5]" : "text-[#e83b47]"}`}>
            {formatCurrencyRD(data.netProfit)}
          </p>
          <p className="text-[11px] text-[#737577] mt-1">Margen − Gastos operativos</p>
        </div>
      </div>

      {/* Two-column: vehicle expenses + operating expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gastos en Vehículos */}
        <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-[#131517]">Gastos en Vehículos</h2>
            <span className="text-xs font-black text-[#cc62d5] font-mono">{formatCurrencyRD(data.totalVehicleExpenses)}</span>
          </div>
          <p className="text-xs text-[#737577] mb-5">Mecánica, pintura, gomas, traspaso — costos directos de adecuación.</p>

          {data.vehicleExpensesBreakdown.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-[#b3b5b7]/40 rounded-2xl">
              <p className="text-xs text-[#737577]">Sin gastos en vehículos aún.</p>
              <p className="text-[11px] text-[#b3b5b7] mt-1">Agrega gastos desde el expediente de cada vehículo.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.vehicleExpensesBreakdown.map((item) => (
                <div key={item.category} className="flex items-center justify-between p-3.5 bg-[#f4f5f6] border border-[#b3b5b7]/20 rounded-2xl text-xs">
                  <span className="font-semibold text-[#131517]">{item.category}</span>
                  <span className="font-black text-[#cc62d5] font-mono">{formatCurrencyRD(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gastos Operativos Generales */}
        <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-[#131517]">Gastos Operativos del Dealer</h2>
            <span className="text-xs font-black text-[#ec660d] font-mono">{formatCurrencyRD(data.totalOperatingExpenses)}</span>
          </div>
          <p className="text-xs text-[#737577] mb-5">Gastos fijos del negocio: alquiler, nómina, publicidad, servicios.</p>

          {data.generalExpensesList.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-[#b3b5b7]/40 rounded-2xl">
              <p className="text-xs text-[#737577]">Sin gastos operativos registrados.</p>
              <button
                onClick={() => setShowAddExpenseModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-3 rounded-full bg-[#f4f5f6] hover:bg-[#e8e9ea] text-[#131517] text-xs font-semibold cursor-pointer border border-[#b3b5b7]/40"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar primero
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {data.generalExpensesList.map((g) => (
                <div key={g.id} className="p-3.5 bg-[#f4f5f6] border border-[#b3b5b7]/20 rounded-2xl flex items-center justify-between text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#131517] truncate">{g.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold bg-white text-[#737577] px-2 py-0.5 rounded-full border border-[#b3b5b7]/30">
                        {g.category}
                      </span>
                      <span className="text-[10px] text-[#737577]">{g.date}</span>
                    </div>
                    {g.notes && <p className="text-[11px] text-[#737577] mt-0.5">{g.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="font-black text-[#131517] font-mono text-sm">{formatCurrencyRD(g.amount)}</span>
                    <button
                      onClick={() => handleDeleteExpense(g.id)}
                      className="text-[#b3b5b7] hover:text-[#e83b47] p-1 transition-colors cursor-pointer"
                      title="Eliminar gasto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Registrar Gasto Operativo */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-[#131517]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f4f5f6]">
              <div>
                <h3 className="font-bold text-[#131517] text-base">Registrar Gasto Operativo</h3>
                <p className="text-xs text-[#737577]">Agrega gastos fijos o variables del negocio.</p>
              </div>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-[#737577] hover:text-[#131517] p-1.5 rounded-full hover:bg-[#f4f5f6]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGeneralExpense} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#131517] mb-1">Categoría</label>
                <select name="category" className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-semibold">
                  <option value="Local">Alquiler de local / Patio</option>
                  <option value="Nómina">Nómina y comisiones</option>
                  <option value="Marketing">Marketing y publicidad</option>
                  <option value="Servicios">Servicios (Luz, agua, internet)</option>
                  <option value="Mantenimiento local">Mantenimiento y limpieza</option>
                  <option value="Impuestos">Impuestos / Contabilidad</option>
                  <option value="Otros">Otros gastos generales</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Concepto / Descripción *</label>
                <input
                  name="description" required
                  placeholder="Ej. Pago pauta publicitaria Instagram del mes"
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] focus:outline-none focus:border-[#cc62d5] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Monto (RD$) *</label>
                  <input
                    name="amount" type="number" required
                    placeholder="Ej. 35000"
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#cc62d5] font-black font-mono focus:outline-none focus:border-[#cc62d5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Fecha</label>
                  <input
                    name="date" type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] focus:outline-none focus:border-[#cc62d5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Notas / Comprobante</label>
                <input
                  name="notes"
                  placeholder="B01-12345678 o descripción adicional"
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] focus:outline-none focus:border-[#cc62d5]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setShowAddExpenseModal(false)}
                  className="flex-1 py-3 rounded-[19px] bg-white border border-[#b3b5b7]/40 text-[#131517] font-semibold hover:bg-[#f4f5f6] cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar Gasto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
