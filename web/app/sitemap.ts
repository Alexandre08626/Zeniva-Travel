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

    // ─── DEPARTURE-CITY PACKAGES (USA) ───────────────
    { url: `${BASE_URL}/packages/from-los-angeles`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-miami`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-chicago`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-houston`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-boston`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-dallas`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-atlanta`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-seattle`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-denver`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-phoenix`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-philadelphia`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-san-francisco`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-san-diego`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-tampa`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-las-vegas`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-washington-dc`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-orlando`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-charlotte`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-nashville`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-detroit`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-minneapolis`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },

    // ─── DEPARTURE-CITY PACKAGES (CANADA) ────────────
    { url: `${BASE_URL}/packages/from-toronto`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-vancouver`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-montreal`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-calgary`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-ottawa`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-quebec-city`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-edmonton`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-halifax`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-winnipeg`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages/from-hamilton`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },

    // ─── ZENIYACHT ────────────────────────────────────
    { url: `${BASE_URL}/zeniyacht`, lastModified: NOW, changeFrequency: "weekly", priority: 0.88 },

    // ─── PARTNERS & RESORTS ───────────────────────────
    { url: `${BASE_URL}/partners/resorts`, lastModified: NOW, changeFrequency: "weekly", priority: 0.88 },
    { url: `${BASE_URL}/fr/partners/resorts`, lastModified: NOW, changeFrequency: "weekly", priority: 0.82 },
    { url: `${BASE_URL}/fr/yachts`, lastModified: NOW, changeFrequency: "weekly", priority: 0.82 },
    { url: `${BASE_URL}/fr/proposals`, lastModified: NOW, changeFrequency: "weekly", priority: 0.7 },

    // ─── ZENISTAY ─────────────────────────────────────
    { url: `${BASE_URL}/zenistay`, lastModified: NOW, changeFrequency: "weekly", priority: 0.85 },

    // ─── SEARCH ───────────────────────────────────────
    { url: `${BASE_URL}/search/flights`, lastModified: NOW, changeFrequency: "daily", priority: 0.85 },

    // ─── SEO LANDING PAGES ────────────────────────────
    { url: `${BASE_URL}/florida-villas`, lastModified: NOW, changeFrequency: "weekly", priority: 0.92 },
    { url: `${BASE_URL}/ai-travel-agent`, lastModified: NOW, changeFrequency: "weekly", priority: 0.92 },

    // ─── SEO DESTINATION PAGES ───────────────────────
    { url: `${BASE_URL}/destinations/mexico`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/destinations/bora-bora`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/destinations/caribbean`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/destinations/europe`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/destinations/cancun`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/destinations/punta-cana`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },

    // ─── SEO SERVICE PAGES ───────────────────────────
    { url: `${BASE_URL}/services/ai-travel-agent`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/services/luxury-travel`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/services/group-travel`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/services/honeymoon`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/services/yacht-charter`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/services/villa-rental`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/services/cruises`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/services/destination-weddings`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },

    // ─── FR SERVICE PAGES ────────────────────────────
    { url: `${BASE_URL}/fr/services/yacht-charter`, lastModified: NOW, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/fr/services/villa-rental`, lastModified: NOW, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/fr/services/cruises`, lastModified: NOW, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/fr/services/destination-weddings`, lastModified: NOW, changeFrequency: "weekly", priority: 0.85 },

    // ─── BLOG ────────────────────────────────────────
    { url: `${BASE_URL}/blog`, lastModified: NOW, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/blog/best-all-inclusive-mexico-2026`, lastModified: NOW, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/blog/ai-changing-travel-industry`, lastModified: NOW, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/blog/top-honeymoon-destinations-2026`, lastModified: NOW, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/blog/caribbean-vs-mexico-all-inclusive`, lastModified: NOW, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/blog/why-book-ai-travel-agent`, lastModified: NOW, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/blog/best-ai-travel-agents-usa-2026`, lastModified: NOW, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/blog/yacht-charter-cost-2026`, lastModified: NOW, changeFrequency: "monthly", priority: 0.82 },
    { url: `${BASE_URL}/blog/cancun-vs-punta-cana-2026`, lastModified: NOW, changeFrequency: "monthly", priority: 0.85 },

    // ─── COMPARISON PAGES (AI search-optimized) ─────
    { url: `${BASE_URL}/compare/zeniva-vs-layla`, lastModified: NOW, changeFrequency: "monthly", priority: 0.88 },
    { url: `${BASE_URL}/compare/zeniva-vs-mindtrip`, lastModified: NOW, changeFrequency: "monthly", priority: 0.88 },
    { url: `${BASE_URL}/compare/zeniva-vs-booked-ai`, lastModified: NOW, changeFrequency: "monthly", priority: 0.88 },
    { url: `${BASE_URL}/compare/zeniva-vs-zenvoya`, lastModified: NOW, changeFrequency: "monthly", priority: 0.88 },
    { url: `${BASE_URL}/compare/zeniva-vs-penny`, lastModified: NOW, changeFrequency: "monthly", priority: 0.88 },
    { url: `${BASE_URL}/compare/zeniva-vs-eddy-travels`, lastModified: NOW, changeFrequency: "monthly", priority: 0.88 },
    { url: `${BASE_URL}/compare/zeniva-vs-acai-travel`, lastModified: NOW, changeFrequency: "monthly", priority: 0.88 },
    { url: `${BASE_URL}/compare/zeniva-vs-wonderplan`, lastModified: NOW, changeFrequency: "monthly", priority: 0.88 },
    { url: `${BASE_URL}/compare/zeniva-vs-chatgpt-for-travel`, lastModified: NOW, changeFrequency: "monthly", priority: 0.88 },

    // ─── ES (Spanish — LATAM market) ─────────────────
    { url: `${BASE_URL}/es`, lastModified: NOW, changeFrequency: "weekly", priority: 0.92 },
    { url: `${BASE_URL}/es/services/ai-travel-agent`, lastModified: NOW, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/es/services/luxury-travel`, lastModified: NOW, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/es/services/yacht-charter`, lastModified: NOW, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/es/services/cruises`, lastModified: NOW, changeFrequency: "weekly", priority: 0.85 },

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
