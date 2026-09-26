import { MessageCircle, FileCheck } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/financials";

interface RequirementsSectionProps {
  whatsapp: string | null;
  minDownPaymentPct: number | null;
}

export function RequirementsSection({ whatsapp, minDownPaymentPct }: RequirementsSectionProps) {
  const waLink = whatsapp
    ? buildWhatsAppLink(whatsapp, "Hola, tengo una duda sobre los requisitos para comprar un vehículo.")
    : null;

  const items = [
    {
      title: "Cédula o pasaporte vigente",
      text: "Del titular que va a quedar en la matrícula.",
    },
    {
      title: "Carta de trabajo o estados de cuenta",
      text: "Solo si vas a financiar. Sirve para sustentar ingresos.",
    },
    {
      title: minDownPaymentPct ? `Inicial desde el ${minDownPaymentPct}%` : "Inicial según tu perfil",
      text: "Varía según la unidad y tu evaluación crediticia.",
    },
    {
      title: "Matrícula de tu vehículo actual",
      text: "Si lo vas a entregar como parte de pago, lo evaluamos antes de definir el precio final.",
    },
  ];

  return (
    <section id="requisitos" className="border-t border-white/10 bg-[#0A101A] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#F5B301] uppercase mb-2">Lo que necesitas</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-lg">
              Nada de sorpresas al momento de firmar.
            </h2>
          </div>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/25 hover:border-white/50 text-white font-semibold text-sm transition-colors shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              Preguntar por mi caso
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.title} className="flex gap-3.5">
              <FileCheck className="w-5 h-5 text-[#F5B301] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
