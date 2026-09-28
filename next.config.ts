import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
    JWT_SECRET: process.env.JWT_SECRET || "dealer_os_super_secret_jwt_key_rd_2026",
  },
};

export default nextConfig;
