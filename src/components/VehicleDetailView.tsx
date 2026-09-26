"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  DollarSign,
  Plus,
  Wrench,
  UserCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Globe,
  ExternalLink,
  ImagePlus,
  Star,
  Trash2,
  Eye,
  EyeOff,
  Edit3,
  X,
  Car,
  AlertTriangle,
  FileText,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { formatCurrencyRD } from "@/lib/financials";
import {
  updateVehicleAction,
  deleteVehicleAction,
  addExpenseAction,
  deleteVehicleExpenseAction,
  updateVehiclePriceAction,
  toggleVehiclePublishAction,
  updateVehicleWebInfoAction,
  addVehicleImageAction,
  removeVehicleImageAction,
  setCoverImageAction,
} from "@/actions/vehicleActions";
import { createReservationAction } from "@/actions/salesActions";

interface VehicleDetailProps {
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    vin: string | null;
    plate: string | null;
    color: string | null;
    transmission: string;
    fuel: string;
    drivetrain: string | null;
    mileage: number;
    purchasePrice: number;
    salePrice: number;
    status: string;
    notes: string | null;
    slug: string | null;
    bodyType: string | null;
    description: string | null;
    vinPublic: boolean;
    featuredOnHome: boolean;
    isPublished: boolean;
    images: Array<{ id: string; url: string; isCover: boolean }>;
    expenses: Array<{ id: string; category: string; description: string; amount: number; date: string }>;
    reservations: Array<{ id: string; customerName: string; amount: number; status: string; date: string }>;
    sale: { id: string; customerName: string; finalPrice: number; balance: number; saleDate: string } | null;
    totalExpenses: number;
    totalCost: number;
    grossMargin: number;
    roiPercentage: number;
  };
  customers: Array<{ id: string; name: string }>;
}

export function VehicleDetailView({ vehicle, customers }: VehicleDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "finances" | "photos" | "web">("overview");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(vehicle.isPublished);

  // Modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);

  const coverImage =
    vehicle.images.find((i) => i.isCover)?.url ||
    vehicle.images[0]?.url ||
    null;

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    form.append("vehicleId", vehicle.id);

    const res = await updateVehicleAction(form);
    setLoading(false);
    if (res.success) {
      setShowEditModal(false);
      setMessage({ type: "success", text: "Datos del vehículo actualizados correctamente." });
      router.refresh();
    } else {
      setMessage({ type: "error", text: res.error || "Error al actualizar vehículo." });
    }
  };

  const handleDeleteSubmit = async () => {
    setLoading(true);
    setMessage(null);
    const form = new FormData();
    form.append("vehicleId", vehicle.id);

    const res = await deleteVehicleAction(form);
    setLoading(false);
    if (res.success) {
      router.push("/inventory");
      router.refresh();
    } else {
      setMessage({ type: "error", text: res.error || "No se pudo eliminar el vehículo." });
      setShowDeleteModal(false);
    }
  };

  const handleTogglePublish = async () => {
    setPublishing(true);
    const res = await toggleVehiclePublishAction(vehicle.id);
    setPublishing(false);
    if (res.success) {
      setIsPublished(res.isPublished ?? !isPublished);
      setMessage({
        type: "success",
        text: res.isPublished ? "Vehículo publicado en el showroom web." : "Vehículo despublicado del showroom.",
      });
      router.refresh();
    } else {
      setMessage({ type: "error", text: res.error || "No se pudo cambiar el estado de publicación." });
    }
  };

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    form.append("vehicleId", vehicle.id);

    const res = await addExpenseAction(form);
    setLoading(false);
    if (res.success) {
      setShowExpenseModal(false);
      setMessage({ type: "success", text: "Gasto/Mantenimiento registrado correctamente." });
      router.refresh();
    } else {
      setMessage({ type: "error", text: res.error || "Error al registrar gasto." });
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("¿Eliminar este gasto del vehículo?")) return;
    const form = new FormData();
    form.append("expenseId", expenseId);
    form.append("vehicleId", vehicle.id);
    const res = await deleteVehicleExpenseAction(form);
    if (res.success) {
      setMessage({ type: "success", text: "Gasto eliminado." });
      router.refresh();
    } else {
      setMessage({ type: "error", text: res.error || "Error al eliminar gasto." });
    }
  };

  const handleUploadImages = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setLoading(true);
    const form = new FormData();
    form.append("vehicleId", vehicle.id);
    Array.from(fileList).forEach((f) => form.append("images", f));

    const res = await addVehicleImageAction(form);
    setLoading(false);
    if (res.success) {
      setMessage({ type: "success", text: "Fotos subidas correctamente." });
      router.refresh();
    } else {
      setMessage({ type: "error", text: res.error || "Error al subir fotos." });
    }
  };

  const handleSetCover = async (imageId: string) => {
    const form = new FormData();
    form.append("vehicleId", vehicle.id);
    form.append("imageId", imageId);
    const res = await setCoverImageAction(form);
    if (res.success) {
      setMessage({ type: "success", text: "Portada asignada." });
      router.refresh();
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("¿Eliminar esta foto del vehículo?")) return;
    const form = new FormData();
    form.append("vehicleId", vehicle.id);
    form.append("imageId", imageId);
    const res = await removeVehicleImageAction(form);
    if (res.success) {
      setMessage({ type: "success", text: "Foto eliminada." });
      router.refresh();
    }
  };

  const handleReservationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    form.append("vehicleId", vehicle.id);

    const res = await createReservationAction(form);
    setLoading(false);
    if (res.success) {
      setShowReservationModal(false);
      setMessage({ type: "success", text: "Reserva registrada y vehículo marcado como RESERVADO." });
      router.refresh();
    } else {
      setMessage({ type: "error", text: res.error || "Error al registrar reserva." });
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/inventory"
            className="p-2.5 rounded-full bg-white hover:bg-[#f4f5f6] border border-[#b3b5b7]/30 text-[#131517] transition-colors shadow-2xs cursor-pointer"
            title="Volver al inventario"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  vehicle.status === "DISPONIBLE"
                    ? "bg-[#cc62d5]/15 text-[#cc62d5]"
                    : vehicle.status === "RESERVADO"
                    ? "bg-[#ec660d]/15 text-[#ec660d]"
                    : "bg-[#131517] text-white"
                }`}
              >
                {vehicle.status}
              </span>
              {isPublished && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#131517]/5 text-[#131517] border border-[#b3b5b7]/30 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5 text-[#cc62d5]" /> Showroom
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#131517] tracking-tight mt-0.5">
              {vehicle.brand} {vehicle.model} {vehicle.year}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[19px] bg-white hover:bg-[#f4f5f6] border border-[#131517] text-[#131517] font-semibold text-xs sm:text-sm transition-all shadow-2xs cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            Editar Datos
          </button>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[19px] bg-white hover:bg-[#f4f5f6] border border-[#131517] text-[#131517] font-semibold text-xs sm:text-sm transition-all shadow-2xs cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            + Gasto / Taller
          </button>

          {vehicle.status === "DISPONIBLE" && (
            <button
              onClick={() => setShowReservationModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[19px] bg-[#ec660d] hover:bg-[#d65706] text-white font-semibold text-xs sm:text-sm transition-all shadow-2xs cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              Reservar
            </button>
          )}

          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[19px] bg-[#e83b47]/10 hover:bg-[#e83b47]/20 text-[#e83b47] font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            title="Eliminar vehículo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Alert Notification */}
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

      {/* Tabs Switcher */}
      <div className="flex gap-2 p-1.5 bg-white border border-[#b3b5b7]/30 rounded-[28px] max-w-md shadow-2xs">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-full transition-all cursor-pointer ${
            activeTab === "overview"
              ? "bg-[#cc62d5] text-white shadow-xs"
              : "text-[#737577] hover:text-[#131517]"
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab("finances")}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-full transition-all cursor-pointer ${
            activeTab === "finances"
              ? "bg-[#cc62d5] text-white shadow-xs"
              : "text-[#737577] hover:text-[#131517]"
          }`}
        >
          Finanzas & Gastos
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-full transition-all cursor-pointer ${
            activeTab === "photos"
              ? "bg-[#cc62d5] text-white shadow-xs"
              : "text-[#737577] hover:text-[#131517]"
          }`}
        >
          Fotos ({vehicle.images.length})
        </button>
        <button
          onClick={() => setActiveTab("web")}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-full transition-all cursor-pointer ${
            activeTab === "web"
              ? "bg-[#cc62d5] text-white shadow-xs"
              : "text-[#737577] hover:text-[#131517]"
          }`}
        >
          Web
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Photo Card & Quick Specs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-2xs">
              <div className="relative aspect-[16/9] bg-[#f4f5f6] flex items-center justify-center">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#737577] gap-2">
                    <Car className="w-12 h-12 stroke-[1.5]" />
                    <span className="text-xs font-semibold">Sin foto de portada</span>
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8">
                <h3 className="text-base font-bold text-[#131517] mb-4">Ficha Técnica</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-[#f4f5f6] p-3.5 rounded-2xl">
                    <span className="text-[#737577] block text-[11px]">Kilometraje</span>
                    <span className="font-bold text-[#131517] text-sm mt-0.5 block">
                      {vehicle.mileage.toLocaleString()} km
                    </span>
                  </div>
                  <div className="bg-[#f4f5f6] p-3.5 rounded-2xl">
                    <span className="text-[#737577] block text-[11px]">Transmisión</span>
                    <span className="font-bold text-[#131517] text-sm mt-0.5 block">
                      {vehicle.transmission}
                    </span>
                  </div>
                  <div className="bg-[#f4f5f6] p-3.5 rounded-2xl">
                    <span className="text-[#737577] block text-[11px]">Combustible</span>
                    <span className="font-bold text-[#131517] text-sm mt-0.5 block">
                      {vehicle.fuel}
                    </span>
                  </div>
                  <div className="bg-[#f4f5f6] p-3.5 rounded-2xl">
                    <span className="text-[#737577] block text-[11px]">Color Exterior</span>
                    <span className="font-bold text-[#131517] text-sm mt-0.5 block">
                      {vehicle.color || "No especificado"}
                    </span>
                  </div>
                  <div className="bg-[#f4f5f6] p-3.5 rounded-2xl">
                    <span className="text-[#737577] block text-[11px]">Placa</span>
                    <span className="font-mono font-bold text-[#131517] text-sm mt-0.5 block">
                      {vehicle.plate || "Sin placa"}
                    </span>
                  </div>
                  <div className="bg-[#f4f5f6] p-3.5 rounded-2xl">
                    <span className="text-[#737577] block text-[11px]">VIN / Chasis</span>
                    <span className="font-mono font-bold text-[#131517] text-xs mt-0.5 block truncate">
                      {vehicle.vin || "No registrado"}
                    </span>
                  </div>
                </div>

                {vehicle.notes && (
                  <div className="mt-6 pt-4 border-t border-[#f4f5f6]">
                    <span className="text-xs font-bold text-[#737577] block mb-1">Notas Internas</span>
                    <p className="text-xs text-[#131517] bg-[#f4f5f6] p-3.5 rounded-2xl">
                      {vehicle.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Breakdown Sidebar Card */}
          <div className="space-y-6">
            <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] p-6 sm:p-7 shadow-2xs space-y-5">
              <div>
                <span className="text-xs font-bold text-[#737577]">Precio de Venta Sugerido</span>
                <p className="text-3xl font-black text-[#131517] mt-0.5 tracking-tight">
                  {formatCurrencyRD(vehicle.salePrice)}
                </p>
              </div>

              <div className="pt-4 border-t border-[#f4f5f6] space-y-2.5 text-xs">
                <div className="flex justify-between text-[#737577]">
                  <span>Precio de compra:</span>
                  <span className="font-mono font-bold text-[#131517]">
                    {formatCurrencyRD(vehicle.purchasePrice)}
                  </span>
                </div>
                <div className="flex justify-between text-[#737577]">
                  <span>Gastos / Mantenimiento:</span>
                  <span className="font-mono font-bold text-[#131517]">
                    {formatCurrencyRD(vehicle.totalExpenses)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-[#131517] pt-2 border-t border-[#b3b5b7]/20 text-sm">
                  <span>Inversión Total:</span>
                  <span className="font-mono">{formatCurrencyRD(vehicle.totalCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#cc62d5] pt-1 text-sm">
                  <span>Ganancia Estimada:</span>
                  <span className="font-mono">{formatCurrencyRD(vehicle.grossMargin)}</span>
                </div>
                <div className="flex justify-between text-[#737577] text-[11px] pt-1">
                  <span>Margen / ROI:</span>
                  <span className="font-bold text-[#131517]">{vehicle.roiPercentage}%</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#f4f5f6]">
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="w-full py-3 rounded-[19px] bg-[#f4f5f6] hover:bg-[#e9eaeb] text-[#131517] font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Gasto / Taller
                </button>
              </div>
            </div>

            {/* Estado de Venta / Reserva si aplica */}
            {vehicle.sale && (
              <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] p-6 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-[#cc62d5] uppercase tracking-wider">
                  Venta Cerrada
                </span>
                <p className="text-sm font-bold text-[#131517]">
                  Comprador: {vehicle.sale.customerName}
                </p>
                <p className="text-xs text-[#737577]">
                  Precio final: {formatCurrencyRD(vehicle.sale.finalPrice)}
                </p>
                <Link
                  href="/sales"
                  className="text-xs font-semibold text-[#cc62d5] hover:underline inline-block mt-2"
                >
                  Ver en ventas →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Finances & Expenses */}
      {activeTab === "finances" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-2xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#131517]">Gastos y Mantenimientos del Vehículo</h3>
                <p className="text-xs text-[#737577]">
                  Todos estos gastos se suman automáticamente al costo de inversión.
                </p>
              </div>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[19px] bg-[#cc62d5] text-white font-semibold text-xs transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Registrar Gasto
              </button>
            </div>

            {vehicle.expenses.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#b3b5b7]/40 rounded-3xl">
                <Wrench className="w-10 h-10 text-[#b3b5b7] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#131517]">Sin gastos registrados</p>
                <p className="text-xs text-[#737577] mt-1">
                  Este vehículo no tiene gastos adicionales de taller, pintura o preparación.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#f4f5f6] text-[#737577] font-bold">
                    <tr>
                      <th className="py-3 px-4">Concepto</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Monto</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f4f5f6]">
                    {vehicle.expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-[#f4f5f6]/50">
                        <td className="py-3 px-4 font-bold text-[#131517]">{exp.description}</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#f4f5f6] text-[#737577]">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#737577]">{exp.date}</td>
                        <td className="py-3 px-4 font-bold font-mono text-[#131517]">
                          {formatCurrencyRD(exp.amount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1.5 rounded-lg text-[#737577] hover:text-[#e83b47] hover:bg-[#e83b47]/10 transition-colors"
                            title="Eliminar gasto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Photos */}
      {activeTab === "photos" && (
        <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#131517]">Galería de Fotos</h3>
              <p className="text-xs text-[#737577]">
                Sube fotos en alta resolución. La foto marcada con estrella es la portada principal.
              </p>
            </div>
            <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-semibold text-xs transition-all shadow-2xs cursor-pointer">
              <ImagePlus className="w-4 h-4" />
              Subir Fotos
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUploadImages(e.target.files)}
              />
            </label>
          </div>

          {vehicle.images.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#b3b5b7]/40 rounded-3xl">
              <ImagePlus className="w-12 h-12 text-[#b3b5b7] mx-auto mb-3" />
              <p className="text-sm font-bold text-[#131517]">No hay fotos registradas</p>
              <p className="text-xs text-[#737577] mt-1">
                Sube fotos para publicarlo en el showroom y mostrárselo a tus clientes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {vehicle.images.map((img) => (
                <div
                  key={img.id}
                  className="relative group aspect-[4/3] rounded-2xl overflow-hidden border border-[#b3b5b7]/30 bg-[#f4f5f6]"
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {img.isCover && (
                    <span className="absolute top-2 left-2 bg-[#cc62d5] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-current" /> Portada
                    </span>
                  )}
                  <div className="absolute inset-0 bg-[#131517]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.isCover && (
                      <button
                        onClick={() => handleSetCover(img.id)}
                        className="p-2 rounded-xl bg-white/20 hover:bg-[#cc62d5] text-white text-xs font-semibold cursor-pointer"
                        title="Hacer Portada"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-2 rounded-xl bg-white/20 hover:bg-[#e83b47] text-white text-xs font-semibold cursor-pointer"
                      title="Eliminar Foto"
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

      {/* Tab: Web Showroom Settings */}
      {activeTab === "web" && (
        <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-[#f4f5f6]">
            <div>
              <h3 className="text-lg font-bold text-[#131517]">Publicación en Showroom Web</h3>
              <p className="text-xs text-[#737577]">
                Controla la visibilidad pública de este vehículo en el catálogo digital.
              </p>
            </div>
            <button
              onClick={handleTogglePublish}
              disabled={publishing}
              className={`px-5 py-2.5 rounded-[19px] font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                isPublished
                  ? "bg-[#131517] text-white hover:bg-[#333537]"
                  : "bg-[#cc62d5] text-white hover:bg-[#ba4bc4]"
              }`}
            >
              {publishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPublished ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Despublicar
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Publicar en la Web
                </>
              )}
            </button>
          </div>

          {isPublished && vehicle.slug && (
            <div className="p-4 bg-[#f4f5f6] rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#131517]">Enlace público:</span>
                <p className="text-xs text-[#737577] font-mono">/showroom/vehiculos/{vehicle.slug}</p>
              </div>
              <Link
                href={`/showroom/vehiculos/${vehicle.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#b3b5b7]/30 text-xs font-semibold text-[#131517] hover:bg-[#f4f5f6]"
              >
                <span>Ver en Showroom</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#cc62d5]" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Modal: Editar Vehículo */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-[#131517]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f4f5f6]">
              <h3 className="font-bold text-[#131517] text-base">Editar Datos del Vehículo</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-[#737577] hover:text-[#131517] p-1.5 rounded-full hover:bg-[#f4f5f6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Marca *</label>
                  <input
                    name="brand"
                    defaultValue={vehicle.brand}
                    required
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Modelo *</label>
                  <input
                    name="model"
                    defaultValue={vehicle.model}
                    required
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Año *</label>
                  <input
                    name="year"
                    type="number"
                    defaultValue={vehicle.year}
                    required
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Kilometraje (km) *</label>
                  <input
                    name="mileage"
                    type="number"
                    defaultValue={vehicle.mileage}
                    required
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Precio de Venta (RD$) *</label>
                  <input
                    name="salePrice"
                    type="number"
                    defaultValue={vehicle.salePrice}
                    required
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Precio de Compra (RD$) *</label>
                  <input
                    name="purchasePrice"
                    type="number"
                    defaultValue={vehicle.purchasePrice}
                    required
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Placa</label>
                  <input
                    name="plate"
                    defaultValue={vehicle.plate || ""}
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">VIN</label>
                  <input
                    name="vin"
                    defaultValue={vehicle.vin || ""}
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Estado</label>
                <select
                  name="status"
                  defaultValue={vehicle.status}
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-semibold"
                >
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="RESERVADO">Reservado</option>
                  <option value="VENDIDO">Vendido</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Notas</label>
                <textarea
                  name="notes"
                  defaultValue={vehicle.notes || ""}
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
                  {loading ? "Guardando cambios..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Gasto */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-[#131517]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f4f5f6]">
              <h3 className="font-bold text-[#131517] text-base">Registrar Gasto de Vehículo</h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-[#737577] hover:text-[#131517] p-1.5 rounded-full hover:bg-[#f4f5f6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#131517] mb-1">Concepto / Descripción *</label>
                <input
                  name="description"
                  required
                  placeholder="Ej. Cambio de aceite, pulido de pintura, gomas nuevas"
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Monto (RD$) *</label>
                  <input
                    name="amount"
                    type="number"
                    required
                    placeholder="Ej. 4500"
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#131517] mb-1">Categoría</label>
                  <select
                    name="category"
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3 py-2.5 text-[#131517]"
                  >
                    <option value="MECANICA">Mecánica / Taller</option>
                    <option value="PINTURA">Pintura / Detailing</option>
                    <option value="DOCUMENTACION">Documentación / Placas</option>
                    <option value="TRANSPORTE">Transporte / Grúa</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Fecha</label>
                <input
                  name="date"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-semibold text-xs shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Registrando gasto..." : "Registrar Gasto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reservar Vehículo */}
      {showReservationModal && (
        <div className="fixed inset-0 z-50 bg-[#131517]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f4f5f6]">
              <h3 className="font-bold text-[#131517] text-base">Reservar Vehículo</h3>
              <button
                onClick={() => setShowReservationModal(false)}
                className="text-[#737577] hover:text-[#131517] p-1.5 rounded-full hover:bg-[#f4f5f6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReservationSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#131517] mb-1">Cliente *</label>
                <select
                  name="customerId"
                  required
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-semibold"
                >
                  <option value="">Selecciona un cliente...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Monto de Separación (RD$) *</label>
                <input
                  name="amount"
                  type="number"
                  required
                  placeholder="Ej. 50000"
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517] font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#131517] mb-1">Vence en (días)</label>
                <input
                  name="daysValid"
                  type="number"
                  defaultValue={7}
                  className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-[#131517]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-[19px] bg-[#ec660d] hover:bg-[#d65706] text-white font-semibold text-xs shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Guardando reserva..." : "Confirmar Reserva"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmación de Eliminación Segura */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-[#131517]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#e83b47]">
              <div className="w-10 h-10 rounded-full bg-[#e83b47]/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#131517]">¿Eliminar este vehículo?</h3>
            </div>

            <p className="text-xs text-[#737577] leading-relaxed">
              Esta acción eliminará permanentemente la ficha del vehículo y sus fotos asociadas. Si el vehículo ya tiene una venta registrada, la eliminación será bloqueada para proteger la contabilidad.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f4f5f6]">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-[19px] bg-white border border-[#b3b5b7]/40 text-[#131517] font-semibold text-xs hover:bg-[#f4f5f6] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={loading}
                className="px-4 py-2.5 rounded-[19px] bg-[#e83b47] hover:bg-[#c92f3b] text-white font-semibold text-xs shadow-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? "Eliminando..." : "Eliminar Vehículo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
