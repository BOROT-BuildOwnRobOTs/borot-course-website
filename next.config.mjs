/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow large file uploads (200 MB) — applies to both server actions and API routes
  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },
}

export default nextConfig
