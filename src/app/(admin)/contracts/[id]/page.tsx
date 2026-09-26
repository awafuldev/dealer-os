import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { formatCurrencyRD } from "@/lib/financials";
import { PrintContractButton } from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function SingleContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, org } = await requireSession();

  const sale = await prisma.sale.findFirst({
    where: { id, organizationId: org.id },
    include: {
      vehicle: true,
      customer: true,
      seller: true,
    },
  });

  if (!sale) {
    notFound();
  }

  const todayFormatted = new Date(sale.saleDate).toLocaleDateString("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f4f5f6] py-10 px-4 flex flex-col items-center">
      {/* Botones de Acción */}
      <div className="max-w-3xl w-full mb-6 flex justify-between items-center print:hidden">
        <span className="text-xs font-bold text-[#737577]">Vista de Impresión Oficial</span>
        <PrintContractButton />
      </div>

      {/* Hoja de Contrato Legal RD (Fondo Blanco para Imprimir) */}
      <div className="bg-white text-zinc-900 w-full max-w-3xl p-10 md:p-14 rounded-xl shadow-2xl space-y-6 text-sm leading-relaxed font-serif">
        <div className="text-center border-b border-zinc-300 pb-4">
          <h2 className="text-lg font-bold uppercase tracking-wider">
            Acto de Venta de Vehículo de Motor Bajo Firma Privada
          </h2>
          <p className="text-xs text-zinc-600 mt-1">República Dominicana</p>
        </div>

        <p className="text-justify">
          ENTRE, de una parte: <strong>{org.name}</strong>, entidad comercial legalmente organizada y constituida bajo las leyes de la República Dominicana, portadora del Registro Nacional de Contribuyentes (RNC) No. <strong>{org.rnc || "[RNC no configurado — complétalo en Configuración]"}</strong>, con su domicilio social y comercial principal en {org.address || "[Dirección no configurada — complétala en Configuración]"}, en lo sucesivo denominada <strong>&quot;LA VENDEDORA&quot;</strong>;
        </p>

        <p className="text-justify">
          Y de la otra parte: el/la señor(a) <strong>{sale.customer.name}</strong>, dominicano(a), mayor de edad, portador(a) de la Cédula de Identidad y Electoral No. <strong>{sale.customer.cedulaOrRnc || "PENDIENTE"}</strong>, con domicilio en República Dominicana, en lo sucesivo denominado(a) <strong>&quot;EL/LA COMPRADOR(A)&quot;</strong>;
        </p>

        <div className="text-center font-bold uppercase py-1 text-xs tracking-wider border-y border-zinc-200">
          Han convenido y pactado lo siguiente:
        </div>

        <p className="text-justify">
          <strong>PRIMERO:</strong> &quot;LA VENDEDORA&quot; vende, cede y transfiere a &quot;EL/LA COMPRADOR(A)&quot;, quien acepta, el siguiente vehículo de motor con todas sus piezas y accesorios correspondientes:
        </p>

        <div className="bg-zinc-50 p-4 rounded border border-zinc-200 text-xs font-mono grid grid-cols-2 gap-2 my-2">
          <div><strong>MARCA:</strong> {sale.vehicle.brand}</div>
          <div><strong>MODELO:</strong> {sale.vehicle.model}</div>
          <div><strong>AÑO:</strong> {sale.vehicle.year}</div>
          <div><strong>COLOR:</strong> {sale.vehicle.color || "Según matrícula"}</div>
          <div><strong>CHASIS / VIN:</strong> {sale.vehicle.vin || "Según matrícula"}</div>
          <div><strong>PLACA:</strong> {sale.vehicle.plate || "En trámite"}</div>
        </div>

        <p className="text-justify">
          <strong>SEGUNDO: PRECIO Y FORMA DE PAGO:</strong> El precio total convenido y libremente pactado para la presente venta es de <strong>{formatCurrencyRD(sale.finalPrice)} PESOS DOMINICANOS</strong>, los cuales han sido satisfechos de la siguiente manera:
        </p>

        <ul className="list-disc pl-6 space-y-1 text-xs">
          <li>
            La suma de <strong>{formatCurrencyRD(sale.downPayment)}</strong> entregada a la firma del presente contrato en calidad de pago inicial.
          </li>
          <li>
            El balance restante por un monto de <strong>{formatCurrencyRD(sale.balance)}</strong> pendiente de liquidación mediante financiamiento institucional pactado.
          </li>
        </ul>

        <p className="text-justify">
          <strong>TERCERO:</strong> Las partes reconocen que el presente acto se realiza de buena fe y que el comprador ha inspeccionado el vehículo a su entera satisfacción mecánica y visual.
        </p>

        <p className="text-justify">
          Hecho y firmado en dos (2) originales de un mismo tenor y efecto, en la ciudad de Santo Domingo, Distrito Nacional, a los {todayFormatted}.
        </p>

        {/* Firmas */}
        <div className="pt-16 grid grid-cols-2 gap-12 text-center text-xs">
          <div className="border-t border-zinc-900 pt-2">
            <strong>POR LA VENDEDORA</strong>
            <p className="text-[11px] text-zinc-600">{org.name}</p>
          </div>
          <div className="border-t border-zinc-900 pt-2">
            <strong>EL/LA COMPRADOR(A)</strong>
            <p className="text-[11px] text-zinc-600">{sale.customer.name}</p>
            <p className="text-[10px] text-zinc-500 font-mono">Céd: {sale.customer.cedulaOrRnc || "____________________"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
