/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable more verbose error logging in production
  output: 'standalone',
  // Enable source maps in production for better error tracing
  productionBrowserSourceMaps: true,
  // Exclude test files from build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configure image domains for remote images (avatars)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Add redirects from old Pages Router routes to new App Router routes
  async redirects() {
    return [
      {
        source: '/pages/quiz/:subject/:topic',
        destination: '/quiz/:subject/:topic',
        permanent: true,
      },
      {
        source: '/pages/quiz/:subject/chapters',
        destination: '/quiz/:subject/chapters',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
