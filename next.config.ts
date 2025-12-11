import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration (Next.js 16+ uses Turbopack by default)
  turbopack: {
    resolveAlias: {
      '.mjs': ['.mjs'],
    },
  },
  // Keep webpack config for compatibility when using --webpack flag
  webpack: (config) => {
    // Ensure .mjs files are handled correctly
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs'],
    };
    return config;
  },
};

export default nextConfig;
