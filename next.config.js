/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the output: 'export' to enable server-side features
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;