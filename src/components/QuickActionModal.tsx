"use client";

import { useState } from "react";
import { Plus, X, Car, User, CheckCircle2, AlertCircle, ImagePlus, Star, Loader2 } from "lucide-react";
import { createVehicleAction } from "@/actions/vehicleActions";
import { createCustomerAction } from "@/actions/crmActions";

export function QuickActionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"vehicle" | "customer">("vehicle");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showAdvancedVehicle, setShowAdvancedVehicle] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (i: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[i]);
      return prev.filter((_, idx) => idx !== i);
    });
    setCoverIndex((prev) => {
      if (i === prev) return 0;
      return i < prev ? prev - 1 : prev;
    });
  };

  const resetVehicleForm = () => {
    previews.forEach((p) => URL.revokeObjectURL(p));
    setImages([]);
    setPreviews([]);
    setCoverIndex(0);
    setShowAdvancedVehicle(false);
  };

  const handleVehicleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    const formData = new FormData(e.currentTarget);
    images.forEach((file) => formData.append("images", file));
    formData.append("coverIndex", String(coverIndex));

    const res = await createVehicleAction(formData);

    setLoading(false);
    if (res.success) {
      setStatusMessage({ type: "success", text: "¡Vehículo guardado correctamente en inventario!" });
      setTimeout(() => {
        setIsOpen(false);
        setStatusMessage(null);
        resetVehicleForm();
      }, 1200);
    } else {
      setStatusMessage({ type: "error", text: res.error || "Error al registrar vehículo." });
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await createCustomerAction(formData);

    setLoading(false);
    if (res.success) {
      setStatusMessage({ type: "success", text: "¡Cliente guardado en el CRM exitosamente!" });
      setTimeout(() => {
        setIsOpen(false);
        setStatusMessage(null);
      }, 1200);
    } else {
      setStatusMessage({ type: "error", text: res.error || "Error al registrar cliente." });
    }
  };

  return (
    <>
      {/* Botón Flotante Global (+) */}
      <button
        onClick={() => {
          setIsOpen(true);
          setStatusMessage(null);
        }}
        className="fixed bottom-20 md:bottom-8 right-5 md:right-8 w-13 h-13 rounded-full bg-[#cc62d5] hover:bg-[#ba4bc4] text-white flex items-center justify-center shadow-lg shadow-[#cc62d5]/30 transition-all transform hover:scale-105 active:scale-95 z-40 focus:outline-none cursor-pointer"
        title="Acción Rápida (+)"
        aria-label="Acción Rápida"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Modal Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#131517]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f4f5f6]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#cc62d5]" />
                <h3 className="font-bold text-[#131517] text-base">Acción Rápida</h3>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  resetVehicleForm();
                }}
                className="text-[#737577] hover:text-[#131517] p-1.5 rounded-full hover:bg-[#f4f5f6] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Pestañas */}
            <div className="p-3 bg-[#f4f5f6] border-b border-[#b3b5b7]/20 flex gap-2">
              <button
                onClick={() => {
                  setActiveTab("vehicle");
                  setStatusMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "vehicle"
                    ? "bg-white text-[#cc62d5] shadow-xs"
                    : "text-[#737577] hover:text-[#131517]"
                }`}
              >
                <Car className="w-4 h-4" />
                + Vehículo
              </button>
              <button
                onClick={() => {
                  setActiveTab("customer");
                  setStatusMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "customer"
                    ? "bg-white text-[#cc62d5] shadow-xs"
                    : "text-[#737577] hover:text-[#131517]"
                }`}
              >
                <User className="w-4 h-4" />
                + Cliente
              </button>
            </div>

            {/* Feedback Message */}
            {statusMessage && (
              <div
                className={`m-4 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  statusMessage.type === "success"
                    ? "bg-[#cc62d5]/10 border border-[#cc62d5]/30 text-[#cc62d5]"
                    : "bg-[#e83b47]/10 border border-[#e83b47]/30 text-[#e83b47]"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Formulario Vehículo */}
            {activeTab === "vehicle" && (
              <form onSubmit={handleVehicleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#131517] mb-1">Marca *</label>
                    <input
                      name="brand"
                      required
                      placeholder="Ej. Toyota"
                      className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-xs text-[#131517] focus:outline-none focus:border-[#cc62d5] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#131517] mb-1">Modelo *</label>
                    <input
                      name="model"
                      required
                      placeholder="Ej. RAV4 XLE"
                      className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-xs text-[#131517] focus:outline-none focus:border-[#cc62d5] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#131517] mb-1">Año *</label>
                    <input
                      name="year"
                      type="number"
                      defaultValue={2022}
                      required
                      className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-xs text-[#131517] focus:outline-none focus:border-[#cc62d5] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#131517] mb-1">Kilometraje (km)</label>
                    <input
                      name="mileage"
                      type="number"
                      defaultValue={35000}
                      className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-xs text-[#131517] focus:outline-none focus:border-[#cc62d5] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#131517] mb-1">Precio de Venta (RD$) *</label>
                  <input
                    name="salePrice"
                    type="number"
                    required
                    placeholder="Ej. 1550000"
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#131517] focus:outline-none focus:border-[#cc62d5] focus:bg-white"
                  />
                </div>

                {/* Toggle Más Detalles */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedVehicle(!showAdvancedVehicle)}
                    className="text-xs text-[#cc62d5] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {showAdvancedVehicle ? "− Menos información" : "+ Más información (VIN, placa, costo)"}
                  </button>
                </div>

                {showAdvancedVehicle && (
                  <div className="space-y-3 pt-3 border-t border-[#f4f5f6] text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#737577] font-medium mb-1">Placa</label>
                        <input
                          name="plate"
                          placeholder="Ej. G549210"
                          className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2 text-[#131517]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#737577] font-medium mb-1">VIN / Chasis</label>
                        <input
                          name="vin"
                          placeholder="17 dígitos"
                          className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2 text-[#131517]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#737577] font-medium mb-1">Transmisión</label>
                        <select
                          name="transmission"
                          className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3 py-2 text-[#131517]"
                        >
                          <option value="Automática">Automática</option>
                          <option value="Manual">Manual</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[#737577] font-medium mb-1">Combustible</label>
                        <select
                          name="fuel"
                          className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3 py-2 text-[#131517]"
                        >
                          <option value="Gasolina">Gasolina</option>
                          <option value="Diésel">Diésel</option>
                          <option value="Híbrido">Híbrido</option>
                          <option value="Gas GLP">Gas GLP</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#737577] font-medium mb-1">Precio de Compra Inicial (RD$)</label>
                      <input
                        name="purchasePrice"
                        type="number"
                        placeholder="Costo pagado por el vehículo"
                        className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2 text-[#131517] font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Galería de imágenes múltiples */}
                <div className="pt-3 border-t border-[#f4f5f6] space-y-2.5">
                  <label className="block text-xs font-semibold text-[#131517] flex items-center gap-1.5">
                    <ImagePlus className="w-3.5 h-3.5 text-[#cc62d5]" />
                    Fotos del vehículo ({images.length})
                  </label>

                  {previews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {previews.map((url, i) => (
                        <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-[#b3b5b7]/30 bg-[#f4f5f6]">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          {i === coverIndex && (
                            <span className="absolute top-1 left-1 bg-[#cc62d5] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5" />
                            </span>
                          )}
                          <div className="absolute inset-0 bg-[#131517]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            {i !== coverIndex && (
                              <button
                                type="button"
                                onClick={() => setCoverIndex(i)}
                                title="Definir como portada"
                                className="p-1 rounded-lg bg-white/20 hover:bg-[#cc62d5] text-white cursor-pointer"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              title="Eliminar"
                              className="p-1 rounded-lg bg-white/20 hover:bg-[#e83b47] text-white cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="flex items-center justify-center gap-2 border border-dashed border-[#b3b5b7] rounded-2xl py-3 cursor-pointer hover:border-[#cc62d5] hover:bg-[#cc62d5]/5 transition-colors text-xs font-semibold text-[#737577] hover:text-[#cc62d5]">
                    <ImagePlus className="w-4 h-4 text-[#cc62d5]" />
                    Seleccionar fotos desde tu dispositivo
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        handleFilesSelected(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <p className="text-[11px] text-[#737577]">
                    Sube fotos del vehículo. La primera se asigna como portada.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-semibold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Guardando vehículo...</span>
                      </>
                    ) : (
                      "Guardar Vehículo"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Formulario Cliente */}
            {activeTab === "customer" && (
              <form onSubmit={handleCustomerSubmit} className="p-5 sm:p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#131517] mb-1">Nombre Completo *</label>
                  <input
                    name="name"
                    required
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-xs text-[#131517] focus:outline-none focus:border-[#cc62d5] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#131517] mb-1">WhatsApp (RD) *</label>
                    <input
                      name="whatsapp"
                      required
                      placeholder="8295551234"
                      className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-xs text-[#131517] focus:outline-none focus:border-[#cc62d5] focus:bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#131517] mb-1">Cédula o RNC</label>
                    <input
                      name="cedulaOrRnc"
                      placeholder="001-XXXXXXX-X"
                      className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-xs text-[#131517] focus:outline-none focus:border-[#cc62d5] focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#131517] mb-1">Presupuesto Estimado (RD$)</label>
                  <input
                    name="budget"
                    type="number"
                    placeholder="Ej. 1400000"
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#131517] focus:outline-none focus:border-[#cc62d5] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#131517] mb-1">Notas / Vehículo de Interés</label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Busca SUV año 2021-2022 con inicial de RD$350,000..."
                    className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-xs text-[#131517] focus:outline-none focus:border-[#cc62d5] focus:bg-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-semibold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Guardando cliente...</span>
                      </>
                    ) : (
                      "Guardar Cliente"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
