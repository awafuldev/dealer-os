import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Las variables de entorno de servidor se leen dinámicamente de process.env en runtime
  // para evitar incrustar secretos o fallbacks estáticos en el bundle del cliente.
};

export default nextConfig;
