/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable more verbose error logging in production
  output: 'standalone',
  // Enable source maps in production for better error tracing
  productionBrowserSourceMaps: true,
  // Remove invalid options and use only valid ones
  experimental: {
    // Empty but keeping for future use
  },
};

module.exports = nextConfig;
