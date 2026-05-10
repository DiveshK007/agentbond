import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack (default in Next.js 16) handles Node.js built-in polyfills automatically.
  // Empty config satisfies the "turbopack config present" check.
  turbopack: {},
  // Kept for webpack fallback mode (npm run build --webpack)
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false, os: false, crypto: false };
    return config;
  },
};

export default nextConfig;
