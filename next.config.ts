import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '**',
      },
    ],
  },
  allowedDevOrigins: ['l.app.volshebny.by'],
};

export default nextConfig;
