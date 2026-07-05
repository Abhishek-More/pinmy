import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Pin thumbnails can come from any site; served through /_next/image so
    // PixelThumbnail can canvas-downscale them without CORS taint.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
