import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Dealer OS — Plataforma de Gestión Automotriz RD",
    template: "%s",
  },
  description: "SaaS integral para administración de dealers de vehículos en República Dominicana",
};

// Root layout stays intentionally empty of any admin or brand chrome.
// The (admin) group renders the Dealer OS dashboard shell (Sidebar, role
// switcher, quick actions). The (public) group renders the Kiry Auto
// showroom shell (header, footer, WhatsApp button). Neither should leak
// into the other.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
