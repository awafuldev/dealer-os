"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Car, Fuel, Gauge, Globe, Eye, ArrowUpDown, ChevronRight } from "lucide-react";
import { formatCurrencyRD } from "@/lib/financials";

interface VehicleItem {
  id: string;
  brand: string;
  model: string;
  year: number;
  vin: string | null;
  plate: string | null;
  color: string | null;
  transmission: string;
  fuel: string;
  mileage: number;
  purchasePrice: number;
  salePrice: number;
  status: string;
  totalExpenses: number;
  totalCost: number;
  grossMargin: number;
  roiPercentage: number;
  coverImage: string | null;
  isPublished: boolean;
}

export function InventoryView({ vehicles }: { vehicles: VehicleItem[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [sortBy, setSortBy] = useState<"recent" | "price-desc" | "price-asc" | "year-desc">("recent");

  const filteredVehicles = vehicles
    .filter((v) => {
      const matchesSearch =
        v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.year.toString().includes(searchTerm) ||
        (v.plate && v.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.vin && v.vin.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "TODOS" || v.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "price-desc") return b.salePrice - a.salePrice;
      if (sortBy === "price-asc") return a.salePrice - b.salePrice;
      if (sortBy === "year-desc") return b.year - a.year;
      return 0;
    });

  const triggerQuickAdd = () => {
    const btn = document.querySelector('button[title="Acción Rápida (+)"]') as HTMLButtonElement;
    if (btn) btn.click();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#cc62d5] uppercase tracking-wider">
            Gestión de Stock
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#131517] mt-0.5">
            Inventario de Vehículos
          </h1>
          <p className="text-xs sm:text-sm text-[#737577] mt-1">
            {vehicles.length} {vehicles.length === 1 ? "unidad registrada" : "unidades registradas"} en patio.
          </p>
        </div>

        <button
          onClick={triggerQuickAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          + Agregar Vehículo
        </button>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white border border-[#b3b5b7]/30 rounded-[28px] sm:rounded-[36px] p-4 sm:p-5 flex flex-col sm:flex-row gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#737577] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por marca, modelo, año, placa o VIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/30 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#131517] placeholder-[#737577] focus:outline-none focus:border-[#cc62d5] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#f4f5f6] border border-[#b3b5b7]/30 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#131517] focus:outline-none focus:border-[#cc62d5] cursor-pointer"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="DISPONIBLE">Disponibles</option>
            <option value="RESERVADO">Reservados</option>
            <option value="VENDIDO">Vendidos</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#f4f5f6] border border-[#b3b5b7]/30 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#131517] focus:outline-none focus:border-[#cc62d5] cursor-pointer"
          >
            <option value="recent">Más recientes</option>
            <option value="price-desc">Mayor precio</option>
            <option value="price-asc">Menor precio</option>
            <option value="year-desc">Año más nuevo</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#b3b5b7]/40 rounded-[32px] sm:rounded-[40px] bg-white p-8">
          <Car className="w-12 h-12 text-[#b3b5b7] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#131517]">
            {vehicles.length === 0 ? "Aún no tienes vehículos en inventario" : "No se encontraron vehículos"}
          </h3>
          <p className="text-xs text-[#737577] mt-1 max-w-sm mx-auto">
            {vehicles.length === 0
              ? "Comienza agregando tu primer vehículo con sus datos y fotos reales."
              : "Prueba ajustando los filtros o el término de búsqueda."}
          </p>
          {vehicles.length === 0 && (
            <button
              onClick={triggerQuickAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 mt-4 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Agregar primer vehículo
            </button>
          )}
        </div>
      ) : (
        /* Tarjetas de Vehículos (Glow Style) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredVehicles.map((v) => (
            <div
              key={v.id}
              className="bg-white border border-[#b3b5b7]/30 hover:border-[#cc62d5]/60 transition-all rounded-[32px] overflow-hidden flex flex-col justify-between shadow-2xs group"
            >
              <div>
                {/* Imagen y Estado */}
                <div className="relative aspect-[16/10] bg-[#f4f5f6] flex items-center justify-center overflow-hidden">
                  {v.coverImage ? (
                    <img
                      src={v.coverImage}
                      alt={`${v.brand} ${v.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#737577] gap-1">
                      <Car className="w-10 h-10 stroke-[1.5]" />
                      <span className="text-[10px] font-bold uppercase">Sin imágenes</span>
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full shadow-sm ${
                        v.status === "DISPONIBLE"
                          ? "bg-white text-[#131517]"
                          : v.status === "RESERVADO"
                          ? "bg-[#ec660d] text-white"
                          : "bg-[#131517] text-white"
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>

                  {v.plate && (
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-[#131517] shadow-2xs">
                      Placa: {v.plate}
                    </div>
                  )}
                </div>

                {/* Info Principal */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#131517] tracking-tight group-hover:text-[#cc62d5] transition-colors">
                      {v.brand} {v.model} {v.year}
                    </h3>
                    <div className="flex items-center gap-2.5 text-xs text-[#737577] mt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-[#737577]" />
                        {v.mileage.toLocaleString("es-DO")} km
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Fuel className="w-3.5 h-3.5 text-[#737577]" />
                        {v.fuel}
                      </span>
                      <span>•</span>
                      <span>{v.transmission}</span>
                    </div>
                  </div>

                  {/* Precios y Rentabilidad */}
                  <div className="pt-3 border-t border-[#f4f5f6]">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[#737577]">Precio de Venta</span>
                      <span className="text-lg font-black text-[#131517]">
                        {formatCurrencyRD(v.salePrice)}
                      </span>
                    </div>

                    {/* Desglose de Inversión y Ganancia */}
                    <div className="mt-3 bg-[#f4f5f6] p-3 rounded-2xl space-y-1.5 text-xs">
                      <div className="flex justify-between text-[#737577]">
                        <span>Compra base:</span>
                        <span className="font-mono font-semibold text-[#131517]">{formatCurrencyRD(v.purchasePrice)}</span>
                      </div>
                      <div className="flex justify-between text-[#737577]">
                        <span>Gastos agregados:</span>
                        <span className="font-mono font-semibold text-[#131517]">{formatCurrencyRD(v.totalExpenses)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[#131517] pt-1.5 border-t border-[#b3b5b7]/20">
                        <span>Inversión total:</span>
                        <span className="font-mono">{formatCurrencyRD(v.totalCost)}</span>
                      </div>
                      <div className="flex justify-between text-[#cc62d5] font-bold pt-0.5">
                        <span>Ganancia estimada:</span>
                        <span className="font-mono">{formatCurrencyRD(v.grossMargin)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer / Acción */}
              <div className="p-4 bg-[#f4f5f6]/60 border-t border-[#f4f5f6] flex items-center justify-between text-xs">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                    v.isPublished ? "text-[#131517]" : "text-[#737577]"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-[#cc62d5]" />
                  {v.isPublished ? "En Showroom" : "No publicado"}
                </span>
                <Link
                  href={`/inventory/${v.id}`}
                  className="px-4 py-2 rounded-[19px] bg-white hover:bg-[#131517] text-[#131517] hover:text-white border border-[#131517] font-semibold transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Ver Detalle</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
