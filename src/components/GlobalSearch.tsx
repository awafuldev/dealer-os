"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Car, User, BadgeDollarSign, X, ArrowRight } from "lucide-react";
import { searchGlobalAction } from "@/actions/searchActions";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    vehicles: Array<{ id: string; title: string; subtitle: string; status: string; href: string }>;
    customers: Array<{ id: string; title: string; subtitle: string; href: string }>;
    sales: Array<{ id: string; title: string; subtitle: string; href: string }>;
  }>({ vehicles: [], customers: [], sales: [] });

  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ vehicles: [], customers: [], sales: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await searchGlobalAction(query);
      setResults(res);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#f4f5f6] hover:bg-[#e9eaeb] border border-[#b3b5b7]/30 text-[#737577] hover:text-[#131517] text-xs font-medium transition-all w-full md:w-auto"
      >
        <Search className="w-3.5 h-3.5 text-[#737577]" />
        <span className="hidden sm:inline">Buscar vehículo, cliente o venta...</span>
        <span className="sm:hidden">Buscar...</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-white border border-[#b3b5b7]/40 text-[10px] text-[#737577] font-mono shadow-2xs ml-auto">
          ⌘K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#131517]/40 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[28px] sm:rounded-[36px] w-full max-w-xl overflow-hidden shadow-2xl">
            {/* Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f4f5f6] bg-white">
              <Search className="w-4 h-4 text-[#cc62d5] shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Buscar por marca, modelo, cliente, teléfono..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-[#131517] placeholder-[#737577] focus:outline-none"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#737577] hover:text-[#131517] p-1.5 rounded-full hover:bg-[#f4f5f6] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Resultados */}
            <div className="max-h-96 overflow-y-auto p-3 space-y-3 text-xs">
              {loading && (
                <div className="p-6 text-center text-[#737577]">Buscando en Dealer OS...</div>
              )}

              {!loading && query.trim().length >= 2 && results.vehicles.length === 0 && results.customers.length === 0 && results.sales.length === 0 && (
                <div className="p-8 text-center text-[#737577]">
                  No se encontraron resultados para &quot;{query}&quot;.
                </div>
              )}

              {/* Vehículos */}
              {results.vehicles.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-bold text-[#737577] uppercase tracking-wider flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-[#cc62d5]" /> Vehículos
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.vehicles.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => handleSelect(v.href)}
                        className="w-full text-left p-3 rounded-2xl hover:bg-[#f4f5f6] flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold text-[#131517] group-hover:text-[#cc62d5] transition-colors text-sm">
                            {v.title}
                          </p>
                          <p className="text-[11px] text-[#737577] mt-0.5">{v.subtitle}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f4f5f6] text-[#131517] border border-[#b3b5b7]/30">
                          {v.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clientes */}
              {results.customers.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-bold text-[#737577] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#131517]" /> Clientes
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.customers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelect(c.href)}
                        className="w-full text-left p-3 rounded-2xl hover:bg-[#f4f5f6] flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold text-[#131517] group-hover:text-[#cc62d5] transition-colors text-sm">
                            {c.title}
                          </p>
                          <p className="text-[11px] text-[#737577] mt-0.5">{c.subtitle}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#737577] group-hover:text-[#131517]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ventas */}
              {results.sales.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-bold text-[#737577] uppercase tracking-wider flex items-center gap-1.5">
                    <BadgeDollarSign className="w-3.5 h-3.5 text-[#ec660d]" /> Ventas
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.sales.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleSelect(s.href)}
                        className="w-full text-left p-3 rounded-2xl hover:bg-[#f4f5f6] flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold text-[#131517] group-hover:text-[#cc62d5] transition-colors text-sm">
                            {s.title}
                          </p>
                          <p className="text-[11px] text-[#737577] mt-0.5">{s.subtitle}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#737577] group-hover:text-[#131517]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-[#f4f5f6] border-t border-[#b3b5b7]/20 text-[11px] text-[#737577] flex items-center justify-between px-5">
              <span>Navega o selecciona con clic</span>
              <span>ESC para salir</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
