import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "Amsterdam"; const AIRPORT = "AMS"; const URL_PATH = "/packages/from-amsterdam";
export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, USA, Asia | Zeniva`,
  description: `Vacation deals from ${CITY} (${AIRPORT}). Caribbean, USA, Asia, Africa. KLM hub with direct flights to virtually any global destination from Schiphol.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `Schiphol vacation deals`, `Amsterdam to Caribbean`, `Amsterdam to USA`, `Holland travel`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from Schiphol. Caribbean, USA, Asia, Africa.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1518132006-2b67d61d61c4?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1={`Vacation Packages Departing from ${CITY}`} subtitle={`Amsterdam Schiphol (${AIRPORT}) is KLM's hub and one of Europe's busiest international airports. Direct flights to virtually any global destination — including the Dutch Caribbean (Aruba, Curaçao, Bonaire).`}
    heroImage="https://images.unsplash.com/photo-1518132006-2b67d61d61c4?auto=format&fit=crop&w=1600&q=85" heroGradient="from-orange-900/70 to-blue-900/60" badge={`✈️ KLM Hub`}
    sections={[
      { heading: `Why ${CITY} Has Excellent Global Reach`, content: `<p>Amsterdam Schiphol (${AIRPORT}) is KLM's main hub and one of Europe's busiest international airports. KLM + partners (Air France, Delta) cover virtually every global destination directly. Schiphol is also a major leisure travel airport with many charter and budget operators (Transavia, Corendon, TUI fly).</p>` },
      { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Dutch Caribbean (Aruba, Curaçao, Bonaire, St Maarten):</strong> Direct from AMS on KLM. Top Dutch holiday destinations. From €1,800/person for 7 nights all-inclusive.</p><p><strong>Cancún & Riviera Maya:</strong> Direct from AMS on KLM, Transavia. From €1,500/person for 7 nights.</p><p><strong>USA (NYC, Miami, LA, San Francisco):</strong> Direct on KLM/Delta. From €700/person flights.</p><p><strong>Maldives, Indonesia (Bali), Thailand:</strong> Direct from AMS or one-stop. From €2,500/person.</p><p><strong>Africa (South Africa, Kenya, Tanzania):</strong> Direct on KLM. Safari + beach combos. From €2,800/person.</p><p><strong>Asia (Tokyo, Hong Kong, Singapore):</strong> Direct from AMS on KLM and partners.</p>` },
      { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Pricing in EUR via ZeniPay. 25% deposit, balance 0% installments.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Direct from AMS`, description: `KLM hub — direct to Caribbean, USA, Asia, Africa.` },
      { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
      { icon: "map", title: "Dutch Caribbean direct", description: "Aruba, Curaçao, Bonaire — direct from AMS, popular Dutch holidays." },
      { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
    ]}
    faqs={[
      { question: `What's the most popular Dutch holiday?`, answer: `Aruba and Curaçao (Dutch Caribbean) — direct from AMS, no language barrier, EUR widely accepted.` },
      { question: "KLM, Transavia, or Corendon?", answer: "KLM for premium long-haul. Transavia for European low-cost. Corendon for Mediterranean charter holidays. Lina compares all." },
      { question: "Currency?", answer: "EUR via ZeniPay. Payment plans 0% interest." },
      { question: "Best Africa direct?", answer: "Amsterdam to Cape Town, Nairobi, Dar es Salaam — KLM has the strongest European-African direct network." },
      { question: "Connections via AMS?", answer: "Schiphol is excellent for one-stop routings — to Asia via AMS often cheaper than direct." },
    ]}
    ctaText={`See Packages from ${CITY}`} ctaPrompt={`I want a vacation package from ${CITY}`}
    internalLinks={[ { label: "All Packages", href: "/packages" }, { label: "Caribbean Destinations", href: "/destinations/caribbean" }, { label: "Cruise Planning", href: "/services/cruises" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (Schiphol).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "NL" } } }}
  />
); }
