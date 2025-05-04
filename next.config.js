/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable more verbose error logging in production
  output: 'standalone',
  // This helps with hybrid Pages/App routing
  experimental: {
    // This is important for hybrid setups with both /app and /pages
    appDir: true,
  },
  // Optional: Enable server actions for better error handling
  serverActions: {
    bodySizeLimit: '2mb',
  },
};

module.exports = nextConfig;
