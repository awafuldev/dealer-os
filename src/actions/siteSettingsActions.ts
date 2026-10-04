"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

import { isValidImageFile, saveLogoImageFile } from "@/lib/uploads";

function strOrNull(formData: FormData, key: string): string | null {
  const v = (formData.get(key) as string)?.trim();
  return v ? v : null;
}

function floatOrNull(formData: FormData, key: string): number | null {
  const v = formData.get(key) as string;
  if (!v) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function intOrNull(formData: FormData, key: string): number | null {
  const v = formData.get(key) as string;
  if (!v) return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

export async function updateSiteSettingsAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();

    // 1. Actualizar Organización Base (Nombre, RNC, Logo, Contacto)
    const orgName = strOrNull(formData, "orgName") || org.name;
    const rnc = strOrNull(formData, "rnc");
    let logo = formData.has("logo") ? strOrNull(formData, "logo") : org.logo;
    
    // Soporte para subir archivo de imagen directamente
    const logoFile = formData.get("logoFile") as File | null;
    if (logoFile && logoFile.size > 0 && isValidImageFile(logoFile)) {
      logo = await saveLogoImageFile(logoFile);
    }

    const phone = strOrNull(formData, "phone");
    const whatsapp = strOrNull(formData, "whatsapp");
    const address = strOrNull(formData, "address");
    const email = strOrNull(formData, "email");

    await prisma.organization.update({
      where: { id: org.id },
      data: {
        name: orgName,
        rnc,
        logo,
        phone,
        whatsapp,
        address,
        email,
      },
    });

    // 2. Actualizar configuración del showroom público
    const data = {
      heroHeadline: strOrNull(formData, "heroHeadline"),
      heroSubheadline: strOrNull(formData, "heroSubheadline"),
      instagramHandle: strOrNull(formData, "instagramHandle"),
      instagramUrl: strOrNull(formData, "instagramUrl"),
      facebookUrl: strOrNull(formData, "facebookUrl"),
      mapEmbedUrl: strOrNull(formData, "mapEmbedUrl"),
      visitHours: strOrNull(formData, "visitHours"),
      trustTitle1: strOrNull(formData, "trustTitle1"),
      trustText1: strOrNull(formData, "trustText1"),
      trustTitle2: strOrNull(formData, "trustTitle2"),
      trustText2: strOrNull(formData, "trustText2"),
      trustTitle3: strOrNull(formData, "trustTitle3"),
      trustText3: strOrNull(formData, "trustText3"),
      trustTitle4: strOrNull(formData, "trustTitle4"),
      trustText4: strOrNull(formData, "trustText4"),
      trustTitle5: strOrNull(formData, "trustTitle5"),
      trustText5: strOrNull(formData, "trustText5"),
      trustTitle6: strOrNull(formData, "trustTitle6"),
      trustText6: strOrNull(formData, "trustText6"),
      financingIntro: strOrNull(formData, "financingIntro"),
      financingBanks: strOrNull(formData, "financingBanks"),
      minDownPaymentPct: floatOrNull(formData, "minDownPaymentPct"),
      maxTermMonths: intOrNull(formData, "maxTermMonths"),
      estimatedRatePct: floatOrNull(formData, "estimatedRatePct"),
    };

    await prisma.siteSettings.upsert({
      where: { organizationId: org.id },
      update: data,
      create: { organizationId: org.id, ...data },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "ACTUALIZAR_CONFIGURACION",
        entity: "Organization",
        entityId: org.id,
        details: `Configuración de ${orgName} actualizada por ${user.name}`,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/showroom");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al guardar la configuración." };
  }
}
