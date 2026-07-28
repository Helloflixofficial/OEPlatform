/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep development artifacts separate from production builds so stale HMR
  // chunks cannot be reused after layout changes.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  // ── Images ──────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'utfs.io' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600, // cache for 1h
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // ── Compiler ─────────────────────────────────────────────────────────────
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: true, // strip console.* in prod
    },
  }),

  // ── Experimental ─────────────────────────────────────────────────────────
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      'recharts',
      'date-fns',
    ],
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
  },

  // ── LiveKit packages need transpiling (ESM) ───────────────────────────────
  transpilePackages: [
    '@livekit/components-react',
    '@livekit/components-styles',
    '@livekit/components-core',
  ],

  // ── Reduce build noise ────────────────────────────────────────────────────
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },

  // ── Headers: aggressive caching for static assets ─────────────────────────
  async headers() {
    if (process.env.NODE_ENV !== 'production') return []

    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)\\.(svg|png|jpg|jpeg|gif|webp|avif|ico|woff2|woff)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
