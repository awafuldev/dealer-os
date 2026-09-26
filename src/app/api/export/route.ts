import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, assertRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const { user, org } = await requireSession();
    // El export incluye precios de compra y datos de clientes: mismo criterio
    // de acceso que la sección de finanzas, no solo el frontend.
    assertRole(user, ["ADMIN", "FINANCE", "SUPERVISOR"]);

    let csvContent = "";
    let filename = `export-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (type === "vehicles") {
      const vehicles = await prisma.vehicle.findMany({
        where: { organizationId: org.id },
        include: { expenses: true },
      });

      const headers = ["ID", "Marca", "Modelo", "Año", "VIN", "Placa", "Precio Compra", "Precio Venta", "Estado", "Kilometraje"];
      const rows = vehicles.map((v) => [
        v.id,
        `"${v.brand}"`,
        `"${v.model}"`,
        v.year,
        `"${v.vin || ""}"`,
        `"${v.plate || ""}"`,
        v.purchasePrice,
        v.salePrice,
        v.status,
        v.mileage,
      ]);

      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else if (type === "customers") {
      const customers = await prisma.customer.findMany({
        where: { organizationId: org.id },
      });

      const headers = ["ID", "Nombre", "WhatsApp", "Email", "Cédula o RNC", "Presupuesto", "Notas"];
      const rows = customers.map((c) => [
        c.id,
        `"${c.name}"`,
        `"${c.whatsapp}"`,
        `"${c.email || ""}"`,
        `"${c.cedulaOrRnc || ""}"`,
        c.budget || 0,
        `"${(c.notes || "").replace(/"/g, '""')}"`,
      ]);

      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else if (type === "sales") {
      const sales = await prisma.sale.findMany({
        where: { organizationId: org.id },
        include: { vehicle: true, customer: true },
      });

      const headers = ["ID", "Vehículo", "Cliente", "Precio Final", "Inicial", "Financiamiento", "Saldo", "Estado", "Fecha"];
      const rows = sales.map((s) => [
        s.id,
        `"${s.vehicle.brand} ${s.vehicle.model} ${s.vehicle.year}"`,
        `"${s.customer.name}"`,
        s.finalPrice,
        s.downPayment,
        s.financedAmount,
        s.balance,
        s.status,
        new Date(s.saleDate).toISOString().slice(0, 10),
      ]);

      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else {
      return NextResponse.json({ error: "Tipo de exportación inválido" }, { status: 400 });
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
