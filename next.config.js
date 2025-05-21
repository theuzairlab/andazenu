/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['herotag.pk', 'ik.imagekit.io'],
  },
  experimental: {
    // This might help with the API routes collection issue
    serverComponentsExternalPackages: ['@prisma/client', 'prisma']
  }
};

module.exports = nextConfig;