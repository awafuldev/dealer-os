"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function createCustomerAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const name = (formData.get("name") as string)?.trim();
    const whatsapp = (formData.get("whatsapp") as string)?.trim().replace(/\D/g, "");
    const phone = (formData.get("phone") as string)?.trim() || null;
    const email = (formData.get("email") as string)?.trim() || null;
    const cedulaOrRnc = (formData.get("cedulaOrRnc") as string)?.trim() || null;
    const budget = parseFloat((formData.get("budget") as string) || "0") || null;
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!name || !whatsapp) {
      return { success: false, error: "Nombre y WhatsApp son obligatorios." };
    }

    const customer = await prisma.customer.create({
      data: {
        organizationId: org.id,
        name,
        whatsapp,
        phone,
        email,
        cedulaOrRnc,
        budget,
        notes,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "CREAR_CLIENTE",
        entity: "Customer",
        entityId: customer.id,
        details: `Nuevo cliente registrado: ${name} (WhatsApp: ${whatsapp})`,
      },
    });

    revalidatePath("/customers");
    revalidatePath("/leads");
    revalidatePath("/");
    return { success: true, customerId: customer.id };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al registrar cliente." };
  }
}

export async function updateCustomerAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const customerId = formData.get("customerId") as string;
    const name = (formData.get("name") as string)?.trim();
    const whatsapp = (formData.get("whatsapp") as string)?.trim().replace(/\D/g, "");
    const phone = (formData.get("phone") as string)?.trim() || null;
    const email = (formData.get("email") as string)?.trim() || null;
    const cedulaOrRnc = (formData.get("cedulaOrRnc") as string)?.trim() || null;
    const budget = parseFloat((formData.get("budget") as string) || "0") || null;
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!customerId || !name || !whatsapp) {
      return { success: false, error: "Nombre y WhatsApp son obligatorios." };
    }

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, organizationId: org.id },
    });

    if (!customer) {
      return { success: false, error: "Cliente no encontrado." };
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        name,
        whatsapp,
        phone,
        email,
        cedulaOrRnc,
        budget,
        notes,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "EDITAR_CLIENTE",
        entity: "Customer",
        entityId: customerId,
        details: `Expediente de cliente actualizado: ${name}`,
      },
    });

    revalidatePath("/customers");
    revalidatePath("/leads");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al actualizar cliente." };
  }
}

export async function deleteCustomerAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const customerId = formData.get("customerId") as string;

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, organizationId: org.id },
      include: { sales: true },
    });

    if (!customer) {
      return { success: false, error: "Cliente no encontrado." };
    }

    if (customer.sales.length > 0) {
      return {
        success: false,
        error: "Este cliente tiene ventas registradas en el sistema y no puede eliminarse para preservar el historial fiscal y contable.",
      };
    }

    await prisma.customer.delete({ where: { id: customerId } });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "ELIMINAR_CLIENTE",
        entity: "Customer",
        entityId: customerId,
        details: `Cliente eliminado del directorio: ${customer.name}`,
      },
    });

    revalidatePath("/customers");
    revalidatePath("/leads");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al eliminar cliente." };
  }
}

export async function createLeadAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    let customerId = (formData.get("customerId") as string)?.trim() || null;
    const newCustomerName = (formData.get("name") as string)?.trim();
    const newCustomerWhatsapp = (formData.get("whatsapp") as string)?.trim().replace(/\D/g, "");
    const vehicleId = (formData.get("vehicleId") as string)?.trim() || null;
    const source = (formData.get("source") as string) || "WhatsApp";
    const stage = (formData.get("stage") as any) || "NUEVO";
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!customerId && newCustomerName && newCustomerWhatsapp) {
      // Crear cliente nuevo automáticamente
      const newCust = await prisma.customer.create({
        data: {
          organizationId: org.id,
          name: newCustomerName,
          whatsapp: newCustomerWhatsapp,
          notes: notes ? `Origen: Lead (${source}) - ${notes}` : `Origen: Lead (${source})`,
        },
      });
      customerId = newCust.id;
    }

    if (!customerId) {
      return { success: false, error: "Debes seleccionar un cliente existente o ingresar nombre y WhatsApp." };
    }

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, organizationId: org.id },
    });

    if (!customer) {
      return { success: false, error: "Cliente no encontrado." };
    }

    let vehicleLabel = "Vehículo general";
    if (vehicleId) {
      const v = await prisma.vehicle.findFirst({ where: { id: vehicleId, organizationId: org.id } });
      if (v) vehicleLabel = `${v.brand} ${v.model} ${v.year}`;
    }

    const lead = await prisma.lead.create({
      data: {
        organizationId: org.id,
        customerId,
        vehicleId: vehicleId || null,
        source,
        stage,
        notes,
        nextFollowUp: new Date(Date.now() + 1000 * 60 * 60 * 24), // mañana
      },
    });

    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "creacion",
        content: `Prospecto creado desde ${source} con interés en ${vehicleLabel}`,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "CREAR_PROSPECTO",
        entity: "Lead",
        entityId: lead.id,
        details: `Nuevo prospecto para ${customer.name} (${vehicleLabel}) vía ${source}`,
      },
    });

    revalidatePath("/leads");
    revalidatePath("/customers");
    revalidatePath("/");
    return { success: true, leadId: lead.id };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al crear prospecto." };
  }
}
