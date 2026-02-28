import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Skip ESLint during production builds (we run it separately)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during production builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
