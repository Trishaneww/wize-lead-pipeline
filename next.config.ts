import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "playwright",
    "playwright-core",
    "pino",
    "pino-pretty",
  ],
};

export default nextConfig;
