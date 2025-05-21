/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ddragon.leagueoflegends.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com',
        pathname: '/cdn/**',
      },
    ],
  },
};

module.exports = nextConfig;
