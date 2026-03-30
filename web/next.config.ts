import path from "path";
import type { NextConfig } from "next";

const rootDir = path.resolve(__dirname);

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  poweredByHeader: false,
  experimental: {
    // Disable PPR — can cause workUnitAsyncStorage crash
    ppr: false,
  },


  env: {
    // LiteAPI Production credentials — server-only (not prefixed with NEXT_PUBLIC)
    LITEAPI_API_BASE_URL: process.env.LITEAPI_API_BASE_URL || "https://api.liteapi.travel/v3.0",
    LITEAPI_API_KEY: process.env.LITEAPI_API_KEY || "prod_69b4e3d9-bb6f-40eb-8cc0-3be0f8a57b6e",
    LITEAPI_API_KEY_HEADER: process.env.LITEAPI_API_KEY_HEADER || "X-API-Key",
    LITEAPI_BOOK_BASE_URL: process.env.LITEAPI_BOOK_BASE_URL || "https://book.liteapi.travel/v3.0",
  },
  // Turbopack root forced to the `web` directory to avoid workspace-root resolution
  // Turbopack removed — use webpack to avoid /_global-error workUnitAsyncStorage crash
  outputFileTracingRoot: rootDir,
  outputFileTracingExcludes: {
    // Exclude large public assets from being traced into serverless function bundles
    '*': ['public/**/*'],
  },
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
      "frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com",
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
      { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
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
        destination: "/zenistay",
        permanent: true,
      },
      {
        source: "/airbnbs/:slug",
        destination: "/zenistay/:slug",
        permanent: true,
      },
      {
        source: "/residences",
        destination: "/zenistay",
        permanent: true,
      },
      {
        source: "/residences/:path*",
        destination: "/zenistay/:path*",
        permanent: true,
      },
      {
        source: "/yachts",
        destination: "/zeniyacht",
        permanent: true,
      },
      {
        source: "/yachts/:path*",
        destination: "/zeniyacht/:path*",
        permanent: true,
      },
      {
        source: "/residences",
        destination: "/zenistay",
        permanent: true,
      },
      {
        source: "/residences/:path*",
        destination: "/zenistay/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
