import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For Cloudflare Pages: @cloudflare/next-on-pages handles the output
  // For local dev: use standalone output
  output: process.env.CF_PAGES ? undefined : "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    // Cloudflare Pages doesn't support Next.js image optimization
    // Use unoptimized images or a third-party loader
    unoptimized: true,
  },
  // Exclude Prisma engine files from the build output on Cloudflare
  // since @prisma/adapter-d1 doesn't need them
  serverExternalPackages: process.env.CF_PAGES
    ? ["@prisma/adapter-d1"]
    : [],
};

export default nextConfig;
