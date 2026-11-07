/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://calendly-booking-navy.vercel.app https://script.google.com https://script.googleusercontent.com https://api.github.com https://zubair-xovato.blogspot.com https://*.firebase.com https://*.firebaseio.com https://*.googleapis.com https://*.gstatic.com https://api.emailjs.com https://api-inference.huggingface.co https://huggingface.co https://challenges.cloudflare.com https://cloudflareinsights.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.googletagmanager.com wss://*.firebaseio.com wss://*.googleapis.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.googletagmanager.com https:",
  "media-src 'self' https://res.cloudinary.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join('; ');

export const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
];

const nextConfig = {
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
  rewrites: async () => [{ source: '/book', destination: '/book.html' }],
  redirects: async () => [
    { source: '/blog/gta-6-map-leak-explained', destination: '/blogs/gta-6-map-leak-vice-city-leonida-explained', permanent: true },
    { source: '/blogs/gta-6-map-leak-explained', destination: '/blogs/gta-6-map-leak-vice-city-leonida-explained', permanent: true },
    { source: '/blog/cursor-origin-vs-github', destination: '/blogs/cursor-origin-vs-github-git-hosting-2026', permanent: true },
    { source: '/blogs/cursor-origin-vs-github', destination: '/blogs/cursor-origin-vs-github-git-hosting-2026', permanent: true },
    { source: '/blog', destination: '/blogs', permanent: true },
    { source: '/blog/:slug', destination: '/blogs/:slug', permanent: true },
  ],
  headers: async () => [
    {
      source: '/(.*)',
      headers: securityHeaders,
    },
    {
      // The booking page is the one page the hero popup may frame.
      source: '/book.html',
      headers: [
        { key: 'Content-Security-Policy', value: contentSecurityPolicy.replace("frame-ancestors 'none'", "frame-ancestors 'self'") },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
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

// Wire Cloudflare bindings (env.AI, etc.) only into `next dev`. Production
// builds run non-interactively and must not require local Wrangler credentials.
if (process.env.NODE_ENV !== 'production') {
  initOpenNextCloudflareForDev();
}
