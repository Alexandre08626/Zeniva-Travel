import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "San Diego";
const AIRPORT = "SAN";
const URL_PATH = "/packages/from-san-diego";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Hawaii, Mexico, Caribbean | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Hawaii, Mexico, Caribbean, Europe. Direct flights from San Diego International, hotel and transfers included.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`, `${CITY} to Hawaii`, `${CITY} to Cabo`, `${CITY} to Cancun`, `cheap vacations from ${CITY}`, `luxury packages from ${CITY}`],
  openGraph: {
    title: `Vacation Packages from ${CITY} | Zeniva`,
    description: `Curated packages from San Diego. Hawaii, Mexico, Caribbean, Europe.`,
    url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1538397473258-d27a26d6f322?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromSanDiegoPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`San Diego International (${AIRPORT}) sits closer to Mexico than any major US city — Cabo is barely 2 hours direct. Hawaii, Caribbean, Europe also direct.`}
      heroImage="https://images.unsplash.com/photo-1538397473258-d27a26d6f322?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-amber-900/70 to-blue-900/60"
      badge={`✈️ Direct from SAN`}
      sections={[
        { heading: `Why ${CITY} Has Some of the Cheapest Mexico Flights`, content: `<p>${CITY} sits at the Mexican border. Cabo San Lucas is 2 hours direct, Puerto Vallarta is 2.5, Cancún is 4.5. Southwest, Alaska, American, and Mexican carriers all compete on these routes — fares are among the cheapest in the country. Direct flights to Hawaii, the Caribbean, and major European capitals round out the network.</p>` },
        { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cabo San Lucas:</strong> 2-hour direct. From $899 per person for 4 nights all-inclusive.</p><p><strong>Puerto Vallarta:</strong> Direct from SAN. From $899 per person.</p><p><strong>Cancún & Riviera Maya:</strong> Direct from SAN. From $999 per person for 4 nights.</p><p><strong>Hawaii (Maui, Honolulu):</strong> Direct year-round from SAN. From $1,499 per person for 5 nights.</p><p><strong>Caribbean (Punta Cana, Aruba):</strong> One-stop from SAN. From $1,299 per person for 5 nights.</p>` },
        { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Every package customizable. Pay 25% to lock; balance via ZeniPay 0% interest.</p>` },
      ]}
      highlights={[
        { icon: "star", title: `2 Hours to Mexico`, description: `${CITY} is the closest major US city to Cabo and Puerto Vallarta.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "map", title: "Same Time Zone Mexico", description: "No jet lag for Pacific coast Mexico." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cabo or Puerto Vallarta packages start around $899 per person for 4 nights including flights from SAN.` },
        { question: "Are flights to Mexico direct?", answer: "Yes — Cabo, Puerto Vallarta, Cancún all direct from San Diego." },
        { question: "Are Hawaii flights direct from SAN?", answer: "Yes — Hawaiian, Alaska, Southwest fly direct from SAN to Honolulu and Maui." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
        { question: "Can I do multi-city trips?", answer: "Yes — open-jaw routing fully supported." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "Cancun Packages", href: "/packages/cancun" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (SAN).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "CA" } } }}
    />
  );
}
