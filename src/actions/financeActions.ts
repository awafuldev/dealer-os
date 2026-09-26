"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function createGeneralExpenseAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const category = (formData.get("category") as string)?.trim() || "Otros";
    const description = (formData.get("description") as string)?.trim();
    const amount = parseFloat(formData.get("amount") as string);
    const dateRaw = formData.get("date") as string;
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!description || isNaN(amount) || amount <= 0) {
      return { success: false, error: "Concepto y monto válido son obligatorios." };
    }

    const date = dateRaw ? new Date(dateRaw) : new Date();

    const expense = await prisma.generalExpense.create({
      data: {
        organizationId: org.id,
        category,
        description,
        amount,
        date,
        notes,
        createdBy: user.name,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "REGISTRAR_GASTO_GENERAL",
        entity: "GeneralExpense",
        entityId: expense.id,
        details: `Gasto operativo de RD$${amount.toLocaleString()} en ${category}: ${description}`,
      },
    });

    revalidatePath("/finance");
    revalidatePath("/");
    return { success: true, expenseId: expense.id };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al registrar gasto general." };
  }
}

export async function deleteGeneralExpenseAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const expenseId = formData.get("expenseId") as string;

    const expense = await prisma.generalExpense.findFirst({
      where: { id: expenseId, organizationId: org.id },
    });

    if (!expense) {
      return { success: false, error: "Gasto no encontrado." };
    }

    await prisma.generalExpense.delete({ where: { id: expenseId } });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "ELIMINAR_GASTO_GENERAL",
        entity: "GeneralExpense",
        entityId: expenseId,
        details: `Eliminó gasto operativo de RD$${expense.amount.toLocaleString()} (${expense.description})`,
      },
    });

    revalidatePath("/finance");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al eliminar gasto general." };
  }
}
