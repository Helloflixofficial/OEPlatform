/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "utfs.io"
    ],
    formats: ['image/webp', 'image/avif'],
  },
  swcMinify: true,
}

module.exports = nextConfig