import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    // Warnungen ignorieren, aber den Build fortsetzen
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript-Fehler ignorieren, aber den Build fortsetzen
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
