import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/s2/favicons**",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "localhost:3001",
        "fuzzy-meme-vpppv995qvphxrrr-3000.app.github.dev",
        "fuzzy-meme-vpppv995qvphxrrr-3001.app.github.dev",
      ],
    },
  },
};

export default nextConfig;
