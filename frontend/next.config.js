/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'easycart-j6ue.onrender.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://easycart-j6ue.onrender.com/api',
  },
  // Exclude non-app directories from Next.js compilation
  pageExtensions: ['tsx', 'ts'],
  eslint: {
    // Only run ESLint on the app directory during builds
    dirs: ['src/app'],
  },
}

module.exports = nextConfig
