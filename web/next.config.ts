import path from "path";
import type { NextConfig } from "next";

const rootDir = path.resolve(__dirname);

const nextConfig: NextConfig = {
  // Turbopack root forced to the `web` directory to avoid workspace-root resolution
  // when multiple lockfiles exist in the repository root.
  // Use an absolute path so Vercel's build (e.g. /vercel/path0/web) matches outputFileTracingRoot.
  turbopack: {
    // point to the current directory (the `web` project) — must be absolute
    root: rootDir,
  },
  // Ensure outputFileTracingRoot matches turbopack.root (they must be identical on Vercel)
  outputFileTracingRoot: rootDir,
  images: {
    qualities: [70, 75, 100],
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
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
      },
    ],
  },
};

export default nextConfig;
