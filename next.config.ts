import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Cloudflare Pages
  output: "export",
  trailingSlash: true,

  // Required for static export
  images: {
    unoptimized: true,
    remotePatterns: [
      // ESPN / ABC logos
      { protocol: "https", hostname: "a.espncdn.com" },
      { protocol: "https", hostname: "a1.espncdn.com" },
      { protocol: "https", hostname: "a2.espncdn.com" },
      { protocol: "https", hostname: "a3.espncdn.com" },
      { protocol: "https", hostname: "a4.espncdn.com" },
      { protocol: "https", hostname: "**.espncdn.com" },
      // TheSportsDB assets
      { protocol: "https", hostname: "www.thesportsdb.com" },
      { protocol: "https", hostname: "**.thesportsdb.com" },
      // TheSportsDB CDN
      { protocol: "https", hostname: "cdn.thesportsdb.com" },
    ],
  },

};

export default nextConfig;
