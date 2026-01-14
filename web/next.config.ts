import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img1.wsimg.com",
      },
      {
        protocol: "https",
        hostname: "media.ycn.miami",
      },
      {
        protocol: "http",
        hostname: "media.ycn.miami",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "triberesorts.com",
      },
      {
        protocol: "https",
        hostname: "dbijapkm3o6fj.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "www.lenukuhiva.com",
      },
    ],
  },
};

export default nextConfig;
