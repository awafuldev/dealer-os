import { writeFile, mkdir, unlink, readFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Directorio público para fotos de vehículos (públicas para el showroom)
const VEHICLE_UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "vehicles");

// Directorio privado para documentos sensibles (contratos, cédulas, recibos).
// Permite sobreescritura con UPLOAD_DIR para volúmenes persistentes en Railway (ej: /data/private)
const PRIVATE_STORAGE_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "storage", "private");

export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB por imagen
export const MAX_DOC_SIZE_BYTES = 20 * 1024 * 1024; // 20MB por documento

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const ALLOWED_DOC_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".doc", ".docx"];

export function isValidImageFile(file: File): boolean {
  if (!file || file.size === 0) return false;
  if (file.size > MAX_IMAGE_SIZE_BYTES) return false;
  return file.type.startsWith("image/");
}

export function isValidDocumentFile(file: File): boolean {
  if (!file || file.size === 0) return false;
  if (file.size > MAX_DOC_SIZE_BYTES) return false;
  const ext = path.extname(file.name || "").toLowerCase();
  return ALLOWED_DOC_EXTENSIONS.includes(ext) || file.type === "application/pdf" || file.type.startsWith("image/");
}

function safeExtension(originalName: string, mimeType: string): string {
  if (EXTENSION_BY_MIME[mimeType]) return EXTENSION_BY_MIME[mimeType];
  const ext = path.extname(originalName || "").toLowerCase();
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext) ? ext : ".jpg";
}

export async function saveVehicleImageFile(vehicleId: string, file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = safeExtension(file.name, file.type);
  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(VEHICLE_UPLOAD_ROOT, vehicleId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return `/uploads/vehicles/${vehicleId}/${filename}`;
}

export async function deleteVehicleImageFile(url: string): Promise<void> {
  if (!url || !url.startsWith("/uploads/vehicles/")) return;
  const filePath = path.join(process.cwd(), "public", url);
  try {
    await unlink(filePath);
  } catch {
    // Si no existe, continuar
  }
}

/**
 * Guarda un documento sensible en almacenamiento PRIVADO (no accesible vía HTTP estático).
 * Retorna un identificador seguro para ser servido por /api/documents/[id].
 */
export async function saveDocumentFile(
  orgId: string,
  file: File
): Promise<{ storageKey: string; size: number }> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name || "").toLowerCase() || ".pdf";
  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(PRIVATE_STORAGE_DIR, orgId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);

  // Clave relativa de almacenamiento privado
  const storageKey = `${orgId}/${filename}`;
  return {
    storageKey,
    size: bytes.length,
  };
}

export async function readPrivateDocumentFile(storageKey: string): Promise<Buffer | null> {
  // Evitar directory traversal
  const safePath = path.normalize(storageKey).replace(/^(\.\.[\/\\])+/, "");
  const fullPath = path.join(PRIVATE_STORAGE_DIR, safePath);
  try {
    return await readFile(fullPath);
  } catch {
    return null;
  }
}

export async function deleteDocumentFile(storageKey: string): Promise<void> {
  if (!storageKey) return;
  const safePath = path.normalize(storageKey).replace(/^(\.\.[\/\\])+/, "");
  const fullPath = path.join(PRIVATE_STORAGE_DIR, safePath);
  try {
    await unlink(fullPath);
  } catch {
    // Si no existe en disco, ignorar
  }
}
