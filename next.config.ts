import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  outputFileTracingRoot: import.meta.dirname,
  images: {
    // 5120 lets the punch-in layer use the 5312px original on retina screens.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840, 5120],
    qualities: [75, 90],
  },
  turbopack: {
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
