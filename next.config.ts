import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/events/:slug",
        destination: "/events",
      },
    ];
  },
};

export default nextConfig;
