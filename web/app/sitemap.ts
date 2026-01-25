import type { MetadataRoute } from "next";

const BASE_URL = "https://www.zenivatravel.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${BASE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          "en-CA": `${BASE_URL}/`,
          "fr-CA": `${BASE_URL}/fr`,
        },
      },
    },
    {
      url: `${BASE_URL}/ai-travel-concierge`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          "en-CA": `${BASE_URL}/ai-travel-concierge`,
          "fr-CA": `${BASE_URL}/fr/ai-travel-concierge`,
        },
      },
    },
    {
      url: `${BASE_URL}/fr`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          "en-CA": `${BASE_URL}/`,
          "fr-CA": `${BASE_URL}/fr`,
        },
      },
    },
    {
      url: `${BASE_URL}/yachts`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          "en-CA": `${BASE_URL}/yachts`,
          "fr-CA": `${BASE_URL}/fr/yachts`,
        },
      },
    },
    {
      url: `${BASE_URL}/fr/yachts`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          "en-CA": `${BASE_URL}/yachts`,
          "fr-CA": `${BASE_URL}/fr/yachts`,
        },
      },
    },
    {
      url: `${BASE_URL}/partners/resorts`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          "en-CA": `${BASE_URL}/partners/resorts`,
          "fr-CA": `${BASE_URL}/fr/partners/resorts`,
        },
      },
    },
    {
      url: `${BASE_URL}/fr/partners/resorts`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          "en-CA": `${BASE_URL}/partners/resorts`,
          "fr-CA": `${BASE_URL}/fr/partners/resorts`,
        },
      },
    },
    {
      url: `${BASE_URL}/chat`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          "en-CA": `${BASE_URL}/chat`,
          "fr-CA": `${BASE_URL}/fr/chat`,
        },
      },
    },
    {
      url: `${BASE_URL}/fr/chat`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          "en-CA": `${BASE_URL}/chat`,
          "fr-CA": `${BASE_URL}/fr/chat`,
        },
      },
    },
    {
      url: `${BASE_URL}/call`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          "en-CA": `${BASE_URL}/call`,
          "fr-CA": `${BASE_URL}/fr/call`,
        },
      },
    },
    {
      url: `${BASE_URL}/fr/call`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          "en-CA": `${BASE_URL}/call`,
          "fr-CA": `${BASE_URL}/fr/call`,
        },
      },
    },
    {
      url: `${BASE_URL}/proposals`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: {
        languages: {
          "en-CA": `${BASE_URL}/proposals`,
          "fr-CA": `${BASE_URL}/fr/proposals`,
        },
      },
    },
    {
      url: `${BASE_URL}/fr/proposals`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: {
        languages: {
          "en-CA": `${BASE_URL}/proposals`,
          "fr-CA": `${BASE_URL}/fr/proposals`,
        },
      },
    },
    {
      url: `${BASE_URL}/fr/ai-travel-concierge`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          "en-CA": `${BASE_URL}/ai-travel-concierge`,
          "fr-CA": `${BASE_URL}/fr/ai-travel-concierge`,
        },
      },
    },
  ];
}