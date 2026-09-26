"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { buildVehicleSlugBase, randomSlugSuffix } from "@/lib/slug";
import { isValidImageFile, saveVehicleImageFile, deleteVehicleImageFile } from "@/lib/uploads";

export async function createVehicleAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();

    const brand = (formData.get("brand") as string)?.trim();
    const model = (formData.get("model") as string)?.trim();
    const year = parseInt(formData.get("year") as string, 10);
    const salePrice = parseFloat(formData.get("salePrice") as string);
    const purchasePrice = parseFloat((formData.get("purchasePrice") as string) || "0");
    const mileage = parseInt((formData.get("mileage") as string) || "0", 10);
    const plate = (formData.get("plate") as string)?.trim() || null;
    const vin = (formData.get("vin") as string)?.trim() || null;
    const color = (formData.get("color") as string)?.trim() || null;
    const transmission = (formData.get("transmission") as string) || "Automática";
    const fuel = (formData.get("fuel") as string) || "Gasolina";
    const drivetrain = (formData.get("drivetrain") as string)?.trim() || "4x2";
    const notes = (formData.get("notes") as string)?.trim() || null;

    const imageFiles = (formData.getAll("images") as File[]).filter(isValidImageFile);
    const coverIndexRaw = parseInt((formData.get("coverIndex") as string) || "0", 10);
    const coverIndex = isNaN(coverIndexRaw) || coverIndexRaw < 0 || coverIndexRaw >= imageFiles.length ? 0 : coverIndexRaw;

    if (!brand || !model || isNaN(year) || isNaN(salePrice) || salePrice <= 0) {
      return { success: false, error: "Marca, modelo, año y precio de venta válido son obligatorios." };
    }

    const baseSlug = buildVehicleSlugBase(brand, model, year);
    const slugCollision = await prisma.vehicle.findFirst({
      where: { organizationId: org.id, slug: baseSlug },
      select: { id: true },
    });
    const slug = slugCollision ? `${baseSlug}-${randomSlugSuffix()}` : baseSlug;

    const vehicle = await prisma.vehicle.create({
      data: {
        organizationId: org.id,
        brand,
        model,
        year,
        salePrice,
        purchasePrice,
        mileage,
        plate,
        vin,
        color,
        transmission,
        fuel,
        drivetrain,
        notes,
        slug,
        status: "DISPONIBLE",
        acquisitionDate: new Date(),
        isPublished: imageFiles.length > 0, // Si tiene fotos, se publica
      },
    });

    if (imageFiles.length > 0) {
      const savedUrls = await Promise.all(imageFiles.map((file) => saveVehicleImageFile(vehicle.id, file)));
      await prisma.vehicleImage.createMany({
        data: savedUrls.map((url, i) => ({
          vehicleId: vehicle.id,
          url,
          order: i + 1,
          isCover: i === coverIndex,
        })),
      });
    }

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "CREAR_VEHICULO",
        entity: "Vehicle",
        entityId: vehicle.id,
        details: `Nuevo vehículo registrado: ${brand} ${model} ${year} (Placa: ${plate || "S/P"}) por RD$${salePrice.toLocaleString()}`,
      },
    });

    revalidatePath("/inventory");
    revalidatePath("/");
    revalidatePath("/finance");
    revalidatePath("/showroom");
    return { success: true, vehicleId: vehicle.id };
  } catch (error: any) {
    console.error("Error creating vehicle:", error);
    return { success: false, error: error.message || "Error al registrar vehículo." };
  }
}

export async function updateVehicleAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const vehicleId = formData.get("vehicleId") as string;

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, organizationId: org.id },
    });

    if (!vehicle) {
      return { success: false, error: "Vehículo no encontrado." };
    }

    const brand = (formData.get("brand") as string)?.trim();
    const model = (formData.get("model") as string)?.trim();
    const year = parseInt(formData.get("year") as string, 10);
    const salePrice = parseFloat(formData.get("salePrice") as string);
    const purchasePrice = parseFloat((formData.get("purchasePrice") as string) || "0");
    const mileage = parseInt((formData.get("mileage") as string) || "0", 10);
    const plate = (formData.get("plate") as string)?.trim() || null;
    const vin = (formData.get("vin") as string)?.trim() || null;
    const color = (formData.get("color") as string)?.trim() || null;
    const transmission = (formData.get("transmission") as string) || "Automática";
    const fuel = (formData.get("fuel") as string) || "Gasolina";
    const drivetrain = (formData.get("drivetrain") as string)?.trim() || "4x2";
    const status = (formData.get("status") as any) || vehicle.status;
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!brand || !model || isNaN(year) || isNaN(salePrice) || salePrice <= 0) {
      return { success: false, error: "Marca, modelo, año y precio de venta válido son obligatorios." };
    }

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        brand,
        model,
        year,
        salePrice,
        purchasePrice,
        mileage,
        plate,
        vin,
        color,
        transmission,
        fuel,
        drivetrain,
        status,
        notes,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "EDITAR_VEHICULO",
        entity: "Vehicle",
        entityId: vehicleId,
        details: `Vehículo editado: ${brand} ${model} ${year} - Precio: RD$${salePrice.toLocaleString()} - Estado: ${status}`,
      },
    });

    revalidatePath(`/inventory/${vehicleId}`);
    revalidatePath("/inventory");
    revalidatePath("/");
    revalidatePath("/finance");
    revalidatePath("/showroom");
    if (vehicle.slug) revalidatePath(`/showroom/vehiculos/${vehicle.slug}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al actualizar vehículo." };
  }
}

export async function deleteVehicleAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const vehicleId = formData.get("vehicleId") as string;

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, organizationId: org.id },
      include: {
        images: true,
        sales: true,
      },
    });

    if (!vehicle) {
      return { success: false, error: "Vehículo no encontrado." };
    }

    // Regla de Integridad de Negocio: No eliminar vehículos con ventas registradas
    if (vehicle.sales.length > 0) {
      return {
        success: false,
        error:
          "Este vehículo tiene una venta registrada y no puede eliminarse sin afectar el historial financiero y legal. Como alternativa segura, puedes marcarlo como 'Vendido' o despublicarlo del showroom.",
      };
    }

    // Eliminar archivos físicos de imágenes
    for (const img of vehicle.images) {
      await deleteVehicleImageFile(img.url);
    }

    // Eliminar vehículo (las relaciones dependientes como VehicleImage y VehicleExpense se eliminan en cascada)
    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "ELIMINAR_VEHICULO",
        entity: "Vehicle",
        entityId: vehicleId,
        details: `Vehículo eliminado del sistema: ${vehicle.brand} ${vehicle.model} ${vehicle.year} (Placa: ${vehicle.plate || "S/P"}, VIN: ${vehicle.vin || "S/V"})`,
      },
    });

    revalidatePath("/inventory");
    revalidatePath("/");
    revalidatePath("/finance");
    revalidatePath("/showroom");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al eliminar vehículo." };
  }
}

export async function addExpenseAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const vehicleId = formData.get("vehicleId") as string;
    const category = (formData.get("category") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const amount = parseFloat(formData.get("amount") as string);

    if (!vehicleId || !category || !description || isNaN(amount) || amount <= 0) {
      return { success: false, error: "Categoría, descripción y monto válido son obligatorios." };
    }

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, organizationId: org.id },
    });

    if (!vehicle) {
      return { success: false, error: "Vehículo no encontrado." };
    }

    await prisma.vehicleExpense.create({
      data: {
        vehicleId,
        category,
        description,
        amount,
        createdBy: user.name,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "AGREGAR_GASTO_VEHICULO",
        entity: "VehicleExpense",
        entityId: vehicleId,
        details: `Gasto de RD$${amount.toLocaleString()} en ${category} para ${vehicle.brand} ${vehicle.model}: ${description}`,
      },
    });

    revalidatePath(`/inventory/${vehicleId}`);
    revalidatePath("/inventory");
    revalidatePath("/");
    revalidatePath("/finance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteVehicleExpenseAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const expenseId = formData.get("expenseId") as string;

    const expense = await prisma.vehicleExpense.findUnique({
      where: { id: expenseId },
      include: { vehicle: true },
    });

    if (!expense || expense.vehicle.organizationId !== org.id) {
      return { success: false, error: "Gasto no encontrado." };
    }

    await prisma.vehicleExpense.delete({ where: { id: expenseId } });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "ELIMINAR_GASTO_VEHICULO",
        entity: "VehicleExpense",
        entityId: expense.vehicleId,
        details: `Eliminó gasto de RD$${expense.amount.toLocaleString()} (${expense.description}) de ${expense.vehicle.brand} ${expense.vehicle.model}`,
      },
    });

    revalidatePath(`/inventory/${expense.vehicleId}`);
    revalidatePath("/inventory");
    revalidatePath("/finance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateVehiclePriceAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const vehicleId = formData.get("vehicleId") as string;
    const newPrice = parseFloat(formData.get("newPrice") as string);

    if (!vehicleId || isNaN(newPrice) || newPrice <= 0) {
      return { success: false, error: "Precio de venta inválido." };
    }

    const currentVehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, organizationId: org.id },
    });

    if (!currentVehicle) {
      return { success: false, error: "Vehículo no encontrado." };
    }

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { salePrice: newPrice },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "CAMBIAR_PRECIO",
        entity: "Vehicle",
        entityId: vehicleId,
        details: `Cambio de precio en ${currentVehicle.brand} ${currentVehicle.model}: RD$${currentVehicle.salePrice.toLocaleString()} -> RD$${newPrice.toLocaleString()}`,
      },
    });

    revalidatePath(`/inventory/${vehicleId}`);
    revalidatePath("/inventory");
    revalidatePath("/showroom");
    if (currentVehicle.slug) revalidatePath(`/showroom/vehiculos/${currentVehicle.slug}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleVehiclePublishAction(formDataOrId: FormData | string) {
  try {
    const { user, org } = await requireSession();
    const vehicleId = typeof formDataOrId === "string" ? formDataOrId : (formDataOrId.get("vehicleId") as string);

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, organizationId: org.id },
      include: { images: true },
    });
    if (!vehicle) return { success: false, error: "Vehículo no encontrado." };

    const nextPublished = !vehicle.isPublished;

    if (nextPublished && vehicle.images.length === 0) {
      return {
        success: false,
        error: "Agrega al menos una imagen real del vehículo antes de publicarlo en el showroom.",
      };
    }

    let slug = vehicle.slug;
    if (!slug) {
      const baseSlug = buildVehicleSlugBase(vehicle.brand, vehicle.model, vehicle.year);
      const collision = await prisma.vehicle.findFirst({
        where: { organizationId: org.id, slug: baseSlug, NOT: { id: vehicle.id } },
        select: { id: true },
      });
      slug = collision ? `${baseSlug}-${randomSlugSuffix()}` : baseSlug;
    }

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { isPublished: nextPublished, slug },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: nextPublished ? "PUBLICAR_VEHICULO_WEB" : "DESPUBLICAR_VEHICULO_WEB",
        entity: "Vehicle",
        entityId: vehicleId,
        details: `${vehicle.brand} ${vehicle.model} ${vehicle.year} ${nextPublished ? "publicado en" : "retirado del"} showroom público.`,
      },
    });

    revalidatePath(`/inventory/${vehicleId}`);
    revalidatePath("/inventory");
    revalidatePath("/showroom");
    if (slug) revalidatePath(`/showroom/vehiculos/${slug}`);
    return { success: true, isPublished: nextPublished, slug };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateVehicleWebInfoAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const vehicleId = formData.get("vehicleId") as string;
    const description = (formData.get("description") as string)?.trim() || null;
    const bodyType = (formData.get("bodyType") as string)?.trim() || null;
    const vinPublic = formData.get("vinPublic") === "on";
    const featuredOnHome = formData.get("featuredOnHome") === "on";

    const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, organizationId: org.id } });
    if (!vehicle) return { success: false, error: "Vehículo no encontrado." };

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { description, bodyType, vinPublic, featuredOnHome },
    });

    revalidatePath(`/inventory/${vehicleId}`);
    revalidatePath("/showroom");
    if (vehicle.slug) revalidatePath(`/showroom/vehiculos/${vehicle.slug}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addVehicleImageAction(formData: FormData) {
  try {
    const { org } = await requireSession();
    const vehicleId = formData.get("vehicleId") as string;
    const files = (formData.getAll("images") as File[]).filter(isValidImageFile);

    if (!vehicleId || files.length === 0) {
      return { success: false, error: "Selecciona al menos una imagen válida." };
    }

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, organizationId: org.id },
      include: { images: true },
    });
    if (!vehicle) return { success: false, error: "Vehículo no encontrado." };

    const maxOrder = vehicle.images.reduce((max, img) => Math.max(max, img.order), 0);
    const isFirstBatch = vehicle.images.length === 0;

    const savedUrls = await Promise.all(files.map((file) => saveVehicleImageFile(vehicleId, file)));

    await prisma.vehicleImage.createMany({
      data: savedUrls.map((url, i) => ({
        vehicleId,
        url,
        order: maxOrder + i + 1,
        isCover: isFirstBatch && i === 0,
      })),
    });

    revalidatePath(`/inventory/${vehicleId}`);
    revalidatePath("/showroom");
    if (vehicle.slug) revalidatePath(`/showroom/vehiculos/${vehicle.slug}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeVehicleImageAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const vehicleId = formData.get("vehicleId") as string;
    const imageId = formData.get("imageId") as string;

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, organizationId: org.id },
      include: { images: { orderBy: { order: "asc" } } },
    });
    if (!vehicle) return { success: false, error: "Vehículo no encontrado." };

    const target = vehicle.images.find((i) => i.id === imageId);
    if (!target) return { success: false, error: "Imagen no encontrada." };

    await prisma.vehicleImage.delete({ where: { id: imageId } });
    await deleteVehicleImageFile(target.url);

    if (target.isCover) {
      const nextCover = vehicle.images.find((i) => i.id !== imageId);
      if (nextCover) {
        await prisma.vehicleImage.update({ where: { id: nextCover.id }, data: { isCover: true } });
      }
    }

    revalidatePath(`/inventory/${vehicleId}`);
    revalidatePath("/showroom");
    if (vehicle.slug) revalidatePath(`/showroom/vehiculos/${vehicle.slug}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function setCoverImageAction(formData: FormData) {
  try {
    const { user, org } = await requireSession();
    const vehicleId = formData.get("vehicleId") as string;
    const imageId = formData.get("imageId") as string;

    const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, organizationId: org.id } });
    if (!vehicle) return { success: false, error: "Vehículo no encontrado." };

    await prisma.$transaction([
      prisma.vehicleImage.updateMany({ where: { vehicleId }, data: { isCover: false } }),
      prisma.vehicleImage.update({ where: { id: imageId }, data: { isCover: true } }),
    ]);

    revalidatePath(`/inventory/${vehicleId}`);
    revalidatePath("/showroom");
    if (vehicle.slug) revalidatePath(`/showroom/vehiculos/${vehicle.slug}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
