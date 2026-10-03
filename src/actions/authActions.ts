"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";

export async function loginAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const emailRaw = (formData.get("email") as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string) || "";

  if (!emailRaw || !password) {
    return { success: false, error: "Ingresa tu correo y contraseña." };
  }

  const user = await prisma.user.findUnique({ where: { email: emailRaw } });

  // Mensaje genérico para no revelar qué correos están registrados
  if (!user || !user.active) {
    return { success: false, error: "Correo o contraseña incorrectos." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Correo o contraseña incorrectos." };
  }

  await createSession(user.id);
  return { success: true };
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
