import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Restrict remote patterns to only Bluesky CDN
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.bsky.app",
        port: "",
        pathname: "/img/**",
        search: "",
      },
    ],
    // Only allow local optimization for assets/images path
    localPatterns: [
      {
        pathname: "/assets/images/**",
        search: "",
      },
      {
        pathname: "/logo.png",
        search: "",
      },
    ],
    // Increase cache TTL to 31 days since your animal images never change
    minimumCacheTTL: 2678400, // 31 days
    // Use only WebP format to reduce transformations
    formats: ["image/webp"],
    // Reduce quality options to limit transformations
    qualities: [75],
    // Optimize device sizes for your use case
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Optimize image sizes for smaller images
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  // Set cache headers for static assets
  async headers() {
    return [
      {
        source: "/assets/animals/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2678400, immutable", // 31 days cache
          },
        ],
      },
      {
        source: "/logo.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2678400, immutable", // 31 days cache
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
