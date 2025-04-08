/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add other configurations here as needed
  // e.g., experimental features, redirects, headers, etc.

  // If using MongoDB Realm or similar that needs serverless functions:
  // experimental: {
  //   serverComponentsExternalPackages: ['mongoose'], // If using mongoose in Server Components
  // },
};

export default nextConfig;