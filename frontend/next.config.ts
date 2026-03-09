import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",

  images: {
    domains: ["res.cloudinary.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "socioverse-media-storage-india.s3.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;