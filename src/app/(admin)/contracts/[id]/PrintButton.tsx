"use client";

import { Printer } from "lucide-react";

export function PrintContractButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
    >
      <Printer className="w-4 h-4" />
      Imprimir Contrato
    </button>
  );
}
