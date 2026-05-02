import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Turbopack (Next.js 16 default) — resolve canvas thành module rỗng
  // để pdfjs-dist không bị lỗi khi import canvas (Node.js env)
  turbopack: {
    resolveAlias: {
      canvas: "./src/lib/empty.js",
    },
  },
};

export default nextConfig;
