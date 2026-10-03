import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "dealer_os_session";

/**
 * Rutas públicas que no requieren sesión.
 */
function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/login") return true;
  if (pathname === "/showroom" || pathname.startsWith("/showroom/")) return true;
  if (pathname.startsWith("/brand/")) return true;
  // Imágenes de vehículos son públicas; documentos son privados y se sirven por API
  if (pathname.startsWith("/uploads/vehicles/")) return true;
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml" || pathname === "/favicon.ico") return true;
  return false;
}

/**
 * Verifica que el JWT tenga la forma correcta sin importar el secret.
 * La validación criptográfica completa ocurre en requireSession() en cada
 * Server Action y Route Handler de backend. El middleware solo evita
 * redirigir a usuarios con tokens claramente malformados o expirados.
 *
 * Verificamos exp del payload sin jose/jsonwebtoken (Edge Runtime compatible).
 */
function isTokenLikelyValid(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Decodificar payload (sin verificar firma — eso lo hace el backend)
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));

    // Verificar expiración básica
    if (payload.exp && Date.now() / 1000 > payload.exp) return false;

    // Verificar que tenga userId (estructura esperada)
    if (!payload.userId || typeof payload.userId !== "string") return false;

    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const hasValidToken = Boolean(token && isTokenLikelyValid(token));

  // Si ya tiene sesión activa y visita /login, ir al panel
  if (pathname === "/login") {
    if (hasValidToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // Rutas públicas: permitir sin restricciones
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Rutas privadas: requerir token válido
  if (!hasValidToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
