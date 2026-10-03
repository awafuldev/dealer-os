"use client";

import { useState } from "react";
import {
  Plus, CheckCircle2, AlertCircle, ShoppingBag, X, ChevronDown, ChevronUp,
  DollarSign, Car, User, Loader2, Receipt, TrendingUp,
} from "lucide-react";
import { formatCurrencyRD } from "@/lib/financials";
import { createSaleAction, addPaymentAction } from "@/actions/salesActions";

interface SaleItem {
  id: string;
  vehicleName: string;
  customerName: string;
  sellerName: string;
  finalPrice: number;
  downPayment: number;
  financedAmount: number;
  balance: number;
  status: string;
  saleDate: string;
  paymentsCount: number;
  payments: Array<{
    id: string;
    amount: number;
    method: string;
    receipt: string | null;
    date: string;
    notes: string | null;
  }>;
}

interface SalesViewProps {
  sales: SaleItem[];
  availableVehicles: Array<{ id: string; name: string; salePrice: number }>;
  customers: Array<{ id: string; name: string }>;
}

export function SalesView({ sales, availableVehicles, customers }: SalesViewProps) {
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [paymentModalSale, setPaymentModalSale] = useState<SaleItem | null>(null);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [finalPriceInput, setFinalPriceInput] = useState<number>(0);
  const [downPaymentInput, setDownPaymentInput] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleVehicleSelect = (vId: string) => {
    setSelectedVehicleId(vId);
    const found = availableVehicles.find((v) => v.id === vId);
    if (found) {
      setFinalPriceInput(found.salePrice);
      setDownPaymentInput(Math.round(found.salePrice * 0.2));
    }
  };

  const handleSaleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await createSaleAction(form);
    setLoading(false);
    if (res.success) {
      setMessage({ type: "success", text: "Â¡Venta registrada! El vehÃ­culo pasÃ³ a VENDIDO y se actualizÃ³ el historial." });
      setTimeout(() => { setShowNewSaleModal(false); setMessage(null); }, 1500);
    } else {
      setMessage({ type: "error", text: res.error || "Error al registrar la venta." });
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    if (paymentModalSale) form.append("saleId", paymentModalSale.id);
    const res = await addPaymentAction(form);
    setLoading(false);
    if (res.success) {
      setMessage({ type: "success", text: "Â¡Cobro aplicado y saldo actualizado correctamente!" });
      setTimeout(() => { setPaymentModalSale(null); setMessage(null); }, 1500);
    } else {
      setMessage({ type: "error", text: res.error || "Error al registrar cobro." });
    }
  };

  const totalRevenue = sales.reduce((sum, s) => sum + s.finalPrice, 0);
  const pendingBalance = sales.reduce((sum, s) => sum + s.balance, 0);
  const totalCollected = totalRevenue - pendingBalance;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#cc62d5] uppercase tracking-wider">
            Registro Comercial
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#131517] mt-0.5">
            Ventas y Cobros
          </h1>
          <p className="text-xs sm:text-sm text-[#737577] mt-1">
            {sales.length} {sales.length === 1 ? "venta registrada" : "ventas registradas"} en el sistema.
          </p>
        </div>
        <button
          onClick={() => { setShowNewSaleModal(true); setMessage(null); }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          + Registrar Venta
        </button>
      </div>

      {/* Global Message */}
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

      {/* Summary Cards */}
      {sales.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[28px] p-5 shadow-2xs">
            <span className="text-xs font-semibold text-[#737577]">Total facturado</span>
            <p className="text-xl font-black text-[#131517] mt-2 tracking-tight">{formatCurrencyRD(totalRevenue)}</p>
          </div>
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[28px] p-5 shadow-2xs">
            <span className="text-xs font-semibold text-[#737577]">Total cobrado</span>
            <p className="text-xl font-black text-[#cc62d5] mt-2 tracking-tight">{formatCurrencyRD(totalCollected)}</p>
          </div>
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[28px] p-5 shadow-2xs">
            <span className="text-xs font-semibold text-[#737577]">Pendiente por cobrar</span>
            <p className={`text-xl font-black mt-2 tracking-tight ${pendingBalance > 0 ? "text-[#ec660d]" : "text-[#131517]"}`}>
              {formatCurrencyRD(pendingBalance)}
            </p>
          </div>
        </div>
      )}

      {/* Lista de Ventas */}
      {sales.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#b3b5b7]/40 rounded-[32px] bg-white p-8">
          <ShoppingBag className="w-12 h-12 text-[#b3b5b7] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#131517]">AÃºn no hay ventas registradas</h3>
          <p className="text-xs text-[#737577] mt-1 max-w-sm mx-auto">
            Cuando cierres una venta asociando un vehÃ­culo a un cliente, quedarÃ¡ registrada aquÃ­ con sus pagos y saldo.
          </p>
          <button
            onClick={() => setShowNewSaleModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 mt-4 rounded-[19px] bg-[#cc62d5] text-white text-xs font-semibold shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Registrar primera venta
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((s) => (
            <div key={s.id} className="bg-white border border-[#b3b5b7]/30 rounded-[32px] overflow-hidden shadow-2xs hover:border-[#cc62d5]/40 transition-all">
              {/* Sale Card Header */}
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#cc62d5]/10 flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5 text-[#cc62d5]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-[#131517] truncate">{s.vehicleName}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <User className="w-3.5 h-3.5 text-[#737577]" />
                      <span className="text-xs text-[#737577] font-medium">{s.customerName}</span>
                      <span className="text-[11px] text-[#737577]">â€¢</span>
                      <span className="text-[11px] text-[#737577]">{s.saleDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap shrink-0">
                  {/* Precio y Saldo */}
                  <div className="text-right">
                    <p className="text-sm font-black text-[#131517]">{formatCurrencyRD(s.finalPrice)}</p>
                    {s.balance > 0 ? (
                      <p className="text-[11px] font-bold text-[#ec660d]">Saldo: {formatCurrencyRD(s.balance)}</p>
                    ) : (
                      <p className="text-[11px] font-bold text-[#cc62d5]">Completamente saldado</p>
                    )}
                  </div>

                  {/* Estado Badge */}
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    s.status === "COMPLETADA" || s.balance === 0
                      ? "bg-[#cc62d5]/15 text-[#cc62d5]"
                      : "bg-[#ec660d]/15 text-[#ec660d]"
                  }`}>
                    {s.balance === 0 ? "Saldado" : s.status}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {s.balance > 0 && (
                      <button
                        onClick={() => { setPaymentModalSale(s); setMessage(null); }}
                        className="px-3 py-1.5 rounded-full bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
                      >
                        + Cobrar
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedSaleId(expandedSaleId === s.id ? null : s.id)}
                      className="p-1.5 rounded-full hover:bg-[#f4f5f6] text-[#737577] transition-colors cursor-pointer"
                    >
                      {expandedSaleId === s.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Historial de Pagos Expandido */}
              {expandedSaleId === s.id && (
                <div className="border-t border-[#f4f5f6] p-5 sm:p-6 bg-[#f4f5f6]/50 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#131517]">
                    <span>Historial de Cobros</span>
                    <span className="text-[#737577] font-mono">
                      Pagado: {formatCurrencyRD(s.finalPrice - s.balance)} / {formatCurrencyRD(s.finalPrice)}
                    </span>
                  </div>

                  {s.payments.length === 0 ? (
                    <p className="text-xs text-[#737577] py-2">Sin cobros registrados aÃºn.</p>
                  ) : (
                    <div className="space-y-2">
                      {s.payments.map((p) => (
                        <div key={p.id} className="bg-white border border-[#b3b5b7]/30 rounded-2xl p-3.5 flex items-center justify-between text-xs shadow-2xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-[#cc62d5] font-mono">{formatCurrencyRD(p.amount)}</span>
                              <span className="text-[10px] font-bold bg-[#f4f5f6] text-[#737577] px-2 py-0.5 rounded-full border border-[#b3b5b7]/30">
                                {p.method}
                              </span>
                              {p.receipt && (
                                <span className="text-[10px] text-[#737577] font-mono">#{p.receipt}</span>
                              )}
                            </div>
                            {p.notes && <p className="text-[11px] text-[#737577] mt-0.5">{p.notes}</p>}
                          </div>
                          <span className="text-[#737577] text-[11px]">{p.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Nueva Venta */}
      {showNewSaleModal && (
        <div className="fixed inset-0 z-50 bg-[#131517]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f4f5f6]">
              <div>
                <h3 className="font-bold text-[#131517] text-base">Cerrar Nueva Venta</h3>
                <p className="text-xs text-[#737577]">El vehÃ­culo pasarÃ¡ a VENDIDO automÃ¡ticamente.</p>
              </div>
              <button onClick={() => setShowNewSaleModal(false)} className="text-[#737577] hover:text-[#131517] p-1.5 rounded-full hover:bg-[#f4f5f6]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#131517] mb-1">VehÃ­culo Disponible *</label>
                <select
                  name="vehicleId"
                  required
                  value={selectedVehicleId}
                  onChange={(e) => handleVehicleSelect(e.target.value)}
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-semibold"
                >
                  <option value="">Selecciona vehÃ­culo disponible...</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} â€” {formatCurrencyRD(v.salePrice)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Cliente Comprador *</label>
                <select name="customerId" required className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-semibold">
                  <option value="">Selecciona cliente registrado...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Precio Final (RD$) *</label>
                  <input
                    name="finalPrice" type="number" required
                    value={finalPriceInput || ""}
                    onChange={(e) => setFinalPriceInput(parseFloat(e.target.value) || 0)}
                    placeholder="Ej. 1500000"
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-black font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Inicial Recibido (RD$)</label>
                  <input
                    name="downPayment" type="number"
                    value={downPaymentInput || ""}
                    onChange={(e) => setDownPaymentInput(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#cc62d5] font-black font-mono"
                  />
                </div>
              </div>

              {/* Saldo calculado */}
              <div className="bg-[#f4f5f6] p-3.5 rounded-2xl flex justify-between items-center border border-[#b3b5b7]/30">
                <span className="text-[#737577] font-semibold">Saldo pendiente:</span>
                <span className={`font-black font-mono text-sm ${Math.max(0, finalPriceInput - downPaymentInput) > 0 ? "text-[#ec660d]" : "text-[#cc62d5]"}`}>
                  {formatCurrencyRD(Math.max(0, finalPriceInput - downPaymentInput))}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">MÃ©todo del Inicial</label>
                  <select name="paymentMethod" className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3 py-2.5 text-[#131517]">
                    <option value="Transferencia">Transferencia bancaria</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Cheque">Cheque certificado</option>
                    <option value="DepÃ³sito">DepÃ³sito bancario</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">No. Comprobante</label>
                  <input name="receipt" placeholder="REC-001" className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-mono" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Notas de la venta</label>
                <textarea name="notes" rows={2} placeholder="Financiamiento aprobado, entrega el viernes..." className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]" />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setShowNewSaleModal(false)}
                  className="flex-1 py-3 rounded-[19px] bg-white border border-[#b3b5b7]/40 text-[#131517] font-semibold hover:bg-[#f4f5f6] cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Registrar Venta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Cobro */}
      {paymentModalSale && (
        <div className="fixed inset-0 z-50 bg-[#131517]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f4f5f6]">
              <div>
                <h3 className="font-bold text-[#131517] text-base">Registrar Cobro / Abono</h3>
                <p className="text-xs text-[#737577]">{paymentModalSale.vehicleName} â€” {paymentModalSale.customerName}</p>
              </div>
              <button onClick={() => setPaymentModalSale(null)} className="text-[#737577] hover:text-[#131517] p-1.5 rounded-full hover:bg-[#f4f5f6]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-[#ec660d]/10 border border-[#ec660d]/30 p-4 rounded-2xl flex justify-between items-center">
                <span className="font-semibold text-[#131517]">Saldo pendiente actual:</span>
                <span className="font-black text-[#ec660d] font-mono text-base">{formatCurrencyRD(paymentModalSale.balance)}</span>
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Monto a Cobrar (RD$) *</label>
                <input
                  name="amount" type="number" required
                  max={paymentModalSale.balance}
                  defaultValue={paymentModalSale.balance}
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#cc62d5] font-black font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">MÃ©todo</label>
                  <select name="method" className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3 py-2.5 text-[#131517]">
                    <option value="Transferencia">Transferencia bancaria</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="DepÃ³sito">DepÃ³sito bancario</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">No. Comprobante</label>
                  <input name="receipt" placeholder="REC-XXXX" className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-mono" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Notas del abono</label>
                <input name="notes" placeholder="Saldo final, desembolso bancario..." className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]" />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setPaymentModalSale(null)}
                  className="flex-1 py-3 rounded-[19px] bg-white border border-[#b3b5b7]/40 text-[#131517] font-semibold hover:bg-[#f4f5f6] cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Registrar Pago"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

