import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For local dev: use standalone output
  // For Cloudflare: will be overridden by @cloudflare/next-on-pages
  output: process.env.CF_PAGES ? undefined : "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
