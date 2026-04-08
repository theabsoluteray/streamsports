import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "streamed.pk" },
      { protocol: "https", hostname: "**.streamed.pk" },
      { protocol: "https", hostname: "streami.su" },
      { protocol: "https", hostname: "**.streami.su" },
    ],
  },
};

export default nextConfig;
