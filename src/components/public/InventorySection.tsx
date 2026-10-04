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
      {/* Barra de búsqueda / filtros, justo debajo del hero */}
      <div className="border-b border-white/10 bg-[#0D1520]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t("inventory.search_placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#111A26] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5B301]"
              />
            </div>
            <select
              value={brand}
              onChange={(e) => { setBrand(e.target.value); setModel(""); }}
              className="bg-[#111A26] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5B301]"
            >
              <option value="">{t("inventory.filter_brand")}</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-[#111A26] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5B301]"
            >
              <option value="">{t("inventory.filter_model")}</option>
              {models.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-[#111A26] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5B301]"
            >
              <option value="">{t("inventory.filter_year")}</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select
              value={priceTier}
              onChange={(e) => setPriceTier(e.target.value)}
              className="bg-[#111A26] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5B301]"
            >
              {priceTiers.map((ti) => <option key={ti.value} value={ti.value}>{ti.label}</option>)}
            </select>
            <select
              value={bodyType}
              onChange={(e) => setBodyType(e.target.value)}
              className="bg-[#111A26] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5B301]"
            >
              <option value="">{t("inventory.filter_body")}</option>
              {bodyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className="bg-[#111A26] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5B301]"
            >
              <option value="">{t("inventory.filter_transmission")}</option>
              {transmissions.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-white/10 text-zinc-300 hover:text-white hover:border-white/25 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {t("inventory.clear_filters")}
            </button>
          </div>
        </div>
      </div>

      <section id="inventario" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#F5B301] uppercase mb-2">
              <span className="w-5 h-[2px] bg-[#F5B301]" />
              {t("inventory.badge")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{t("inventory.title")}</h2>
          </div>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F5B301] hover:text-[#FFC933] transition-colors shrink-0"
            >
              {t("inventory.view_all")}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-sm text-zinc-500 shrink-0">{t("inventory.count", { count: vehicles.length })}</span>
          )}
        </div>

        {vehicles.length === 0 ? (
          <EmptyInventoryState whatsapp={whatsapp} orgName={orgName} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
            <p className="text-base font-semibold text-white">{t("inventory.no_results")}</p>
            <p className="text-sm text-zinc-500 mt-1 mb-4">{t("inventory.no_results_desc")}</p>
            <button onClick={clearFilters} className="text-sm font-semibold text-[#F5B301] hover:text-[#FFC933] transition-colors">
              {t("inventory.clear_filters")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
    <div className="group bg-[#111A26] border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-lg shadow-black/30 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1">
      <Link href={`/showroom/vehiculos/${v.slug}`} className="relative aspect-[4/3] bg-black/40 overflow-hidden block">
        <img
          src={v.coverImage}
          alt={`${v.brand} ${v.model} ${v.year}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span
          className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${
            v.status === "RESERVADO" ? "bg-amber-500 text-black" : "bg-emerald-500 text-black"
          }`}
        >
          {v.status === "RESERVADO" ? t("inventory.status_reserved") : t("inventory.status_available")}
        </span>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link href={`/showroom/vehiculos/${v.slug}`} className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-zinc-500">{v.brand}</p>
            <h3 className="text-base font-bold text-white tracking-tight leading-snug truncate">{v.model}</h3>
          </div>
          <span className="text-xs text-zinc-500 shrink-0 mt-0.5">{v.year}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400 mt-2.5">
          <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {v.mileage.toLocaleString("es-DO")} km</span>
          <span className="flex items-center gap-1"><Settings2 className="w-3 h-3" /> {v.transmission}</span>
          {v.fuel && <span className="flex items-center gap-1"><Fuel className="w-3 h-3" /> {v.fuel}</span>}
        </div>

        <p className="text-xl font-bold text-[#F5B301] mt-3">{formatPrice(v.price)}</p>

        <div className="mt-4 flex gap-2 pt-3 border-t border-white/10 mt-auto">
          <Link
            href={`/showroom/vehiculos/${v.slug}`}
            className="flex-1 inline-flex items-center justify-center py-2 rounded-lg border border-white/15 hover:border-white/30 text-white text-xs font-semibold transition-colors"
          >
            {t("inventory.view_vehicle")}
          </Link>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#F5B301]/50 hover:border-[#F5B301] text-[#F5B301] text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
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
