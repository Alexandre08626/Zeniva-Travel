import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Vancouver";
const AIRPORT = "YVR";
const URL_PATH = "/packages/from-vancouver";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Hawaii, Mexico, Asia | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Hawaii, Mexico, Asia, Alaska cruises. Direct flights from YVR, hotel and transfers included. CAD pricing.`,
  keywords: [
    `vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`,
    `${CITY} to Hawaii`, `${CITY} to Mexico`, `${CITY} to Tokyo`,
    `${CITY} Alaska cruise`, `cheap vacations from ${CITY}`, `luxury packages from ${CITY}`,
    `Vancouver travel agent`,
  ],
  openGraph: {
    title: `Vacation Packages from ${CITY} | Zeniva`,
    description: `Curated packages from YVR. Hawaii, Mexico, Asia, Alaska cruises.`,
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY} — Zeniva` }],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromVancouverPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`YVR is Canada's gateway to the Pacific. Direct flights to Hawaii, Tokyo, Hong Kong, Mexico's Pacific coast. Alaska cruise homeport. Built by Lina AI in CAD.`}
      heroImage="https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-emerald-900/70 to-blue-900/60"
      badge={`✈️ Direct from YVR`}
      sections={[
        {
          heading: `Why ${CITY} Is the Pacific Gateway`,
          content: `<p>Vancouver International (${AIRPORT}) is Canada's third-busiest airport and the country's main Pacific gateway. Direct flights to Honolulu, Maui, Tokyo, Hong Kong, Seoul, Sydney, and most of Mexico's Pacific coast. ${CITY} is also the secondary US/Canada homeport for Alaska cruises (after Seattle).</p>
<p>Zeniva's ${CITY} packages quote in CAD and use Canadian-friendly partners — Air Canada, WestJet, Sunwing, Transat. Direct flights are the default for almost all popular destinations.</p>`,
        },
        {
          heading: `Top Destinations from ${CITY}`,
          content: `<p><strong>Hawaii (Maui, Honolulu, Big Island):</strong> 6-hour direct from YVR. Wailea, Kaanapali, Ko Olina. From CAD $1,799 per person for 5 nights.</p>
<p><strong>Cabo & Puerto Vallarta:</strong> Direct from YVR. Excellence Playa Mujeres, Esperanza, Grand Velas. From CAD $1,199 per person for 4 nights.</p>
<p><strong>Cancún & Riviera Maya:</strong> Direct from YVR. From CAD $1,099 per person for 4 nights.</p>
<p><strong>Punta Cana & Caribbean:</strong> Most Caribbean destinations require a connection, but Cuba (Varadero, Cayo Coco) is direct on Sunwing. From CAD $1,199 per person for 5 nights.</p>
<p><strong>Tokyo & Asia:</strong> Direct from YVR to Tokyo, Hong Kong, Seoul. ${CITY} is one of the fastest North American gateways to Asia.</p>
<p><strong>Alaska Cruises:</strong> May–September. Princess, Holland America, Norwegian sail from Vancouver's Canada Place. 7-night Inside Passage cruises from CAD $1,099 per person.</p>`,
        },
        {
          heading: "Asia & Alaska Cruises",
          content: `<p>YVR's position on the Pacific Rim makes Asia significantly faster than from any East Coast Canadian city. Tokyo direct in 10 hours. Hong Kong in 13. Sydney in 15. For Alaska cruises, Vancouver is a homeport for Princess, Holland America, Norwegian, Royal Caribbean — most 7-night sailings depart from Canada Place. Zeniva books pre-cruise hotels and transfers from YVR.</p>`,
        },
        {
          heading: "How to Book",
          content: `<p>Chat with Lina or call 24/7 at /call. Every package customizable. ZeniPay accepts payment plans in CAD at 0% interest.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: `Direct from YVR`, description: `Hawaii in 6h, Tokyo in 10h. Pacific gateway.` },
        { icon: "anchor", title: "Alaska Cruises May–Sept", description: "Princess, Holland America, Norwegian — all sail from Vancouver." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds. Bilingual EN/FR." },
        { icon: "map", title: "Asia Specialists", description: `${CITY} is the fastest North American gateway to Asia.` },
        { icon: "gift", title: "CAD Pricing", description: "All packages quoted in Canadian dollars with no FX surprises." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere if anything goes wrong." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cancún packages start around CAD $1,099 per person for 4 nights including flights from YVR. Alaska cruises from CAD $1,099 per person for 7 nights.` },
        { question: "Can you book Alaska cruises from YVR?", answer: "Yes — every major cruise line that homeports in Vancouver. Pre-cruise hotels and transfers from YVR included on the same itinerary." },
        { question: "What's the fastest Canada-to-Asia route?", answer: "YVR to Tokyo direct is one of the shortest North America-Asia direct flights — about 10 hours." },
        { question: "Are Hawaii flights direct from YVR?", answer: "Yes — Air Canada and WestJet fly direct from YVR to Honolulu and Maui year-round." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest, in CAD." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "Cruise Planning", href: "/services/cruises" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
        { label: "Bora Bora", href: "/destinations/bora-bora" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
      ]}
      jsonLd={{
        "@context": "https://schema.org", "@type": "TravelAction",
        name: `Vacation Packages from ${CITY}`,
        description: `All-inclusive and luxury vacation packages departing from ${CITY} (YVR).`,
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "CA", addressRegion: "BC" } },
      }}
    />
  );
}
