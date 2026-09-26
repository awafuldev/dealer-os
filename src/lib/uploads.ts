import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "vehicles");
const DOC_UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "documents");

export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB por imagen
export const MAX_DOC_SIZE_BYTES = 20 * 1024 * 1024; // 20MB por documento

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

export function isValidImageFile(file: File): boolean {
  if (!file || file.size === 0) return false;
  if (file.size > MAX_IMAGE_SIZE_BYTES) return false;
  return file.type.startsWith("image/");
}

function safeExtension(originalName: string, mimeType: string): string {
  if (EXTENSION_BY_MIME[mimeType]) return EXTENSION_BY_MIME[mimeType];
  const ext = path.extname(originalName || "").toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext) ? ext : ".jpg";
}

export async function saveVehicleImageFile(vehicleId: string, file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = safeExtension(file.name, file.type);
  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_ROOT, vehicleId);
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
    // Si el archivo ya no existe en disco, seguimos sin error
  }
}

export async function saveDocumentFile(orgId: string, file: File): Promise<{ url: string; size: number }> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name || "").toLowerCase() || ".pdf";
  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(DOC_UPLOAD_ROOT, orgId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return {
    url: `/uploads/documents/${orgId}/${filename}`,
    size: bytes.length,
  };
}

export async function deleteDocumentFile(url: string): Promise<void> {
  if (!url || !url.startsWith("/uploads/documents/")) return;
  const filePath = path.join(process.cwd(), "public", url);
  try {
    await unlink(filePath);
  } catch {
    // ignorar si no existe
  }
}
