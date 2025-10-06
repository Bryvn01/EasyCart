/**
 * Next.js Configuration for EasyCart
 * 
 * This configuration enables Cloudinary images to be rendered properly
 * when deployed on Vercel or other hosting platforms.
 * 
 * NOTE: This project currently uses Create React App (CRA).
 * This configuration file is included for future Next.js migration
 * or if the deployment platform uses Next.js optimizations.
 */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dvpr5bcrp/**"
      }
    ],
    // Additional image optimization settings
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  }
};

module.exports = nextConfig;
