import type { MetadataRoute } from "next";

const COMMON_DISALLOW = [
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
  "/checkout/",
  "/payment/",
  "/profile/",
  // Private investor pitch — never index
  "/pitch",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default rule for all crawlers
      {
        userAgent: "*",
        allow: "/",
        disallow: COMMON_DISALLOW,
      },
      // Search engines
      { userAgent: "Googlebot", allow: "/", disallow: COMMON_DISALLOW },
      { userAgent: "Bingbot", allow: "/", disallow: COMMON_DISALLOW },
      { userAgent: "DuckDuckBot", allow: "/", disallow: COMMON_DISALLOW },
      { userAgent: "YandexBot", allow: "/", disallow: COMMON_DISALLOW },
      // AI search & training crawlers — explicitly welcomed so Zeniva surfaces
      // in ChatGPT, Claude, Perplexity, Copilot, Gemini and other LLM answers
      { userAgent: "GPTBot", allow: "/", disallow: COMMON_DISALLOW },          // OpenAI training
      { userAgent: "ChatGPT-User", allow: "/", disallow: COMMON_DISALLOW },    // ChatGPT browse mode
      { userAgent: "OAI-SearchBot", allow: "/", disallow: COMMON_DISALLOW },   // ChatGPT search
      { userAgent: "ClaudeBot", allow: "/", disallow: COMMON_DISALLOW },       // Anthropic training
      { userAgent: "Claude-Web", allow: "/", disallow: COMMON_DISALLOW },      // Claude browse
      { userAgent: "anthropic-ai", allow: "/", disallow: COMMON_DISALLOW },    // Anthropic legacy
      { userAgent: "PerplexityBot", allow: "/", disallow: COMMON_DISALLOW },   // Perplexity index
      { userAgent: "Perplexity-User", allow: "/", disallow: COMMON_DISALLOW }, // Perplexity browse
      { userAgent: "Google-Extended", allow: "/", disallow: COMMON_DISALLOW }, // Gemini training
      { userAgent: "Applebot", allow: "/", disallow: COMMON_DISALLOW },        // Apple Intelligence
      { userAgent: "Applebot-Extended", allow: "/", disallow: COMMON_DISALLOW },// Apple AI training
      { userAgent: "CCBot", allow: "/", disallow: COMMON_DISALLOW },           // Common Crawl (most LLM training)
      { userAgent: "cohere-ai", allow: "/", disallow: COMMON_DISALLOW },       // Cohere
      { userAgent: "FacebookBot", allow: "/", disallow: COMMON_DISALLOW },     // Meta AI training
      { userAgent: "meta-externalagent", allow: "/", disallow: COMMON_DISALLOW },
      { userAgent: "Bytespider", allow: "/", disallow: COMMON_DISALLOW },      // ByteDance / Doubao
      { userAgent: "Amazonbot", allow: "/", disallow: COMMON_DISALLOW },       // Amazon Alexa+ AI
      { userAgent: "Diffbot", allow: "/", disallow: COMMON_DISALLOW },
      { userAgent: "Timpibot", allow: "/", disallow: COMMON_DISALLOW },
    ],
    sitemap: "https://www.zenivatravel.com/sitemap.xml",
    host: "https://www.zenivatravel.com",
  };
}
