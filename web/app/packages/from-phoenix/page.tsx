import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Phoenix";
const AIRPORT = "PHX";
const URL_PATH = "/packages/from-phoenix";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Mexico, Caribbean, Hawaii | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (${AIRPORT}). Mexico, Caribbean, Hawaii, Europe. Direct flights from Sky Harbor, hotel and transfers included.`,
  keywords: [
    `vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`,
    `${CITY} to Cancun`, `${CITY} to Cabo`, `${CITY} to Puerto Vallarta`,
    `${CITY} to Hawaii`, `Sky Harbor vacation deals`, `cheap vacations from ${CITY}`,
    `luxury packages from ${CITY}`,
  ],
  openGraph: {
    title: `Vacation Packages from ${CITY} | Zeniva`,
    description: `Curated packages from Sky Harbor. Mexico, Caribbean, Hawaii, Europe.`,
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1505765050516-f0c4c3a6f1bb?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY} — Zeniva` }],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromPhoenixPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Sky Harbor (${AIRPORT}) sits closer to Mexico's Pacific coast than any other US gateway. Direct to Cabo, Puerto Vallarta, Hawaii, and the Caribbean. Built by Lina AI.`}
      heroImage="https://images.unsplash.com/photo-1505765050516-f0c4c3a6f1bb?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-amber-900/70 to-orange-900/60"
      badge={`✈️ Direct from Sky Harbor`}
      sections={[
        {
          heading: `Why ${CITY} Has Some of the Cheapest Mexico Flights`,
          content: `<p>${CITY} sits closer to Cabo San Lucas and Puerto Vallarta than any other major US city — barely 2 hours of flight time. American Airlines and Southwest both compete heavily on Mexico routes from Sky Harbor (${AIRPORT}), making fares among the cheapest in the country. Direct flights to Hawaii, the Caribbean, and most major US cities round out the network.</p>
<p>${CITY}'s desert summers drive heavy travel to coastal destinations June through September — Hawaii and California beaches dominate. Winter trends shift to Mexico beach all-inclusive resorts, peak season being January through April.</p>`,
        },
        {
          heading: `Top Destinations from ${CITY}`,
          content: `<p><strong>Cabo San Lucas:</strong> 2-hour direct from PHX. Adults-only at Esperanza, family-friendly at Grand Velas Los Cabos. From $899 per person for 4 nights.</p>
<p><strong>Puerto Vallarta & Riviera Nayarit:</strong> Direct from PHX. Grand Velas, Garza Blanca, Casa Velas. From $899 per person for 4 nights.</p>
<p><strong>Cancún & Riviera Maya:</strong> Direct from PHX. All-inclusive from $899 per person for 4 nights.</p>
<p><strong>Hawaii (Maui, Honolulu):</strong> Direct from PHX. From $1,499 per person for 5 nights.</p>
<p><strong>Caribbean (Punta Cana, Aruba):</strong> Direct from PHX or one-stop. From $1,199 per person for 5 nights.</p>
<p><strong>Europe:</strong> Most European routes from PHX go via DFW, Chicago, or LAX. Best for spring (April–May) and fall (September–October).</p>`,
        },
        {
          heading: "Mexico Pacific Coast — Same Time Zone",
          content: `<p>${CITY} and Mexico's Pacific coast (Cabo, Puerto Vallarta, Mazatlán) are in the same time zone year-round. No jet lag, short flights, and frequent service. ${CITY} is arguably the easiest US city to reach Mexico's Pacific resorts.</p>`,
        },
        {
          heading: "How to Book",
          content: `<p>Chat with Lina or call 24/7 at /call. Every package customizable. Pay 25% to lock the booking; balance in installments via ZeniPay at 0% interest.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: `2 Hours to Mexico`, description: `${CITY} is the closest major US city to Cabo and Puerto Vallarta.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "map", title: "Same Time Zone Mexico", description: "No jet lag for Pacific coast Mexico — perfect for short escapes." },
        { icon: "users", title: "Family or Couples", description: "Adults-only, family resorts, multigenerational villas." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere if anything goes wrong." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cabo, Puerto Vallarta, and Cancún packages start around $899 per person for 4 nights including flights from PHX.` },
        { question: "Are flights to Mexico direct?", answer: "Yes — Cabo, Puerto Vallarta, Cancún, Mexico City all direct from Sky Harbor on American, Southwest, and Mexican carriers." },
        { question: "Are Hawaii flights direct from PHX?", answer: "Yes — direct flights from PHX to Honolulu and Maui on Hawaiian, American, and Southwest." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
        { question: "Can I do multi-city trips?", answer: "Yes — open-jaw routing fully supported." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
        { label: "Cancun Packages", href: "/packages/cancun" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
      ]}
      jsonLd={{
        "@context": "https://schema.org", "@type": "TravelAction",
        name: `Vacation Packages from ${CITY}`,
        description: `All-inclusive and luxury vacation packages departing from ${CITY} (Sky Harbor).`,
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "AZ" } },
      }}
    />
  );
}
