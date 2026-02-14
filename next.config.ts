import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow loading images from the S3 bucket
    remotePatterns: [
      {
        protocol: "https",
        hostname: "portfolio-shamun.s3.ap-south-1.amazonaws.com",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
