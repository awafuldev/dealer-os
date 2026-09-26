"use client";

import {
  Car,
  Clock,
  DollarSign,
  TrendingUp,
  MessageCircle,
  ArrowRight,
  Plus,
  ShoppingBag,
  Activity,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { formatCurrencyRD, buildWhatsAppLink } from "@/lib/financials";

interface DashboardData {
  counts: {
    totalVehicles: number;
    availableVehicles: number;
    reservedVehicles: number;
    soldVehicles: number;
    activeLeads: number;
    totalCustomers: number;
  };
  financials: {
    investedCapital: number;
    potentialRevenue: number;
    potentialProfit: number;
    monthlySalesVolume: number;
    monthlySalesProfit: number;
  };
  recentVehicles: Array<{
    id: string;
    brand: string;
    model: string;
    year: number;
    mileage: number | null;
    salePrice: number;
    status: string;
    coverImage: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entity: string;
    details: string;
    createdAt: string;
  }>;
  pendingFollowUps: Array<{
    id: string;
    customerName: string;
    whatsapp: string;
    vehicleName: string;
    notes: string | null;
    stage: string;
  }>;
}

export function DashboardView({ data, orgName }: { data: DashboardData; orgName: string }) {
  const triggerQuickAdd = () => {
    const btn = document.querySelector('button[title="Acción Rápida (+)"]') as HTMLButtonElement;
    if (btn) btn.click();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 md:space-y-8">
      {/* Header: Greeting & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#cc62d5] uppercase tracking-wider">
            Resumen del negocio
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#131517] mt-0.5">
            Buenos días, {orgName}
          </h1>
          <p className="text-xs sm:text-sm text-[#737577] mt-1">
            Aquí tienes la situación actual de tu concesionario en tiempo real.
          </p>
        </div>

        {/* Quick Action Pill Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={triggerQuickAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            + Agregar Vehículo
          </button>
          <Link
            href="/leads"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[19px] bg-white hover:bg-[#f4f5f6] border border-[#131517] text-[#131517] font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            + Nuevo Lead
          </Link>
          <Link
            href="/sales"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[19px] bg-white hover:bg-[#f4f5f6] border border-[#131517] text-[#131517] font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            + Registrar Venta
          </Link>
        </div>
      </div>

      {/* 1. 4 Metric Cards (Glow Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Vehículos Disponibles */}
        <div className="bg-white border border-[#b3b5b7]/30 rounded-[28px] sm:rounded-[36px] p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737577]">Vehículos disponibles</span>
            <div className="w-8 h-8 rounded-full bg-[#cc62d5]/10 flex items-center justify-center text-[#cc62d5]">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black text-[#131517] tracking-tight">
              {data.counts.availableVehicles}
            </span>
            <span className="text-xs text-[#737577] ml-2 font-medium">de {data.counts.totalVehicles} total</span>
          </div>
          <div className="mt-3 text-[11px] text-[#737577] flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${data.counts.reservedVehicles > 0 ? "bg-[#ec660d]" : "bg-[#b3b5b7]"}`}></span>
            <span>{data.counts.reservedVehicles} reservados</span>
          </div>
        </div>

        {/* Vehículos Vendidos */}
        <div className="bg-white border border-[#b3b5b7]/30 rounded-[28px] sm:rounded-[36px] p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737577]">Vehículos vendidos</span>
            <div className="w-8 h-8 rounded-full bg-[#131517]/5 flex items-center justify-center text-[#131517]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black text-[#131517] tracking-tight">
              {data.counts.soldVehicles}
            </span>
            <span className="text-xs text-[#737577] ml-2 font-medium">unidades</span>
          </div>
          <div className="mt-3 text-[11px] font-semibold text-[#131517]">
            {formatCurrencyRD(data.financials.monthlySalesVolume)} facturados
          </div>
        </div>

        {/* Leads Activos */}
        <div className="bg-white border border-[#b3b5b7]/30 rounded-[28px] sm:rounded-[36px] p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737577]">Leads activos</span>
            <div className="w-8 h-8 rounded-full bg-[#ec660d]/10 flex items-center justify-center text-[#ec660d]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black text-[#131517] tracking-tight">
              {data.counts.activeLeads}
            </span>
            <span className="text-xs text-[#737577] ml-2 font-medium">prospectos</span>
          </div>
          <div className="mt-3 text-[11px] text-[#737577]">
            {data.pendingFollowUps.length} en seguimiento directo
          </div>
        </div>

        {/* Ganancia Realizada */}
        <div className="bg-white border border-[#cc62d5]/30 rounded-[28px] sm:rounded-[36px] p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#cc62d5]">Ganancia realizada</span>
            <div className="w-8 h-8 rounded-full bg-[#cc62d5] flex items-center justify-center text-white">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-[#131517] tracking-tight">
              {formatCurrencyRD(data.financials.monthlySalesProfit)}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-[#737577]">
            Margen neto de ventas cerradas
          </div>
        </div>
      </div>

      {/* 2. Inventario Reciente */}
      <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] p-5 sm:p-7 shadow-2xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#131517]">Inventario Reciente</h2>
            <p className="text-xs text-[#737577]">Últimos vehículos ingresados a patio</p>
          </div>
          <Link
            href="/inventory"
            className="text-xs font-semibold text-[#cc62d5] hover:underline inline-flex items-center gap-1"
          >
            Ver todo el inventario <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.recentVehicles.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-[#b3b5b7]/40 rounded-3xl">
            <Car className="w-10 h-10 text-[#b3b5b7] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#131517]">No tienes vehículos en inventario</p>
            <p className="text-xs text-[#737577] mt-1 max-w-sm mx-auto">
              Agrega tu primer vehículo para comenzar a gestionar tu stock y publicarlo en el showroom.
            </p>
            <button
              onClick={triggerQuickAdd}
              className="mt-4 px-4 py-2 rounded-[19px] bg-[#cc62d5] text-white text-xs font-semibold shadow-sm cursor-pointer"
            >
              + Agregar Vehículo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.recentVehicles.map((v) => (
              <Link
                key={v.id}
                href={`/inventory/${v.id}`}
                className="group border border-[#b3b5b7]/30 hover:border-[#cc62d5] rounded-3xl overflow-hidden bg-[#f4f5f6]/50 hover:bg-white transition-all flex flex-col"
              >
                <div className="aspect-[4/3] bg-zinc-200 relative overflow-hidden">
                  <img
                    src={v.coverImage}
                    alt={`${v.brand} ${v.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      v.status === "DISPONIBLE"
                        ? "bg-white/90 text-[#131517] backdrop-blur-xs"
                        : v.status === "RESERVADO"
                        ? "bg-[#ec660d] text-white"
                        : "bg-[#131517] text-white"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#131517] group-hover:text-[#cc62d5] transition-colors">
                      {v.brand} {v.model} {v.year}
                    </h3>
                    {v.mileage && (
                      <p className="text-[11px] text-[#737577] mt-0.5">
                        {v.mileage.toLocaleString()} km
                      </p>
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#b3b5b7]/20 flex items-center justify-between">
                    <span className="text-xs text-[#737577]">Precio</span>
                    <span className="text-sm font-black text-[#131517]">
                      {formatCurrencyRD(v.salePrice)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 3. Dos Columnas: Seguimientos Activos & Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seguimiento de Leads con WhatsApp */}
        <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] p-5 sm:p-7 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#131517]">Seguimiento de Leads</h2>
                <p className="text-xs text-[#737577]">Prospectos interesados que esperan respuesta</p>
              </div>
              <span className="text-xs font-bold text-[#ec660d] bg-[#ec660d]/10 px-2.5 py-1 rounded-full">
                {data.pendingFollowUps.length} activos
              </span>
            </div>

            {data.pendingFollowUps.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[#b3b5b7]/40 rounded-3xl">
                <Clock className="w-8 h-8 text-[#b3b5b7] mx-auto mb-1" />
                <p className="text-xs font-bold text-[#131517]">Sin seguimientos pendientes</p>
                <p className="text-[11px] text-[#737577] mt-0.5">Los nuevos contactos registrados aparecerán aquí.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.pendingFollowUps.map((item) => {
                  const waMessage = `Hola ${item.customerName}, le escribo de ${orgName} sobre el ${item.vehicleName}. ¿Cómo podemos asistirle hoy?`;
                  const waUrl = buildWhatsAppLink(item.whatsapp, waMessage);

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 bg-[#f4f5f6] border border-[#b3b5b7]/20 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[#131517] truncate">{item.customerName}</p>
                          <span className="text-[9px] font-bold bg-white text-[#737577] px-1.5 py-0.5 rounded-full border border-[#b3b5b7]/30">
                            {item.stage}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#cc62d5] font-semibold mt-0.5 truncate">{item.vehicleName}</p>
                        {item.notes && (
                          <p className="text-[11px] text-[#737577] truncate mt-0.5">{item.notes}</p>
                        )}
                      </div>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#131517] hover:bg-[#333537] text-white text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3 h-3 text-[#25D366]" />
                        WhatsApp
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#f4f5f6] flex justify-end">
            <Link
              href="/leads"
              className="text-xs font-semibold text-[#cc62d5] hover:underline inline-flex items-center gap-1"
            >
              Ver pipeline de leads <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] p-5 sm:p-7 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#131517]">Actividad Reciente</h2>
                <p className="text-xs text-[#737577]">Bitácora de movimientos del negocio</p>
              </div>
              <Activity className="w-4 h-4 text-[#737577]" />
            </div>

            {data.recentActivity.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[#b3b5b7]/40 rounded-3xl">
                <p className="text-xs font-bold text-[#131517]">Sin actividad reciente registrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentActivity.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#cc62d5] mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[#131517] font-semibold">{log.details}</p>
                      <p className="text-[10px] text-[#737577] mt-0.5">
                        {new Date(log.createdAt).toLocaleTimeString("es-DO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • {new Date(log.createdAt).toLocaleDateString("es-DO", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#f4f5f6] flex justify-end">
            <Link
              href="/audit"
              className="text-xs font-semibold text-[#cc62d5] hover:underline inline-flex items-center gap-1"
            >
              Ver bitácora completa <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
