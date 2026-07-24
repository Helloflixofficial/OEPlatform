/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "utfs.io"
    ],
    formats: ['image/webp', 'image/avif'],
  },
  swcMinify: true,
  transpilePackages: [
    "@livekit/components-react",
    "@livekit/components-styles",
    "@livekit/components-core",
  ],
}

module.exports = nextConfig