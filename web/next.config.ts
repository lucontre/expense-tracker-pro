import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure server-side dependencies are bundled
  serverExternalPackages: [],
  // Configure webpack to resolve modules correctly
  webpack: (config, { isServer }) => {
    if (isServer) {
      // For server-side, ensure node_modules resolution works
      config.resolve = config.resolve || {};
      config.resolve.modules = [
        path.resolve(__dirname, 'node_modules'),
        'node_modules',
      ];
    }
    return config;
  },
};

export default nextConfig;
