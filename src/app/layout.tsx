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
import { LanguageProvider } from "@/components/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
