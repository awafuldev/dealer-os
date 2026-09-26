import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { ShieldCheck, Download, Database, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditBackupPage() {
  const { user, org } = await requireSession();

  const [auditLogs, vehiclesCount, customersCount, salesCount, expensesCount] = await Promise.all([
    prisma.auditLog.findMany({
      where: { organizationId: org.id },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.vehicle.count({ where: { organizationId: org.id } }),
    prisma.customer.count({ where: { organizationId: org.id } }),
    prisma.sale.count({ where: { organizationId: org.id } }),
    prisma.generalExpense.count({ where: { organizationId: org.id } }),
  ]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#cc62d5] uppercase tracking-wider">
          Seguridad &amp; Exportación
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#131517] mt-0.5">
          Auditoría &amp; Respaldo
        </h1>
        <p className="text-xs sm:text-sm text-[#737577] mt-1">
          Historial inmutable de operaciones y centro de exportación para <strong>{org.name}</strong>.
        </p>
      </div>

      {/* Centro de Respaldo & Exportación CSV */}
      <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#cc62d5]/10 flex items-center justify-center text-[#cc62d5]">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#131517]">Descarga y Respaldo de Datos</h2>
              <p className="text-xs text-[#737577]">
                Exporta la información de tu dealer en formato CSV estándar compatible con Excel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#cc62d5]/10 text-[#cc62d5] border border-[#cc62d5]/25 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              Base de Datos Activa
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#f4f5f6] p-5 rounded-[24px] border border-[#b3b5b7]/20 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#737577] block">Inventario de Vehículos</span>
              <span className="text-2xl font-black text-[#131517] mt-1 block tracking-tight">
                {vehiclesCount} unidades
              </span>
            </div>
            <a
              href="/api/export?type=vehicles"
              className="text-[#cc62d5] hover:text-[#ba4bc4] inline-flex items-center gap-1.5 mt-4 text-xs font-bold transition-colors"
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </a>
          </div>

          <div className="bg-[#f4f5f6] p-5 rounded-[24px] border border-[#b3b5b7]/20 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#737577] block">Directorio de Clientes</span>
              <span className="text-2xl font-black text-[#131517] mt-1 block tracking-tight">
                {customersCount} clientes
              </span>
            </div>
            <a
              href="/api/export?type=customers"
              className="text-[#cc62d5] hover:text-[#ba4bc4] inline-flex items-center gap-1.5 mt-4 text-xs font-bold transition-colors"
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </a>
          </div>

          <div className="bg-[#f4f5f6] p-5 rounded-[24px] border border-[#b3b5b7]/20 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#737577] block">Operaciones de Venta</span>
              <span className="text-2xl font-black text-[#131517] mt-1 block tracking-tight">
                {salesCount} ventas
              </span>
            </div>
            <a
              href="/api/export?type=sales"
              className="text-[#cc62d5] hover:text-[#ba4bc4] inline-flex items-center gap-1.5 mt-4 text-xs font-bold transition-colors"
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </a>
          </div>
        </div>
      </div>

      {/* Bitácora de Auditoría */}
      <div className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-2xs">
        <div className="p-5 sm:p-6 border-b border-[#f4f5f6] flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#cc62d5]/10 flex items-center justify-center text-[#cc62d5]">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#131517]">Eventos y Cambios en el Sistema</h2>
          </div>
          <span className="text-xs font-bold text-[#737577]">Últimos {auditLogs.length} eventos</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="text-center py-16 text-[#737577] text-xs">
            Sin eventos de auditoría registrados todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#131517]">
              <thead className="bg-[#f4f5f6] border-b border-[#b3b5b7]/20 text-[#737577] font-bold">
                <tr>
                  <th className="py-3 px-5">Acción</th>
                  <th className="py-3 px-5">Detalles del Evento</th>
                  <th className="py-3 px-5">Usuario</th>
                  <th className="py-3 px-5 text-right">Fecha / Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f5f6]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#f4f5f6]/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-full font-mono font-bold text-[10px] bg-[#cc62d5]/15 text-[#cc62d5]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-[#131517] max-w-lg">
                      {log.details || "Sin detalles adicionales"}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-[#737577]">
                      {log.user ? log.user.name : "Cuenta Dealer"}
                    </td>
                    <td className="py-3.5 px-5 text-right text-[#737577] font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString("es-DO", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
