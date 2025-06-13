import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: false, // Temporarily disable to reduce doubles during log cleanup
  output: 'standalone',
  // Environment variables
  env: {
    DISABLE_SUPABASE_DEBUG: process.env.DISABLE_SUPABASE_DEBUG || 'true',
  },
  experimental: {
    serverActions: {
      enabled: true,
    },
    optimizePackageImports: ['@heroicons/react', 'lucide-react', 'react-icons'],
  },
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
    // Enable React optimizations
    styledComponents: true,
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
  webpack(config, { dev }) {
    // Hard-nuke the trace plugin when an env flag is set
    if (dev && process.env.NEXT_DISABLE_TRACE === 'true') {
      config.plugins = config.plugins.filter(
        (p) => p.constructor.name !== 'TraceNextServerPlugin'
      );
    }
    return config;
  },
};

export default withBundleAnalyzer(config);
