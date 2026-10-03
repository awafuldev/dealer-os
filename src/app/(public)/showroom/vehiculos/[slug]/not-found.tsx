import Link from "next/link";
import { CarFront, ArrowLeft } from "lucide-react";

export default function VehicleNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-28 text-center">
      <CarFront className="w-12 h-12 text-zinc-600 mx-auto mb-5" />
      <h1 className="text-2xl font-bold text-white">Este vehículo ya no está disponible</h1>
      <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto">
        Puede que ya se haya vendido o que el enlace esté desactualizado. Revisa nuestro inventario actual de vehículos disponibles.
      </p>
      <Link
        href="/showroom#inventario"
        className="inline-flex items-center gap-2 mt-7 px-5 py-3 rounded-full bg-[#F5B301] hover:bg-[#FFC933] text-black font-semibold text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Ver inventario disponible
      </Link>
    </div>
  );
}
