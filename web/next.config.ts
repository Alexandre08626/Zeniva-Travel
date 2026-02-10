import path from "path";
import type { NextConfig } from "next";

const rootDir = path.resolve(__dirname);

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
      {
        protocol: "https",
        hostname: "rvlcgtlcjylozbihtpkr.supabase.co",
      },
    ],
  },
  async headers() {
    const baseCsp = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "connect-src 'self' https: wss:",
      "upgrade-insecure-requests",
    ].join("; ");

    const securityHeaders = [
      { key: "Content-Security-Policy", value: baseCsp },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
    ];

    const corsOrigin =
      process.env.CORS_ORIGIN ||
      (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : "https://zenivatravel.com");

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/api/:path*",
        headers: [
          ...securityHeaders,
          { key: "Access-Control-Allow-Origin", value: corsOrigin },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Requested-With, X-API-Key" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/airbnbs",
        destination: "/residences",
        permanent: true,
      },
      {
        source: "/airbnbs/:slug",
        destination: "/residences/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
