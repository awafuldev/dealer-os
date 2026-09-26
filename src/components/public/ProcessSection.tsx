import { Car, MessageCircle, Wrench, KeyRound } from "lucide-react";

const STEPS = [
  { n: "01", icon: Car, title: "Escoge tu vehículo", text: "Explora el inventario aquí mismo y escríbenos con la unidad que te gustó." },
  { n: "02", icon: MessageCircle, title: "Te confirmamos todo", text: "Verificamos disponibilidad y coordinamos el test drive cuando te convenga." },
  { n: "03", icon: Wrench, title: "Financiamiento y papeleo", text: "Te acompañamos con la evaluación de financiamiento y la documentación." },
  { n: "04", icon: KeyRound, title: "Te entregamos las llaves", text: "Coordinamos la entrega con la documentación completa a tu nombre." },
];

export function ProcessSection() {
  return (
    <section id="proceso" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-white/10 scroll-mt-24">
      <p className="text-xs font-semibold tracking-[0.2em] text-[#F5B301] uppercase mb-2">Así funciona</p>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-lg mb-3">
        En cuatro pasos ya estás manejando.
      </h2>
      <p className="text-zinc-400 max-w-xl mb-12">
        Sin vueltas ni trámites eternos. Así es como trabajamos desde que nos escribes.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {STEPS.map((s) => (
          <div key={s.n}>
            <div className="w-12 h-12 rounded-xl bg-[#F5B301]/15 flex items-center justify-center mb-4">
              <s.icon className="w-5 h-5 text-[#F5B301]" />
            </div>
            <span className="text-xs font-bold text-white/25">{s.n}</span>
            <h3 className="text-base font-bold text-white mt-1.5">{s.title}</h3>
            <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
