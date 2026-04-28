import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "Dubai"; const AIRPORT = "DXB"; const URL_PATH = "/packages/from-dubai";
export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Maldives, Europe, USA | Zeniva`,
  description: `Vacation deals from ${CITY} (${AIRPORT}). Maldives, Seychelles, Europe, USA, Asia. Emirates hub with direct flights to virtually any destination.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `Dubai to Maldives`, `Dubai to Europe`, `Dubai to USA`, `Emirates packages`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from DXB. Maldives, Europe, USA, Asia.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1={`Vacation Packages Departing from ${CITY}`} subtitle={`Dubai International (${AIRPORT}) is Emirates' main hub and the world's busiest international airport. Direct flights to virtually every global destination including premium A380 service.`}
    heroImage="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=85" heroGradient="from-amber-900/70 to-rose-900/60" badge={`✈️ Emirates Hub`}
    sections={[
      { heading: `Why ${CITY} Connects to Everywhere`, content: `<p>Dubai International (${AIRPORT}) is the world's busiest airport for international passengers. Emirates flies to 150+ destinations directly — Maldives (4h), Seychelles, all of Europe, USA (NYC, LAX, Chicago), all of Asia, Africa. UAE's geographic position makes it the ideal stopover hub.</p>` },
      { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Maldives, Seychelles:</strong> 4-hour direct from DXB. Overwater bungalows. From AED 8,000/person for 5 nights.</p><p><strong>Bali, Phuket, Bangkok:</strong> Direct from DXB. From AED 5,000/person for 5 nights.</p><p><strong>Europe (London, Paris, Rome, Munich, Madrid, Athens):</strong> Direct on Emirates A380. Premium beats almost everywhere. From AED 6,000/person.</p><p><strong>USA (NYC, LA, Chicago, Miami):</strong> Direct from DXB. From AED 8,000/person for flights.</p><p><strong>African destinations (Cape Town, Mauritius, Zanzibar):</strong> Direct or one-stop from DXB.</p>` },
      { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Pricing in AED or USD via ZeniPay. 25% deposit, balance 0% installments.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Direct from DXB`, description: `Emirates hub — direct to 150+ destinations including A380 premium.` },
      { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
      { icon: "map", title: "Maldives 4 hours", description: "Closest premium beach destination from Dubai." },
      { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
    ]}
    faqs={[
      { question: `What's the most popular Dubai holiday?`, answer: `Maldives (4-hour direct, overwater bungalows) and European city breaks.` },
      { question: "Emirates First Class?", answer: "Emirates First Class on A380 (DXB-LHR, DXB-NYC) is among the world's best — private suites, on-board shower." },
      { question: "Currency?", answer: "AED or USD via ZeniPay. Payment plans 0% interest." },
      { question: "Best Africa direct?", answer: "Dubai to Cape Town, Mauritius, Zanzibar all direct on Emirates." },
      { question: "Stopover packages?", answer: "Many travelers add a Dubai stopover when flying through DXB. Lina coordinates 1-3 night Dubai extensions." },
    ]}
    ctaText={`See Packages from ${CITY}`} ctaPrompt={`I want a vacation package from ${CITY}`}
    internalLinks={[ { label: "All Packages", href: "/packages" }, { label: "Luxury Travel", href: "/services/luxury-travel" }, { label: "Yacht Charter", href: "/services/yacht-charter" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (DXB).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "AE" } } }}
  />
); }
