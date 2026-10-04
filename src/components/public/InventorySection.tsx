"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Gauge, Settings2, Fuel, MessageCircle, ArrowRight, SlidersHorizontal } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/financials";
import type { PublicVehicle } from "@/lib/publicVehicle";
import { useLanguage } from "@/components/LanguageContext";

export function InventorySection({
  vehicles,
  whatsapp,
  orgName,
}: {
  vehicles: PublicVehicle[];
  whatsapp: string | null;
  orgName: string;
}) {
  const { t, formatPrice, currency } = useLanguage();
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [priceTier, setPriceTier] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [transmission, setTransmission] = useState("");

  const priceTiers = useMemo(() => [
    { label: t("inventory.tier_all"), value: "" },
    { label: `${currency === "USD" ? "Up to" : "Hasta"} ${formatPrice(800000)}`, value: "800000" },
    { label: `${currency === "USD" ? "Up to" : "Hasta"} ${formatPrice(1500000)}`, value: "1500000" },
    { label: `${currency === "USD" ? "Up to" : "Hasta"} ${formatPrice(2500000)}`, value: "2500000" },
    { label: `${currency === "USD" ? "More than" : "Más de"} ${formatPrice(2500000)}`, value: "9999999999" },
  ], [t, formatPrice, currency]);

  const brands = useMemo(() => Array.from(new Set(vehicles.map((v) => v.brand))).sort(), [vehicles]);
  const models = useMemo(
    () =>
      Array.from(new Set(vehicles.filter((v) => !brand || v.brand === brand).map((v) => v.model))).sort(),
    [vehicles, brand]
  );
  const years = useMemo(() => Array.from(new Set(vehicles.map((v) => v.year))).sort((a, b) => b - a), [vehicles]);
  const bodyTypes = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.bodyType).filter(Boolean))).sort() as string[],
    [vehicles]
  );
  const transmissions = useMemo(() => Array.from(new Set(vehicles.map((v) => v.transmission))).sort(), [vehicles]);

  const filtered = vehicles.filter((v) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || `${v.brand} ${v.model} ${v.year}`.toLowerCase().includes(q);
    const matchesBrand = !brand || v.brand === brand;
    const matchesModel = !model || v.model === model;
    const matchesYear = !year || v.year === parseInt(year, 10);
    const matchesPrice = !priceTier || v.price <= parseInt(priceTier, 10);
    const matchesBodyType = !bodyType || v.bodyType === bodyType;
    const matchesTransmission = !transmission || v.transmission === transmission;
    return matchesSearch && matchesBrand && matchesModel && matchesYear && matchesPrice && matchesBodyType && matchesTransmission;
  });

  const hasActiveFilters = !!(search || brand || model || year || priceTier || bodyType || transmission);

  const clearFilters = () => {
    setSearch("");
    setBrand("");
    setModel("");
    setYear("");
    setPriceTier("");
    setBodyType("");
    setTransmission("");
  };

  return (
    <>
      {/* Barra de búsqueda / filtros, estilo MotorLand glass */}
      <div className="border-b border-[#F5C518]/15 bg-[#0B0E14]/85 backdrop-blur-xl sticky top-[72px] z-30 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-[#F5C518] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t("inventory.search_placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/15 focus:border-[#F5C518] focus:shadow-[0_0_20px_rgba(245,197,24,0.25)] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none transition-all"
              />
            </div>
            <select
              value={brand}
              onChange={(e) => { setBrand(e.target.value); setModel(""); }}
              className="bg-[#151A24] border border-white/15 focus:border-[#F5C518] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none cursor-pointer transition-all"
            >
              <option value="">{t("inventory.filter_brand")}</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-[#151A24] border border-white/15 focus:border-[#F5C518] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none cursor-pointer transition-all"
            >
              <option value="">{t("inventory.filter_model")}</option>
              {models.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-[#151A24] border border-white/15 focus:border-[#F5C518] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none cursor-pointer transition-all"
            >
              <option value="">{t("inventory.filter_year")}</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select
              value={priceTier}
              onChange={(e) => setPriceTier(e.target.value)}
              className="bg-[#151A24] border border-white/15 focus:border-[#F5C518] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none cursor-pointer transition-all"
            >
              {priceTiers.map((ti) => <option key={ti.value} value={ti.value}>{ti.label}</option>)}
            </select>
            <select
              value={bodyType}
              onChange={(e) => setBodyType(e.target.value)}
              className="bg-[#151A24] border border-white/15 focus:border-[#F5C518] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none cursor-pointer transition-all"
            >
              <option value="">{t("inventory.filter_body")}</option>
              {bodyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className="bg-[#151A24] border border-white/15 focus:border-[#F5C518] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none cursor-pointer transition-all"
            >
              <option value="">{t("inventory.filter_transmission")}</option>
              {transmissions.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 hover:border-[#F5C518] text-zinc-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#F5C518]" />
              {t("inventory.clear_filters")}
            </button>
          </div>
        </div>
      </div>

      <section id="inventario" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 scroll-mt-24 relative">
        {/* Glow de fondo de catálogo */}
        <div className="pointer-events-none absolute right-1/4 top-10 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(245,197,24,0.08),transparent_65%)] blur-3xl" />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="eyebrow-gold mb-2">
              <span>{t("inventory.badge")}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              {t("inventory.title")}
            </h2>
          </div>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#F5C518] hover:text-[#FFD22E] transition-colors shrink-0"
            >
              {t("inventory.view_all")}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-[#F5C518]/25 text-xs font-semibold text-zinc-300 font-display">
              <span className="w-2 h-2 rounded-full bg-[#F5C518]" />
              {t("inventory.count", { count: vehicles.length })}
            </div>
          )}
        </div>

        {vehicles.length === 0 ? (
          <EmptyInventoryState whatsapp={whatsapp} orgName={orgName} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/15 rounded-3xl bg-white/[0.02]">
            <p className="text-lg font-bold text-white font-display">{t("inventory.no_results")}</p>
            <p className="text-sm text-zinc-400 mt-1 mb-5">{t("inventory.no_results_desc")}</p>
            <button onClick={clearFilters} className="btn-gold text-xs py-2.5 px-6">
              {t("inventory.clear_filters")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((v) => (
              <VehicleCard key={v.id} vehicle={v} whatsapp={whatsapp} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function VehicleCard({ vehicle: v, whatsapp }: { vehicle: PublicVehicle; whatsapp: string | null }) {
  const { t, formatPrice } = useLanguage();
  const waLink = whatsapp
    ? buildWhatsAppLink(whatsapp, `Hola, estoy interesado en el ${v.brand} ${v.model} ${v.year}.`)
    : null;

  return (
    <div className="motorland-card flex flex-col group overflow-hidden">
      {/* Media con badge de precio flotante estilo MotorLand */}
      <Link href={`/showroom/vehiculos/${v.slug}`} className="relative aspect-[16/10] bg-[#151A24] overflow-hidden block">
        <img
          src={v.coverImage}
          alt={`${v.brand} ${v.model} ${v.year}`}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
        />
        {/* Degradado inferior sobre la foto */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent opacity-80" />

        {/* Floating Price Badge (Estilo MotorLand brillante) */}
        <div className="absolute left-3 bottom-3 z-10 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FFD22E] to-[#F5C518] text-[#14100A] font-display font-extrabold text-sm sm:text-base shadow-[0_6px_20px_rgba(0,0,0,0.65)] tracking-tight">
          {formatPrice(v.price)}
        </div>

        {/* Status Badge */}
        <span
          className={`absolute top-3 right-3 z-10 text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-md ${
            v.status === "RESERVADO"
              ? "bg-amber-500/90 text-black border border-amber-400"
              : "bg-black/60 border border-white/20 text-white"
          }`}
        >
          {v.status === "RESERVADO" ? t("inventory.status_reserved") : t("inventory.status_available")}
        </span>
      </Link>

      <div className="p-5 flex flex-col flex-1 gap-3.5">
        <Link href={`/showroom/vehiculos/${v.slug}`} className="block">
          <span className="text-[11px] font-bold tracking-[0.18em] text-[#F5C518] uppercase block mb-1 font-display">
            {v.brand}
          </span>
          <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-tight leading-snug truncate group-hover:text-[#FFD22E] transition-colors">
            {v.model} <span className="text-xs font-normal text-zinc-400 font-sans">· {v.year}</span>
          </h3>
        </Link>

        {/* Specs en chips refinados con micro-iconos dorados */}
        <div className="flex flex-wrap gap-1.5 text-xs text-zinc-300">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium">
            <Gauge className="w-3 h-3 text-[#F5C518]" /> {v.mileage.toLocaleString("es-DO")} km
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium">
            <Settings2 className="w-3 h-3 text-[#F5C518]" /> {v.transmission}
          </span>
          {v.fuel && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium">
              <Fuel className="w-3 h-3 text-[#F5C518]" /> {v.fuel}
            </span>
          )}
        </div>

        {/* Acciones de la tarjeta */}
        <div className="mt-auto pt-3.5 border-t border-white/[0.08] flex items-center gap-2">
          <Link
            href={`/showroom/vehiculos/${v.slug}`}
            className="flex-1 py-2.5 rounded-xl bg-white/[0.06] hover:bg-[#F5C518] hover:text-[#14100A] border border-white/[0.12] hover:border-transparent text-white font-bold text-xs text-center transition-all duration-300 font-display shadow-xs"
          >
            {t("inventory.view_vehicle")}
          </Link>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="px-3 py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/30 transition-all duration-300 flex items-center justify-center shrink-0"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyInventoryState({ whatsapp, orgName }: { whatsapp: string | null; orgName: string }) {
  const { t } = useLanguage();
  const waLink = whatsapp
    ? buildWhatsAppLink(whatsapp, `Hola, quisiera saber qué vehículos tiene disponibles ${orgName}.`)
    : null;

  return (
    <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
      <p className="text-lg font-semibold text-white">{t("inventory.empty_title")}</p>
      <p className="text-sm text-zinc-500 mt-1 mb-6 max-w-sm mx-auto">
        {t("inventory.empty_desc")}
      </p>
      {waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#F5B301] hover:bg-[#FFC933] text-black font-semibold text-sm transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {t("nav.whatsapp_write")}
        </a>
      )}
    </div>
  );
}
