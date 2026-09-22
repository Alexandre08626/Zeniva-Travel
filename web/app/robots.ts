import type { MetadataRoute } from "next";

// AI answer engines (ChatGPT, Claude, Perplexity, Google AI) — explicitly allowed on public
// pages, same private-area blocks as everyone else. Listing them by name is a signal in itself.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

const PRIVATE_PATHS = [
  "/agent/",
  "/admin/",
  "/api/",
  "/chat/*/",
  "/call/*/",
  "/login",
  "/register",
  "/dashboard",
  "/booking/",
  "/documents/",
  "/create-traveler-profile",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: ["/", "/llms.txt"],
        disallow: PRIVATE_PATHS,
      })),
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/agent/",
          "/admin/",
          "/api/",
          "/chat/*/",        // Block individual session URLs
          "/call/*/",        // Block individual call session URLs
          "/login",
          "/register",
          "/dashboard",
          "/booking/",
          "/documents/",
          "/create-traveler-profile",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/agent/",
          "/admin/",
          "/api/",
          "/chat/[^/]*/",
          "/call/[^/]*/",
          "/login",
          "/register",
          "/booking/",
          "/documents/",
        ],
      },
    ],
    sitemap: "https://www.zenivatravel.com/sitemap.xml",
    host: "https://www.zenivatravel.com",
  };
}
