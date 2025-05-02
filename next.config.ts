// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Required for Cloudflare Pages static export

  // Optional: Configure base path if hosting in a subdirectory
  // basePath: '/my-gallery',

  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },

  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Match the R2 public hostname structure: pub-<ACCOUNT_ID>.r2.dev
        // Use a wildcard (*) for the account ID part
        hostname: "pub-*.r2.dev",
        port: "", // No specific port
        // Match the bucket name and any path within it
        // It's best practice to include the bucket name dynamically
        pathname: `/${process.env.R2_BUCKET_NAME}/**`,
      },
    ],
  },
};

module.exports = nextConfig;
