"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { saveDocumentFile, deleteDocumentFile } from "@/lib/uploads";

export async function createDocumentAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const title = (formData.get("title") as string)?.trim();
    const category = (formData.get("category") as string)?.trim() || "Contrato de venta";
    const customerId = (formData.get("customerId") as string)?.trim() || null;
    const vehicleId = (formData.get("vehicleId") as string)?.trim() || null;
    const saleId = (formData.get("saleId") as string)?.trim() || null;
    const status = (formData.get("status") as string)?.trim() || "Completo";
    const notes = (formData.get("notes") as string)?.trim() || null;
    const file = formData.get("file") as File | null;

    if (!title) {
      return { success: false, error: "El título o descripción del documento es obligatorio." };
    }

    if (customerId) {
      const custExists = await prisma.customer.findFirst({
        where: { id: customerId, organizationId: org.id },
      });
      if (!custExists) return { success: false, error: "El cliente especificado no pertenece a tu organización." };
    }

    if (vehicleId) {
      const vehExists = await prisma.vehicle.findFirst({
        where: { id: vehicleId, organizationId: org.id },
      });
      if (!vehExists) return { success: false, error: "El vehículo especificado no pertenece a tu organización." };
    }

    if (saleId) {
      const saleExists = await prisma.sale.findFirst({
        where: { id: saleId, organizationId: org.id },
      });
      if (!saleExists) return { success: false, error: "La venta especificada no pertenece a tu organización." };
    }

    let fileUrl: string | null = null;
    let fileSize: number | null = null;

    if (file && file.size > 0) {
      const uploadRes = await saveDocumentFile(org.id, file);
      fileUrl = uploadRes.storageKey;
      fileSize = uploadRes.size;
    }

    const doc = await prisma.document.create({
      data: {
        organizationId: org.id,
        title,
        category,
        customerId: customerId || null,
        vehicleId: vehicleId || null,
        saleId: saleId || null,
        status,
        notes,
        fileUrl,
        fileSize,
        uploadedBy: user.name,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "REGISTRAR_DOCUMENTO",
        entity: "Document",
        entityId: doc.id,
        details: `Documento registrado: "${title}" (${category}) con estado ${status}`,
      },
    });

    revalidatePath("/contracts");
    revalidatePath("/inventory");
    revalidatePath("/customers");
    revalidatePath("/sales");
    return { success: true, documentId: doc.id };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al registrar documento." };
  }
}

export async function updateDocumentStatusAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const documentId = formData.get("documentId") as string;
    const nextStatus = (formData.get("status") as string) || "Completo";

    const doc = await prisma.document.findFirst({
      where: { id: documentId, organizationId: org.id },
    });

    if (!doc) {
      return { success: false, error: "Documento no encontrado." };
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: nextStatus },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "ACTUALIZAR_DOCUMENTO",
        entity: "Document",
        entityId: documentId,
        details: `Estado de documento "${doc.title}" actualizado a ${nextStatus}`,
      },
    });

    revalidatePath("/contracts");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteDocumentAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const documentId = formData.get("documentId") as string;

    const doc = await prisma.document.findFirst({
      where: { id: documentId, organizationId: org.id },
    });

    if (!doc) {
      return { success: false, error: "Documento no encontrado." };
    }

    if (doc.fileUrl) {
      await deleteDocumentFile(doc.fileUrl);
    }

    await prisma.document.delete({ where: { id: documentId } });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "ELIMINAR_DOCUMENTO",
        entity: "Document",
        entityId: documentId,
        details: `Eliminó documento: "${doc.title}" (${doc.category})`,
      },
    });

    revalidatePath("/contracts");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al eliminar documento." };
  }
}
