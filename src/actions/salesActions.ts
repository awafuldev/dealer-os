"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function createReservationAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const customerId = formData.get("customerId") as string;
    const vehicleId = formData.get("vehicleId") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const paymentMethod = (formData.get("paymentMethod") as string) || "Transferencia";
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!customerId || !vehicleId || isNaN(amount) || amount <= 0) {
      return { success: false, error: "Datos de reserva incompletos." };
    }

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, organizationId: org.id },
    });

    if (!vehicle) {
      return { success: false, error: "Vehículo no existe." };
    }

    if (vehicle.status === "RESERVADO") {
      return { success: false, error: "Este vehículo ya está RESERVADO." };
    }

    if (vehicle.status === "VENDIDO") {
      return { success: false, error: "Este vehículo ya fue VENDIDO." };
    }

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, organizationId: org.id },
    });

    if (!customer) {
      return { success: false, error: "Cliente no encontrado." };
    }

    // Transacción atómica
    await prisma.$transaction(async (tx) => {
      await tx.reservation.create({
        data: {
          organizationId: org.id,
          customerId,
          vehicleId,
          amount,
          paymentMethod,
          status: "CONFIRMADA",
          notes,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 72), // 3 días
          createdBy: user.name,
        },
      });

      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: "RESERVADO" },
      });

      // Actualizar leads activos de este cliente para este vehículo a RESERVADO
      await tx.lead.updateMany({
        where: { customerId, vehicleId, stage: { notIn: ["VENDIDO", "PERDIDO"] } },
        data: { stage: "RESERVADO" },
      });

      await tx.auditLog.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          action: "CREAR_RESERVA",
          entity: "Reservation",
          entityId: vehicleId,
          details: `Reserva de RD$${amount.toLocaleString()} formalizada por ${customer.name} para ${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
        },
      });
    });

    revalidatePath("/inventory");
    revalidatePath(`/inventory/${vehicleId}`);
    revalidatePath("/sales");
    revalidatePath("/leads");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al registrar reserva." };
  }
}

export async function createSaleAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const customerId = formData.get("customerId") as string;
    const vehicleId = formData.get("vehicleId") as string;
    const finalPrice = parseFloat(formData.get("finalPrice") as string);
    const downPayment = parseFloat((formData.get("downPayment") as string) || "0");
    const financedAmount = parseFloat((formData.get("financedAmount") as string) || "0");
    const paymentMethod = (formData.get("paymentMethod") as string) || "Transferencia";
    const receipt = (formData.get("receipt") as string)?.trim() || `REC-${Date.now().toString().slice(-6)}`;
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!customerId || !vehicleId || isNaN(finalPrice) || finalPrice <= 0) {
      return { success: false, error: "Selecciona cliente, vehículo y precio final válido." };
    }

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, organizationId: org.id },
    });

    if (!vehicle) {
      return { success: false, error: "Vehículo no encontrado." };
    }

    if (vehicle.status === "VENDIDO") {
      return { success: false, error: "Este vehículo ya está registrado como VENDIDO." };
    }

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, organizationId: org.id },
    });

    if (!customer) {
      return { success: false, error: "Cliente no encontrado." };
    }

    const initialPayment = Math.min(downPayment, finalPrice);
    const calculatedFinanced = financedAmount > 0 ? financedAmount : Math.max(0, finalPrice - initialPayment);
    const balance = Math.max(0, finalPrice - initialPayment);

    await prisma.$transaction(async (tx) => {
      // 1. Crear venta
      const sale = await tx.sale.create({
        data: {
          organizationId: org.id,
          customerId,
          vehicleId,
          sellerId: user.id,
          finalPrice,
          downPayment: initialPayment,
          financedAmount: calculatedFinanced,
          balance,
          status: "COMPLETADA",
          saleDate: new Date(),
          notes,
        },
      });

      // 2. Si hubo pago inicial, registrar el primer pago
      if (initialPayment > 0) {
        await tx.salePayment.create({
          data: {
            saleId: sale.id,
            amount: initialPayment,
            method: paymentMethod,
            status: "PAGADO",
            receipt,
            notes: "Pago inicial recibido al momento de la venta.",
            createdBy: user.name,
          },
        });
      }

      // 3. Actualizar estado del vehículo a VENDIDO y despublicarlo del showroom
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: "VENDIDO", isPublished: false },
      });

      // 4. Si había reserva activa, marcarla como convertida a venta
      await tx.reservation.updateMany({
        where: { vehicleId, status: "CONFIRMADA" },
        data: { status: "CONVERTIDA_A_VENTA" },
      });

      // 5. Convertir leads asociados de este cliente y vehículo a VENDIDO
      await tx.lead.updateMany({
        where: {
          customerId,
          OR: [{ vehicleId }, { vehicleId: null }],
          stage: { notIn: ["VENDIDO", "PERDIDO"] },
        },
        data: { stage: "VENDIDO" },
      });

      // 6. Auditoría
      await tx.auditLog.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          action: "CREAR_VENTA",
          entity: "Sale",
          entityId: sale.id,
          details: `Venta cerrada: ${vehicle.brand} ${vehicle.model} ${vehicle.year} a ${customer.name} por RD$${finalPrice.toLocaleString()} (Inicial: RD$${initialPayment.toLocaleString()})`,
        },
      });
    });

    revalidatePath("/sales");
    revalidatePath("/inventory");
    revalidatePath(`/inventory/${vehicleId}`);
    revalidatePath("/customers");
    revalidatePath("/leads");
    revalidatePath("/finance");
    revalidatePath("/contracts");
    revalidatePath("/showroom");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al registrar la venta." };
  }
}

export async function addPaymentAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const saleId = formData.get("saleId") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const method = (formData.get("method") as string) || "Transferencia";
    const receipt = (formData.get("receipt") as string)?.trim() || `REC-${Date.now().toString().slice(-6)}`;
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!saleId || isNaN(amount) || amount <= 0) {
      return { success: false, error: "Monto de cobro/abono inválido." };
    }

    const sale = await prisma.sale.findFirst({
      where: { id: saleId, organizationId: org.id },
      include: { vehicle: true, customer: true },
    });

    if (!sale) {
      return { success: false, error: "Venta no encontrada." };
    }

    if (amount > sale.balance) {
      return {
        success: false,
        error: `El monto (RD$${amount.toLocaleString()}) supera el saldo pendiente (RD$${sale.balance.toLocaleString()}).`,
      };
    }

    const newBalance = Math.max(0, sale.balance - amount);

    await prisma.$transaction(async (tx) => {
      await tx.salePayment.create({
        data: {
          saleId,
          amount,
          method,
          status: "PAGADO",
          receipt,
          notes,
          createdBy: user.name,
        },
      });

      await tx.sale.update({
        where: { id: saleId },
        data: { balance: newBalance },
      });

      await tx.auditLog.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          action: "REGISTRAR_PAGO",
          entity: "SalePayment",
          entityId: saleId,
          details: `Abono de RD$${amount.toLocaleString()} recibido de ${sale.customer.name} para ${sale.vehicle.brand} ${sale.vehicle.model}. Saldo restante: RD$${newBalance.toLocaleString()}`,
        },
      });
    });

    revalidatePath("/sales");
    revalidatePath("/finance");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al registrar el pago." };
  }
}
