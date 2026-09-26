import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export const SESSION_COOKIE = "dealer_os_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // No se debe caer en un secreto por defecto: eso permitiría forjar sesiones.
    throw new Error(
      "JWT_SECRET no está configurado. Define esta variable de entorno antes de iniciar la aplicación."
    );
  }
  return secret;
}

interface SessionPayload {
  userId: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    rnc: string | null;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    address: string | null;
    logo: string | null;
  };
}

/**
 * Verifica una contraseña en texto plano contra el hash almacenado.
 * Nunca se compara ni se almacena la contraseña en texto plano.
 */
export async function verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, 10);
}

function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: SESSION_MAX_AGE_SECONDS });
}

function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === "object" && decoded && "userId" in decoded) {
      return decoded as SessionPayload;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Crea la sesión (cookie httpOnly, segura, firmada) para el usuario autenticado.
 */
export async function createSession(userId: string) {
  const token = signSessionToken({ userId });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Lee la sesión actual y devuelve el usuario autenticado (con su organización),
 * o null si no hay sesión válida. No redirige — para usar en lugares donde
 * el caller decide qué hacer si no hay usuario (por ejemplo, el propio middleware
 * o el layout público).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { organization: true },
  });

  if (!user || !user.active) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    organization: {
      id: user.organization.id,
      name: user.organization.name,
      rnc: user.organization.rnc,
      phone: user.organization.phone,
      whatsapp: user.organization.whatsapp,
      email: user.organization.email,
      address: user.organization.address,
      logo: user.organization.logo,
    },
  };
}

/**
 * Para usar en Server Components (páginas) y Server Actions del panel
 * administrativo. Si no hay sesión válida, redirige a /login — esta es la
 * autorización real de backend (el middleware es la primera línea de
 * defensa, pero cada acción/página vuelve a verificar por su cuenta).
 *
 * Devuelve tanto el usuario como su organización, con la misma forma que
 * usaban las llamadas anteriores a getDefaultOrganization(), para minimizar
 * cambios en el resto del código.
 */
export async function requireSession(): Promise<{ user: SessionUser; org: SessionUser["organization"] }> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return { user, org: user.organization };
}

/**
 * Restringe una acción a ciertos roles. Lanza un error controlado (no una
 * redirección) porque esto se usa dentro de Server Actions que ya obtuvieron
 * la sesión y devuelven { success, error } al formulario.
 */
export function assertRole(user: SessionUser, allowed: Role[]) {
  if (!allowed.includes(user.role)) {
    throw new Error("No tienes permisos para realizar esta acción.");
  }
}
