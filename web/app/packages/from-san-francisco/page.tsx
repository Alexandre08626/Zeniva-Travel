import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "San Francisco";
const AIRPORT = "SFO";
const URL_PATH = "/packages/from-san-francisco";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Hawaii, Asia, Mexico | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Hawaii, Asia, Mexico, Tahiti, Europe. Direct flights from SFO, hotel and transfers included.`,
  keywords: [
    `vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`,
    `${CITY} to Hawaii`, `${CITY} to Tokyo`, `${CITY} to Cabo`,
    `${CITY} to Tahiti`, `Bay Area vacation deals`, `cheap vacations from ${CITY}`,
    `luxury packages from ${CITY}`,
  ],
  openGraph: {
    title: `Vacation Packages from ${CITY} | Zeniva`,
    description: `Curated packages from SFO. Hawaii, Asia, Mexico, Tahiti, Europe.`,
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel", type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY} — Zeniva` }],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromSanFranciscoPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`SFO is the West Coast's gateway to Hawaii, Asia, and Tahiti. Direct flights to all major Hawaiian islands, Tokyo, Hong Kong, and most of Mexico's Pacific coast. Built by Lina AI.`}
      heroImage="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-orange-900/70 to-red-900/60"
      badge={`✈️ Direct from SFO`}
      sections={[
        { heading: `Why ${CITY} Is the Pacific Travel Capital`, content: `<p>San Francisco International (${AIRPORT}) is United Airlines' major hub on the West Coast. Direct flights from SFO reach all major Hawaiian islands (5 hours), Tokyo and Seoul (10-11 hours), Sydney (15 hours), Tahiti, and Mexico's Pacific resorts. The Bay Area's tech crowd drives heavy travel volume to Asia, Hawaii, and Europe year-round.</p><p>Zeniva's ${CITY} packages take advantage of SFO's extensive direct network. Most popular destinations are direct flights with no connection required.</p>` },
        { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Hawaii (Maui, Honolulu, Big Island, Kauai):</strong> 5-hour direct from SFO. Wailea, Kaanapali, Ko Olina. From $1,499 per person for 5 nights.</p><p><strong>Cabo & Puerto Vallarta:</strong> Direct from SFO year-round. Excellence Playa Mujeres, Esperanza, Grand Velas. From $1,099 per person for 4 nights.</p><p><strong>Tahiti & Bora Bora:</strong> Direct from SFO via Air Tahiti Nui. Overwater bungalows from $5,500 per person for 7 nights.</p><p><strong>Tokyo, Seoul, Hong Kong:</strong> Direct from SFO. Asia is faster from ${CITY} than any East Coast city.</p><p><strong>Cancún & Caribbean:</strong> Direct or one-stop from SFO. From $1,199 per person for 4 nights.</p><p><strong>Europe (London, Paris, Frankfurt, Amsterdam):</strong> Direct overnight flights from SFO. Best in spring/fall.</p>` },
        { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Every package customizable. Pay 25% to lock the booking; balance via ZeniPay 0% interest.</p>` },
      ]}
      highlights={[
        { icon: "star", title: `Direct from SFO`, description: `United's West Coast hub — direct flights to Hawaii, Asia, Tahiti, Europe, Mexico.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "map", title: "Asia Specialists", description: "SFO is the fastest US gateway to Tokyo, Seoul, Hong Kong." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere if anything goes wrong." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cabo or Puerto Vallarta packages start around $1,099 per person for 4 nights including flights from SFO.` },
        { question: "Are Hawaii flights direct from SFO?", answer: "Yes — Hawaiian, United, Alaska, Southwest all fly direct to all major Hawaiian islands year-round." },
        { question: "What's the fastest US-Asia route?", answer: `SFO to Tokyo direct is one of the shortest US-Asia direct flights — about 10 hours.` },
        { question: "Can you book Tahiti from SFO?", answer: "Yes — Air Tahiti Nui flies direct from SFO. Bora Bora overwater bungalows bookable as packages." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "Bora Bora", href: "/destinations/bora-bora" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (SFO).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "CA" } } }}
    />
  );
}
