import type { NextConfig } from "next";

const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
      {
        protocol: "https",
        hostname: "busan-public.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "postimg.cc",
      },
      {
        protocol: "https",
        hostname: "*.postimg.cc",
      },
    ],


  },
  serverExternalPackages: ["nodemailer"],


  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // increase global body size limit
    },
  },
};

export default nextConfig;
