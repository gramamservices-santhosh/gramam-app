import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Disable strict mode for development (enable in production)
  reactStrictMode: true,

  // Enable experimental features if needed
  experimental: {
    // Enable server actions
  },
};

export default nextConfig;
