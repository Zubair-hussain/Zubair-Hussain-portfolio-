/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      'framer-motion',
    ],
    ppr: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
    {
      source: '/fonts/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      source: '/models/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: {
        loader: 'file-loader',
        options: { publicPath: '/_next/static/models/', outputPath: 'static/models/' },
      },
    });
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
