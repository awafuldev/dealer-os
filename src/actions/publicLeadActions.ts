"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganization } from "@/lib/tenant";

export async function submitPublicLeadAction(formData: FormData) {
  try {
    const org = await getDefaultOrganization();
    const name = formData.get("name") as string;
    const phoneOrWa = formData.get("phone") as string;
    const vehicleId = (formData.get("vehicleId") as string) || null;
    const message = (formData.get("message") as string) || null;

    if (!name || !phoneOrWa) {
      return { success: false, error: "Nombre y teléfono o WhatsApp son obligatorios." };
    }

    // 1. Buscar o crear cliente automáticamente (Sin duplicar)
    let customer = await prisma.customer.findFirst({
      where: {
        organizationId: org.id,
        whatsapp: phoneOrWa.replace(/\D/g, ""),
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          organizationId: org.id,
          name,
          whatsapp: phoneOrWa.replace(/\D/g, ""),
          notes: `Lead entrante desde Catálogo Web Público. Consulta: ${message || "Sin mensaje"}`,
        },
      });
    }

    // 2. Crear el Lead en etapa NUEVO
    const lead = await prisma.lead.create({
      data: {
        organizationId: org.id,
        customerId: customer.id,
        vehicleId: vehicleId || null,
        source: "Web",
        stage: "NUEVO",
        notes: message || "Solicitó información desde el catálogo comercial web.",
        nextFollowUp: new Date(Date.now() + 1000 * 60 * 60 * 2), // Seguimiento en 2h
      },
    });

    // 3. Auditoría inmutable
    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        action: "LEAD_PUBLICO_WEB",
        entity: "Lead",
        entityId: lead.id,
        details: `Nuevo prospecto web recibido de ${name} (${phoneOrWa})`,
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

/**
 * Agenda una cita/test-drive desde el showroom público. Crea (o reutiliza)
 * el cliente y genera un Lead con la fecha/hora solicitada en las notas,
 * asociado al vehículo si el cliente eligió uno. Incluye un campo trampa
 * anti-spam ("website") que un humano nunca llena.
 */
export async function bookTestDriveAction(formData: FormData) {
  try {
    const honeypot = (formData.get("website") as string) || "";
    if (honeypot.trim()) {
      // Bot detectado: fingimos éxito sin crear nada.
      return { success: true };
    }

    const org = await getDefaultOrganization();
    const name = formData.get("name") as string;
    const phoneOrWa = formData.get("phone") as string;
    const email = (formData.get("email") as string) || null;
    const vehicleId = (formData.get("vehicleId") as string) || null;
    const date = (formData.get("date") as string) || null;
    const time = (formData.get("time") as string) || null;
    const notes = (formData.get("notes") as string) || null;

    if (!name || !phoneOrWa) {
      return { success: false, error: "Nombre y teléfono o WhatsApp son obligatorios." };
    }

    let vehicleLabel = "";
    if (vehicleId) {
      const v = await prisma.vehicle.findFirst({ where: { id: vehicleId, organizationId: org.id } });
      if (v) vehicleLabel = `${v.brand} ${v.model} ${v.year}`;
    }

    let customer = await prisma.customer.findFirst({
      where: { organizationId: org.id, whatsapp: phoneOrWa.replace(/\D/g, "") },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          organizationId: org.id,
          name,
          whatsapp: phoneOrWa.replace(/\D/g, ""),
          email,
          notes: "Cliente creado desde solicitud de cita (showroom web).",
        },
      });
    }

    const scheduleLine = date
      ? `Cita solicitada: ${date}${time ? ` a las ${time}` : ""}.`
      : "Cita solicitada (sin fecha específica).";
    const vehicleLine = vehicleLabel ? `Vehículo de interés: ${vehicleLabel}.` : "Aún no decide el vehículo.";

    const lead = await prisma.lead.create({
      data: {
        organizationId: org.id,
        customerId: customer.id,
        vehicleId: vehicleId || null,
        source: "Web",
        stage: "NUEVO",
        notes: [scheduleLine, vehicleLine, notes].filter(Boolean).join(" "),
        nextFollowUp: new Date(Date.now() + 1000 * 60 * 60 * 2),
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        action: "CITA_WEB_SOLICITADA",
        entity: "Lead",
        entityId: lead.id,
        details: `${name} (${phoneOrWa}) solicitó una cita/test-drive desde el showroom. ${scheduleLine}`,
      },
    });

    revalidatePath("/leads");
    revalidatePath("/customers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
