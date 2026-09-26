"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function updateLeadStageAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const leadId = formData.get("leadId") as string;
    const newStage = formData.get("stage") as any;

    if (!leadId || !newStage) {
      return { success: false, error: "Datos de etapa incompletos." };
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { customer: true, vehicle: true },
    });

    if (!lead) {
      return { success: false, error: "Prospecto no encontrado." };
    }

    let stageToSave = newStage;
    if (newStage === "CONVERTIDO") {
      stageToSave = "VENDIDO";
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: { stage: stageToSave },
    });

    await prisma.leadActivity.create({
      data: {
        leadId,
        type: "cambio_etapa",
        content: `Etapa actualizada a ${newStage}`,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "ACTUALIZAR_ETAPA_LEAD",
        entity: "Lead",
        entityId: leadId,
        details: `Prospecto de ${lead.customer.name} pasó a etapa ${newStage}`,
      },
    });

    revalidatePath("/leads");
    revalidatePath("/customers");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addLeadActivityAction(formData: FormData) {
  try {
    const leadId = formData.get("leadId") as string;
    const type = (formData.get("type") as string) || "nota";
    const content = formData.get("content") as string;

    if (!leadId || !content) {
      return { success: false, error: "Contenido requerido." };
    }

    await prisma.leadActivity.create({
      data: {
        leadId,
        type,
        content,
      },
    });

    revalidatePath("/leads");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
