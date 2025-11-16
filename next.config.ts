import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // (optional if you use Firebase Storage too)
      },
      {
        protocol: "https",
        hostname: "**.ufs.sh",   // allow ALL UploadThing subdomains
      },
      {
        protocol: "https",
        hostname: "**.utfs.io",  // allow utfs.io variants
      },
    ],
    domains: ["utfs.io"],
  },
};

export default nextConfig;
