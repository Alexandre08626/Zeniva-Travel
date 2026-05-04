import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "Tokyo"; const AIRPORT = "NRT/HND"; const URL_PATH = "/packages/from-tokyo";
export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (Narita/Haneda) — Asia, USA, Europe | Zeniva`,
  description: `Vacation deals from ${CITY} (NRT, HND). Asia, USA, Europe, Hawaii, Australia. Direct flights from Narita and Haneda, hotel and transfers included.`,
  keywords: [`vacation packages from ${CITY}`, `Narita vacation deals`, `Haneda vacation deals`, `Tokyo to Hawaii`, `Tokyo to USA`, `Tokyo to Bali`, `Japan technology platform`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from Narita and Haneda. Asia, USA, Europe.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1={`Vacation Packages Departing from ${CITY}`} subtitle={`Tokyo has 2 major airports — Narita (NRT) and Haneda (HND). Direct flights to Asia, Hawaii, USA, Europe, Australia. ANA and JAL hubs.`}
    heroImage="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=85" heroGradient="from-rose-900/70 to-blue-900/60" badge={`✈️ NRT + HND`}
    sections={[
      { heading: `Why ${CITY} Is the Best Asian Aviation Hub`, content: `<p>Tokyo's two airports (Narita ~70km from city, Haneda ~14km) form one of the world's busiest hub systems. ANA and JAL are 5-star carriers with extensive global networks. Direct flights from Tokyo reach all of Asia, Hawaii (5h), USA West Coast (10h), Europe (12h), Australia (10h).</p>` },
      { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Hawaii (Honolulu, Maui):</strong> 7-hour direct from NRT/HND. Most popular Tokyo holiday destination. From ¥250,000/person for 5 nights.</p><p><strong>Bali (Denpasar):</strong> Direct from NRT. Resort holidays. From ¥180,000/person for 5 nights.</p><p><strong>Bangkok, Singapore, Hong Kong:</strong> Direct from NRT/HND. From ¥120,000/person for 4 nights.</p><p><strong>USA (Hawaii, LA, NYC, San Francisco):</strong> Direct from NRT/HND. ANA Suite, JAL First. From ¥200,000/person flights.</p><p><strong>Europe (London, Paris, Frankfurt):</strong> Direct from HND. ANA, JAL, Lufthansa. From ¥250,000/person flights.</p><p><strong>Australia (Sydney, Melbourne):</strong> Direct from NRT/HND.</p>` },
      { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Pricing in JPY or USD via ZeniPay. 25% deposit, balance 0% installments.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `NRT + HND`, description: `Two major Tokyo airports — Lina compares for best price.` },
      { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
      { icon: "map", title: "5-star carriers", description: "ANA and JAL — among the world's best premium airlines." },
      { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
    ]}
    faqs={[
      { question: `What's the most popular Tokyo holiday?`, answer: `Hawaii (Honolulu and Maui) — 7-hour direct flight, no jet lag complications, beach + shopping.` },
      { question: "NRT or HND?", answer: "HND is closer to central Tokyo (14km vs 70km). NRT has more international flights. Lina compares both." },
      { question: "Currency?", answer: "JPY or USD via ZeniPay. Payment plans 0% interest." },
      { question: "Best premium-cabin trips?", answer: "ANA Suite (NRT-LA, NRT-Frankfurt) and JAL First (NRT-NYC, HND-London) are world-class." },
      { question: "Cruises from Yokohama?", answer: "Yes — Princess, Holland America, Norwegian sail from Yokohama for Asia + Pacific itineraries." },
    ]}
    ctaText={`See Packages from ${CITY}`} ctaPrompt={`I want a vacation package from ${CITY}`}
    internalLinks={[ { label: "All Packages", href: "/packages" }, { label: "Cruise Planning", href: "/services/cruises" }, { label: "All-Inclusive", href: "/packages/all-inclusive" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (NRT/HND).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "JP" } } }}
  />
); }
