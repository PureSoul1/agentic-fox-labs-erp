import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    // Cloudflare doesn't support Next.js built-in image optimization
    unoptimized: true,
  },
};

export default nextConfig;
