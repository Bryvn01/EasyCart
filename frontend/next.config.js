

const withPWA = require('next-pwa').default;
const { i18n } = require('./next-i18next.config');


const nextConfig = withPWA({
  i18n,
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'easycart-j6ue.onrender.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://easycart-j6ue.onrender.com/api',
  },
  pageExtensions: ['tsx', 'ts'],
  eslint: {
    dirs: ['src/app'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://easycart-j6ue.onrender.com;"
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=()'
          },
        ],
      },
    ];
  },
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching: [
      {
        urlPattern: /^https?.*/, // cache all HTTP/S requests
        handler: 'NetworkFirst',
        options: {
          cacheName: 'http-cache',
          expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 },
        },
      },
    ],
    buildExcludes: [/middleware-manifest\.json$/],
  },
});

module.exports = nextConfig;
