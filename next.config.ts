import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@base-ui/react'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
