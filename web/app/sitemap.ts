import type { MetadataRoute } from "next";

const BASE_URL = "https://www.zenivatravel.com";
const NOW = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ─── HOMEPAGE ─────────────────────────────────────
    { url: `${BASE_URL}/`, lastModified: NOW, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/fr`, lastModified: NOW, changeFrequency: "daily", priority: 0.95 },

    // ─── MAIN SERVICES ────────────────────────────────
    { url: `${BASE_URL}/chat`, lastModified: NOW, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE_URL}/call`, lastModified: NOW, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE_URL}/fr/chat`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/fr/call`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },

    // ─── AI CONCIERGE ─────────────────────────────────
    { url: `${BASE_URL}/ai-travel-concierge`, lastModified: NOW, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE_URL}/fr/ai-travel-concierge`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/ai-agents`, lastModified: NOW, changeFrequency: "weekly", priority: 0.85 },

    // ─── PACKAGES ─────────────────────────────────────
    { url: `${BASE_URL}/packages`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/all-inclusive`, lastModified: NOW, changeFrequency: "weekly", priority: 0.88 },
    { url: `${BASE_URL}/packages/cancun`, lastModified: NOW, changeFrequency: "weekly", priority: 0.87 },
    { url: `${BASE_URL}/packages/caribbean`, lastModified: NOW, changeFrequency: "weekly", priority: 0.86 },
    { url: `${BASE_URL}/packages/europe`, lastModified: NOW, changeFrequency: "weekly", priority: 0.85 },

    // ─── ZENIYACHT ────────────────────────────────────
    { url: `${BASE_URL}/zeniyacht`, lastModified: NOW, changeFrequency: "weekly", priority: 0.88 },

    // ─── PARTNERS & RESORTS ───────────────────────────
    { url: `${BASE_URL}/partners/resorts`, lastModified: NOW, changeFrequency: "weekly", priority: 0.88 },
    { url: `${BASE_URL}/fr/partners/resorts`, lastModified: NOW, changeFrequency: "weekly", priority: 0.82 },

    // ─── ZENISTAY ─────────────────────────────────────
    { url: `${BASE_URL}/zenistay`, lastModified: NOW, changeFrequency: "weekly", priority: 0.85 },

    // ─── SEARCH ───────────────────────────────────────
    { url: `${BASE_URL}/search/flights`, lastModified: NOW, changeFrequency: "daily", priority: 0.85 },

    // ─── SEO LANDING PAGES ────────────────────────────
    { url: `${BASE_URL}/florida-villas`, lastModified: NOW, changeFrequency: "weekly", priority: 0.92 },
    { url: `${BASE_URL}/ai-travel-agent`, lastModified: NOW, changeFrequency: "weekly", priority: 0.92 },

    // ─── DEALS ────────────────────────────────────────
    { url: `${BASE_URL}/deals`, lastModified: NOW, changeFrequency: "daily", priority: 0.85 },

    // ─── PROPOSALS ────────────────────────────────────
    { url: `${BASE_URL}/proposals`, lastModified: NOW, changeFrequency: "weekly", priority: 0.75 },

    // ─── FORMS ────────────────────────────────────────
    { url: `${BASE_URL}/forms/travel`, lastModified: NOW, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/forms/yacht`, lastModified: NOW, changeFrequency: "monthly", priority: 0.68 },

    // ─── ABOUT ────────────────────────────────────────
    { url: `${BASE_URL}/about`, lastModified: NOW, changeFrequency: "monthly", priority: 0.8 },

    // ─── LEGAL ────────────────────────────────────────
    { url: `${BASE_URL}/privacy-policy`, lastModified: NOW, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/terms`, lastModified: NOW, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/cookie-policy`, lastModified: NOW, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/ai-terms`, lastModified: NOW, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/do-not-sell`, lastModified: NOW, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/data-requests`, lastModified: NOW, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy-agents`, lastModified: NOW, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy-partners`, lastModified: NOW, changeFrequency: "yearly", priority: 0.3 },
  ];
}
