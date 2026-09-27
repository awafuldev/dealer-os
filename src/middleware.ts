import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "dealer_os_session";

/**
 * Rutas públicas:
 * - La página de inicio (/) que es el Showroom público de vehículos.
 * - /showroom y sus fichas de vehículos (/showroom/vehiculos/[slug]).
 * - /login para que el administrador pueda acceder a su cuenta.
 * - Archivos estáticos, imágenes de vehículos y archivos SEO.
 */
function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/login") return true;
  if (pathname === "/showroom" || pathname.startsWith("/showroom/")) return true;
  if (pathname.startsWith("/brand/")) return true;
  if (pathname.startsWith("/uploads/")) return true;
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml" || pathname === "/favicon.ico") return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  // Si ya tiene sesión activa y visita /login, enviarlo al panel administrativo
  if (pathname === "/login") {
    if (hasSessionCookie) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // Si es ruta pública, permitir el acceso sin restricciones
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Cualquier ruta privada (ej: /admin, /inventory, /leads, /sales, etc.) requiere login
  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
