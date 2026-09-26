import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "dealer_os_session";

/**
 * Rutas públicas: el showroom, la página de login y los estáticos que sirve
 * el propio servidor (logo, hero, imágenes subidas de vehículos, SEO).
 *
 * IMPORTANTE: esto es solo la primera capa (evita renderizar páginas
 * administrativas sin sesión y redirige rápido). La autorización real ocurre
 * en el servidor dentro de cada página/Server Action mediante
 * requireSession(), que sí verifica la firma del JWT contra la base de
 * datos — el middleware por sí solo nunca es suficiente.
 */
function isPublicPath(pathname: string): boolean {
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

  if (pathname === "/login") {
    // Si ya hay una sesión (cookie presente), no tiene sentido ver el login.
    // La validez real se confirma dentro de la propia página /login.
    if (hasSessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
