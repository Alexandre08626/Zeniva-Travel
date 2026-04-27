import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Miami";
const AIRPORT = "MIA";
const URL_PATH = "/packages/from-miami";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean & Latin America 2026 | Zeniva`,
  description: `All-inclusive vacation deals departing from ${CITY} (${AIRPORT}). Bahamas, Caribbean, Cancún, Costa Rica, South America. Flights + hotel + transfers included.`,
  keywords: [
    `vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`,
    `${CITY} to Bahamas`, `${CITY} to Caribbean`, `${CITY} to Cancun`,
    `${CITY} to Punta Cana`, `${CITY} to Aruba`, `${CITY} to Turks and Caicos`,
    `cruise from ${CITY}`, `cheap vacations from ${CITY}`, `luxury packages from ${CITY}`,
  ],
  openGraph: {
    title: `Vacation Packages from ${CITY} (${AIRPORT}) | Zeniva`,
    description: `Curated all-inclusive and luxury packages from MIA. Bahamas, Caribbean, Latin America.`,
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY} — Zeniva` }],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromMiamiPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`The shortest flights to the Caribbean and Latin America come from ${AIRPORT}. Hand-picked all-inclusive and luxury packages with flights, hotel, and transfers included.`}
      heroImage="https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-cyan-900/70 to-blue-900/60"
      badge={`✈️ Direct from ${AIRPORT}`}
      sections={[
        {
          heading: `Why ${CITY} Is the Best US City to Fly From`,
          content: `<p>${CITY} sits closer to Caribbean and Latin American destinations than any other major US gateway. From ${AIRPORT}, the Bahamas is 35 minutes, Havana is one hour, San Juan is two and a half. Cancún, Punta Cana, Aruba, Turks and Caicos, Costa Rica, Bogotá, Panama City, Lima — all within a four-hour direct flight.</p>
<p>Zeniva's ${CITY} packages take advantage of this proximity. Most include direct flights — no painful connection in Charlotte or Atlanta. Many destinations are short enough to leave Friday morning and be back Sunday night, making ${CITY} ideal for long-weekend escapes as well as full weeks.</p>`,
        },
        {
          heading: `Top Destinations from ${CITY}`,
          content: `<p><strong>Bahamas (Nassau, Exuma, Eleuthera):</strong> Quickest international beach trip from the US. Atlantis Paradise Island, Baha Mar, and the smaller boutique resorts on Harbour Island all bookable as packages. From $1,200 per person for 3 nights.</p>
<p><strong>Cancún & Riviera Maya:</strong> ${CITY}'s most popular package destination. All-inclusive resorts from $899 per person for 4 nights including flights from ${AIRPORT}. Excellence Riviera Cancun, Iberostar Grand, Hard Rock, Palace Resorts.</p>
<p><strong>Punta Cana, Dominican Republic:</strong> Direct flight from ${AIRPORT}. Couples-only at Sanctuary Cap Cana, family-friendly at Hard Rock Punta Cana, ultra-luxury at Tortuga Bay. From $999 per person for 5 nights.</p>
<p><strong>Aruba & Turks and Caicos:</strong> Calmer beaches than Cancún, often paired with longer stays. Beaches Turks and Caicos for families; Sandals Royal Caribbean for couples. From $1,800 per person for 5 nights.</p>
<p><strong>Costa Rica & Belize:</strong> For travelers who want adventure plus beach. Direct from ${AIRPORT} to San José or Liberia. Combine 3 nights in the rainforest with 4 nights at a Pacific or Caribbean beach resort.</p>
<p><strong>South America (Cartagena, Lima, Buenos Aires):</strong> ${CITY} is the gateway. Most South American capitals are direct from ${AIRPORT}. Ideal for cultural trips, food tours, or extending into Patagonia or the Galápagos.</p>`,
        },
        {
          heading: "Cruises Departing from Miami",
          content: `<p>${CITY} is the world's largest cruise port. Royal Caribbean, Carnival, Norwegian, MSC, Disney, Virgin Voyages — all sail from PortMiami. Zeniva's cruise team books across every line, with negotiated group rates and onboard credits. Most ${CITY}-departure cruises hit the Bahamas, Eastern Caribbean, or Western Caribbean. We also book pre-cruise hotels and transfers from ${AIRPORT} to the port.</p>`,
        },
        {
          heading: "How to Book and Customize",
          content: `<p>Chat with Lina to get a personalized package in seconds. Voice call available 24/7 at /call. Or browse any of our curated packages and customize the dates, group size, and resort. Every booking includes 24/7 in-trip support — if anything goes wrong during your trip, we handle it.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: `Direct from ${AIRPORT}`, description: `${CITY}'s position makes the Caribbean and Latin America one direct flight away.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price with no hidden fees." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — get a personalized package in seconds." },
        { icon: "anchor", title: "Cruises from PortMiami", description: "Every major line, with negotiated group rates and onboard credits." },
        { icon: "users", title: "Multi-City Trips", description: "Cartagena + Aruba, Costa Rica + Belize, Bahamas + Cuba — combinable on one itinerary." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere if your flight gets canceled or your room is wrong." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `Bahamas weekend packages start around $999 per person for 3 nights including flights. All-inclusive Cancún packages start at $899 per person for 4 nights.` },
        { question: `What about cruises from ${CITY}?`, answer: `Yes — Zeniva books every major line sailing from PortMiami: Royal Caribbean, Carnival, Norwegian, MSC, Disney, Virgin Voyages. We negotiate group rates and onboard credit and handle pre-cruise hotels and transfers.` },
        { question: "Can I customize dates and resort?", answer: "Yes. Every package is fully customizable — Lina prices live for any dates and any resort in our network or one you request." },
        { question: "Are direct flights guaranteed?", answer: `For most ${CITY} departures we use direct flights only. If you need a connection (e.g., to reach a destination ${CITY} doesn't serve directly), we'll route through the shortest viable hub.` },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance in installments via ZeniPay at 0% interest." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
        { label: "Cruise Planning", href: "/services/cruises" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "TravelAction",
        name: `Vacation Packages from ${CITY}`,
        description: `All-inclusive and luxury vacation packages departing from ${CITY} (${AIRPORT}).`,
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "FL" } },
      }}
    />
  );
}
