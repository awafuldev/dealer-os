"use client";

import React, { createContext, useContext } from "react";

export type UserRole = "ADMIN" | "SALES" | "FINANCE" | "SUPERVISOR";

interface UserContextType {
  role: UserRole;
  userName: string;
  userEmail: string;
  canViewFinancials: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * Provee el usuario REAL de la sesión activa (viene del servidor, desde
 * requireSession() en el layout administrativo). Ya no existe un selector
 * de rol de demostración: el rol y el nombre son los del usuario que
 * inició sesión con su correo y contraseña.
 */
export function UserProvider({
  role,
  userName,
  userEmail,
  children,
}: {
  role: UserRole;
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const canViewFinancials = role === "ADMIN" || role === "FINANCE" || role === "SUPERVISOR";

  return (
    <UserContext.Provider value={{ role, userName, userEmail, canViewFinancials }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
