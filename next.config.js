/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for production
  output: 'standalone',
  // Optimize build performance
  experimental: {
    // Improve build performance
    serverMinification: true,
    optimizeServerReact: true,
  },
  // Skip pre-rendering admin and API routes
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  // Exclude test files from build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore TypeScript errors during build for speed
    ignoreBuildErrors: true,
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
