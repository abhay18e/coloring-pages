// next.config.js
/** @type {import('next').NextConfig} */

// !!! IMPORTANT !!!
// Replace <YOUR_CLOUDFLARE_ACCOUNT_ID> and <YOUR_R2_BUCKET_NAME>
// with your actual Cloudflare Account ID and R2 Bucket Name.
// You will also configure ENVIRONMENT VARIABLES (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)
// in your Cloudflare Pages project settings.

const R2_ACCOUNT_ID =
  process.env.R2_ACCOUNT_ID || "<YOUR_CLOUDFLARE_ACCOUNT_ID>"; // Fallback for local build if not set
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "<YOUR_R2_BUCKET_NAME>"; // Fallback for local build if not set
const R2_PUBLIC_SUBDOMAIN = `pub-${R2_ACCOUNT_ID}.r2.dev`; // Standard R2 public access subdomain

const nextConfig = {
  // output: "export", // Required for Cloudflare Pages static export

  // Optional: Configure base path if hosting in a subdirectory
  // basePath: '/my-gallery',

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
