import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ddragon.leagueoflegends.com', 'raw.communitydragon.org'],
  },
}

export default nextConfig;
