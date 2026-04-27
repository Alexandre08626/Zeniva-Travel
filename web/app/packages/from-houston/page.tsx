import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Houston";
const AIRPORT = "IAH";
const URL_PATH = "/packages/from-houston";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Mexico, Caribbean, Latin America | Zeniva`,
  description: `All-inclusive vacation deals departing from ${CITY}. Mexico, Caribbean, Costa Rica, Belize, South America. Flights, hotel, and transfers included.`,
  keywords: [
    `vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`,
    `${CITY} to Cancun`, `${CITY} to Punta Cana`, `${CITY} to Costa Rica`,
    `${CITY} to Belize`, `${CITY} to Caribbean`, `Hobby Airport vacation deals`,
    `cheap vacations from ${CITY}`, `luxury packages from ${CITY}`,
  ],
  openGraph: {
    title: `Vacation Packages from ${CITY} | Zeniva`,
    description: `Curated packages from IAH and Hobby. Mexico, Caribbean, Latin America.`,
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY} — Zeniva` }],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromHoustonPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`${CITY}'s position on the Gulf Coast makes it the closest major US gateway to Mexico, Central America, and the Caribbean. Direct flights, vetted resorts, and Lina AI customization.`}
      heroImage="https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-orange-900/70 to-stone-900/60"
      badge={`✈️ Direct from ${AIRPORT}`}
      sections={[
        {
          heading: `Why ${CITY} Travelers Have It Easy`,
          content: `<p>${CITY} sits on the Gulf Coast, two hours by air from Mexico, three from most of the Caribbean, four from South America. United Airlines hubs at ${AIRPORT}, giving ${CITY} more direct flights to Latin American capitals than any other US city. Hobby (HOU) handles Southwest's discount routes to Cancún, Cabo, and the Caribbean.</p>
<p>Zeniva's ${CITY} packages take advantage of both airports — we quote whichever delivers the best total price. Year-round warm weather and short flights mean ${CITY} travelers don't have to wait for winter to escape — long weekends to Cancún or Cabo work any month of the year.</p>`,
        },
        {
          heading: `Top Destinations from ${CITY}`,
          content: `<p><strong>Cancún, Cozumel, Riviera Maya:</strong> Two-hour direct flights from ${AIRPORT}. All-inclusive resorts from $799 per person for 4 nights. Iberostar, Excellence, Hard Rock, Palace, Hyatt Ziva.</p>
<p><strong>Cabo San Lucas:</strong> Direct from ${AIRPORT}. Adults-only at Excellence Playa Mujeres or Esperanza Resort; family-friendly at Grand Velas Los Cabos. From $999 per person for 4 nights.</p>
<p><strong>Belize & Costa Rica:</strong> Direct flights to Belize City and San José. Combine 3 nights of rainforest or jungle (Pacuare River, Monteverde) with 4 nights at a Caribbean or Pacific beach resort. From $1,499 per person for 7 nights.</p>
<p><strong>Punta Cana & Caribbean:</strong> Direct flights to Punta Cana, Aruba, Cancún, Cozumel, Nassau. Eastern Caribbean (St. Lucia, Turks and Caicos) typically requires a connection but remains worthwhile for the right resort.</p>
<p><strong>South America (Bogotá, Quito, Lima, Santiago):</strong> ${CITY} is a major gateway to South America. Direct flights to most capitals. Ideal for cultural trips, adventure travel, or extending into Patagonia or the Galápagos.</p>
<p><strong>Hawaii (United direct):</strong> Long flight (8+ hours) but doable as a one-stop. ${CITY}-to-Hawaii works best as 7+ nights to justify the journey.</p>`,
        },
        {
          heading: "IAH vs Hobby — Which to Use",
          content: `<p>${AIRPORT} (Bush Intercontinental) is United Airlines' major hub. It has the most direct flights to international destinations, especially Latin America. Hobby (HOU) is Southwest's hub. For Cancún, Cabo, Punta Cana, and the major Caribbean islands, Hobby/Southwest fares are often cheaper than IAH/United — but no first-class option and limited international coverage.</p>
<p>Lina compares both airports and quotes whichever delivers the best total price. Tell her if you have a preference (e.g., "Hobby only because parking is easier") and she'll filter accordingly.</p>`,
        },
        {
          heading: "How to Book",
          content: `<p>Chat with Lina to get a personalized package in seconds. Voice call 24/7 at /call. Every package customizable — different dates, different resort, room category, transfer type. Pay 25% to lock the booking; balance in installments via ZeniPay at 0% interest.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: `${AIRPORT} & Hobby`, description: `Packages quote whichever ${CITY} airport gives the best total price.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price with no hidden fees." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "map", title: "Latin America Specialists", description: `${CITY}'s United hub gives access to more Latin American destinations than any other US gateway.` },
        { icon: "users", title: "Family or Couples", description: "Adults-only Cabo escapes, family Riviera Maya resorts, multi-gen Caribbean villas — all bookable." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere if anything goes wrong during your trip." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cancún or Cozumel packages start around $799 per person for 4 nights including flights from ${AIRPORT}. Cabo from $999 per person.` },
        { question: "IAH or Hobby — which is cheaper?", answer: "Hobby/Southwest tends to win for Cancún, Cabo, Punta Cana. IAH/United wins on most other Latin American destinations and any premium-cabin booking. Lina compares both." },
        { question: "Are direct flights guaranteed?", answer: `For most ${CITY} departures we use direct flights only. If you need a connection, we'll route through the shortest viable hub.` },
        { question: "Can I do multi-country trips?", answer: "Yes. Belize + Mexico, Costa Rica + Panama, Colombia + Aruba — combinable on a single open-jaw itinerary." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance in installments via ZeniPay at 0% interest." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
        { label: "Cancun Packages", href: "/packages/cancun" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "TravelAction",
        name: `Vacation Packages from ${CITY}`,
        description: `All-inclusive and luxury vacation packages departing from ${CITY} (IAH and Hobby).`,
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "TX" } },
      }}
    />
  );
}
