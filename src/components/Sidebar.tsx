"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Clock,
  Users,
  BadgeDollarSign,
  DollarSign,
  FileText,
  ShieldCheck,
  Settings,
  Sparkles,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useUser } from "./UserContext";
import { logoutAction } from "@/actions/authActions";
import { GlobalSearch } from "./GlobalSearch";

const navigation = [
  { name: "Inicio", href: "/admin", icon: LayoutDashboard, section: "main" },
  
  // OPERACIÓN
  { name: "Inventario", href: "/inventory", icon: Car, section: "operacion" },
  { name: "Leads", href: "/leads", icon: Clock, section: "operacion" },
  { name: "Clientes", href: "/customers", icon: Users, section: "operacion" },
  { name: "Ventas", href: "/sales", icon: BadgeDollarSign, section: "operacion" },
  
  // GESTIÓN
  { name: "Finanzas", href: "/finance", icon: DollarSign, section: "gestion" },
  { name: "Documentos", href: "/contracts", icon: FileText, section: "gestion" },
  { name: "Auditoría", href: "/audit", icon: ShieldCheck, section: "gestion" },
  
  // SISTEMA
  { name: "Configuración", href: "/settings", icon: Settings, section: "sistema" },
  { name: "Ver Showroom", href: "/", icon: Sparkles, section: "sistema", external: true },
];

export function Sidebar({ orgName }: { orgName: string }) {
  const pathname = usePathname();
  const { userName, userEmail } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLinkActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/" || href === "/showroom") return false;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Top Mobile App Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#b3b5b7]/30 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#cc62d5] flex items-center justify-center font-black text-white text-sm shadow-sm shrink-0">
            D
          </div>
          <div className="min-w-0">
            <span className="font-bold text-sm tracking-tight text-[#131517] block leading-tight">
              Dealer OS
            </span>
            <span className="text-[11px] text-[#737577] block truncate leading-tight font-medium">
              {orgName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <GlobalSearch />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl text-[#131517] hover:bg-[#f4f5f6] transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#b3b5b7]/30 text-[#131517] min-h-screen fixed left-0 top-0 bottom-0 z-30 select-none">
        {/* Brand */}
        <div className="p-5 border-b border-[#f4f5f6] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-[#cc62d5] flex items-center justify-center font-black text-white text-base shadow-sm shrink-0">
              D
            </div>
            <div className="min-w-0">
              <div className="font-bold text-[#131517] tracking-tight text-sm flex items-center gap-1.5 leading-none">
                Dealer OS
              </div>
              <p className="text-[11px] text-[#737577] truncate font-medium mt-1">
                {orgName}
              </p>
            </div>
          </div>
        </div>

        {/* Global Search */}
        <div className="px-3 pt-3">
          <GlobalSearch />
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {/* Main: Inicio */}
          <div>
            {navigation
              .filter((i) => i.section === "main")
              .map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[19px] text-sm font-medium transition-all ${
                      active
                        ? "bg-[#cc62d5] text-white shadow-xs font-semibold"
                        : "text-[#737577] hover:text-[#131517] hover:bg-[#f4f5f6]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-white" : "text-[#737577]"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
          </div>

          {/* Operación */}
          <div>
            <p className="px-3.5 text-[10px] font-bold text-[#737577] uppercase tracking-wider mb-1">
              Operación
            </p>
            <div className="space-y-0.5">
              {navigation
                .filter((i) => i.section === "operacion")
                .map((item) => {
                  const active = isLinkActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[19px] text-sm font-medium transition-all ${
                        active
                          ? "bg-[#cc62d5] text-white shadow-xs font-semibold"
                          : "text-[#737577] hover:text-[#131517] hover:bg-[#f4f5f6]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-white" : "text-[#737577]"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* Gestión */}
          <div>
            <p className="px-3.5 text-[10px] font-bold text-[#737577] uppercase tracking-wider mb-1">
              Gestión
            </p>
            <div className="space-y-0.5">
              {navigation
                .filter((i) => i.section === "gestion")
                .map((item) => {
                  const active = isLinkActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[19px] text-sm font-medium transition-all ${
                        active
                          ? "bg-[#cc62d5] text-white shadow-xs font-semibold"
                          : "text-[#737577] hover:text-[#131517] hover:bg-[#f4f5f6]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-white" : "text-[#737577]"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* Sistema */}
          <div>
            <p className="px-3.5 text-[10px] font-bold text-[#737577] uppercase tracking-wider mb-1">
              Sistema
            </p>
            <div className="space-y-0.5">
              {navigation
                .filter((i) => i.section === "sistema")
                .map((item) => {
                  const active = isLinkActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[19px] text-sm font-medium transition-all ${
                        active
                          ? "bg-[#cc62d5] text-white shadow-xs font-semibold"
                          : "text-[#737577] hover:text-[#131517] hover:bg-[#f4f5f6]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-white" : "text-[#737577]"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
            </div>
          </div>
        </nav>

        {/* User Footer & Logout */}
        <div className="p-3.5 border-t border-[#f4f5f6] text-xs text-[#737577] flex items-center justify-between bg-white">
          <div className="truncate mr-2">
            <p className="text-[#131517] font-bold truncate text-sm">{userName}</p>
            <p className="text-[11px] text-[#737577] truncate">{userEmail}</p>
          </div>
          <button
            onClick={() => logoutAction()}
            title="Cerrar sesión"
            className="p-2 rounded-xl text-[#737577] hover:text-[#e83b47] hover:bg-[#e83b47]/10 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Tabs) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#b3b5b7]/30 z-40 flex items-center justify-around py-1.5 px-2 shadow-lg">
        <Link
          href="/admin"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            pathname === "/admin" ? "text-[#cc62d5] font-bold" : "text-[#737577]"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Inicio</span>
        </Link>
        <Link
          href="/inventory"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            pathname.startsWith("/inventory") ? "text-[#cc62d5] font-bold" : "text-[#737577]"
          }`}
        >
          <Car className="w-5 h-5" />
          <span className="text-[10px]">Inventario</span>
        </Link>
        <Link
          href="/leads"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            pathname.startsWith("/leads") ? "text-[#cc62d5] font-bold" : "text-[#737577]"
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">Leads</span>
        </Link>
        <Link
          href="/sales"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            pathname.startsWith("/sales") ? "text-[#cc62d5] font-bold" : "text-[#737577]"
          }`}
        >
          <BadgeDollarSign className="w-5 h-5" />
          <span className="text-[10px]">Ventas</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            mobileMenuOpen ? "text-[#cc62d5] font-bold" : "text-[#737577]"
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">Más</span>
        </button>
      </nav>

      {/* Mobile "Más" Modal / Bottom Sheet */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#131517]/40 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150">
          <div className="bg-white rounded-t-[32px] border-t border-[#b3b5b7]/30 p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#f4f5f6]">
              <div>
                <h3 className="font-bold text-base text-[#131517]">Menú del Sistema</h3>
                <p className="text-xs text-[#737577]">{orgName}</p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-[#f4f5f6] text-[#737577]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              {navigation.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                      active
                        ? "bg-[#cc62d5] text-white font-semibold"
                        : "text-[#131517] hover:bg-[#f4f5f6]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? "text-white" : "text-[#737577]"}`} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${active ? "text-white" : "text-[#737577]"}`} />
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#f4f5f6]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logoutAction();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-[19px] bg-[#e83b47]/10 text-[#e83b47] hover:bg-[#e83b47]/20 font-semibold text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
