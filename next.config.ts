import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "insights-digest.s3.ap-southeast-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
