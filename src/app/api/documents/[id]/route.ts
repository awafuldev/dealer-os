import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { readPrivateDocumentFile } from "@/lib/uploads";
import path from "path";

const MIME_BY_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();

    if (!user) {
      return new NextResponse("Acceso no autorizado", { status: 401 });
    }

    const doc = await prisma.document.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    });

    if (!doc || !doc.fileUrl) {
      return new NextResponse("Documento no encontrado o no pertenece a tu organización", {
        status: 404,
      });
    }

    // fileUrl almacena la storageKey relativa o legacy URL
    let storageKey = doc.fileUrl;
    if (storageKey.startsWith("/uploads/documents/")) {
      storageKey = storageKey.replace("/uploads/documents/", "");
    }

    const fileBuffer = await readPrivateDocumentFile(storageKey);
    if (!fileBuffer) {
      return new NextResponse("Archivo no encontrado en almacenamiento", { status: 404 });
    }

    const ext = path.extname(storageKey).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || "application/octet-stream";

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(doc.title)}${ext}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    return new NextResponse("Error al servir el documento", { status: 500 });
  }
}
