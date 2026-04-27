import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Boston";
const AIRPORT = "BOS";
const URL_PATH = "/packages/from-boston";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Europe, Bermuda | Zeniva`,
  description: `All-inclusive vacation deals departing from ${CITY} (${AIRPORT}). Caribbean, Bermuda, Europe, Iceland. Direct flights, hotel, and transfers included.`,
  keywords: [
    `vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`,
    `${CITY} to Caribbean`, `${CITY} to Bermuda`, `${CITY} to Europe`,
    `${CITY} to Cancun`, `${CITY} to Punta Cana`, `${CITY} to Iceland`,
    `cheap vacations from ${CITY}`, `luxury packages from ${CITY}`,
  ],
  openGraph: {
    title: `Vacation Packages from ${CITY} | Zeniva`,
    description: `Curated packages from BOS. Caribbean, Bermuda, Europe, Iceland.`,
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1572979656499-c2c1cd5fa1d7?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY} — Zeniva` }],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromBostonPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`From Logan (${AIRPORT}), the Caribbean, Bermuda, and most of Europe are direct flights. Lina AI builds your package with flights, hotel, and transfers in seconds.`}
      heroImage="https://images.unsplash.com/photo-1572979656499-c2c1cd5fa1d7?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-emerald-900/70 to-blue-900/60"
      badge={`✈️ Direct from Logan`}
      sections={[
        {
          heading: `Why ${CITY} Punches Above Its Weight`,
          content: `<p>${CITY}'s Logan Airport (${AIRPORT}) has more direct international flights than any US airport its size. Bermuda is two hours direct, Iceland is five, Dublin and Lisbon are six, the rest of Europe is seven to nine. The Caribbean is a quick three to four. JetBlue, American, Delta, United, and a long list of European carriers all serve Logan.</p>
<p>Zeniva's ${CITY} packages take advantage of all these direct routes — most include direct flights from BOS without forcing you through JFK or Charlotte. ${CITY}'s long winters and intense summers mean travelers escape often, both for cold-weather beach trips (December–March) and cool-weather cultural trips to Europe (April–June, September–October).</p>`,
        },
        {
          heading: `Top Destinations from ${CITY}`,
          content: `<p><strong>Bermuda:</strong> Two-hour direct flight, no passport-stamping hassle (technically a UK overseas territory but treated as a quick getaway). Pink-sand beaches, the Hamilton Princess, and boutique hotels along the south shore. From $1,499 per person for 4 nights.</p>
<p><strong>Caribbean (Cancún, Punta Cana, Aruba, Turks and Caicos, St. Lucia, Antigua):</strong> Direct or one-stop from BOS. All-inclusive packages from $1,099 per person for 4 nights. Couples skew toward Sandals St. Lucia or Sanctuary Cap Cana; families toward Beaches Turks and Caicos or Hard Rock Punta Cana.</p>
<p><strong>Europe (Italy, France, Spain, Portugal, UK, Ireland, Iceland):</strong> ${CITY}'s strongest international category. Direct flights to London, Dublin, Paris, Rome, Madrid, Lisbon, Reykjavík, Frankfurt. Best for spring (April–May) and fall (September–October).</p>
<p><strong>Iceland:</strong> Five hours direct on Icelandair. Stopover programs let you spend 3–7 nights in Iceland on the way to mainland Europe at no additional flight cost. Aurora viewing November–March, midnight sun May–August.</p>
<p><strong>Mexico (Cabo, Mexico City):</strong> Direct from BOS. Cabo for adults-only beach escapes; Mexico City for food, culture, and pyramids day trips.</p>
<p><strong>Cruises from ${CITY}:</strong> BOS is a homeport for Norwegian, Royal Caribbean, and Holland America cruises to Bermuda, the Caribbean, and Canada/New England. Zeniva books all of them.</p>`,
        },
        {
          heading: "Europe Routing from BOS",
          content: `<p>${CITY}'s European connections are dense. Direct overnight flights mean you arrive in Europe in the morning and have a full day before jet lag hits — much more efficient than connecting through JFK. For multi-city European trips, we recommend open-jaw routing: fly into one city, out of another, with rail or short flights between.</p>
<p>Iceland Stopover programs (free 3–7 night layover in Reykjavík on the way to mainland Europe) let you essentially get two trips for one fare. Lina knows the rules for each carrier and will route you efficiently.</p>`,
        },
        {
          heading: "How to Book",
          content: `<p>Chat with Lina or call 24/7 at /call. Every package customizable. Pay 25% to lock the booking; balance in installments via ZeniPay at 0% interest. Trip insurance available at 6–10% of the total — we strongly recommend it for international trips.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: `Direct from Logan`, description: `BOS has more international direct flights than any US airport its size.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "map", title: "Europe Specialists", description: "Direct flights to all major European capitals — no JFK connection required." },
        { icon: "anchor", title: "Cruises from BOS", description: "Bermuda, Caribbean, and Canada/New England cruises out of the Black Falcon Terminal." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere if anything goes wrong during your trip." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `Bermuda 4-night packages start around $1,499 per person including flights from ${AIRPORT}. Cancún and Punta Cana from $1,099 per person for 4 nights.` },
        { question: "Are flights from BOS direct?", answer: `For most ${CITY} departures we use direct flights only. If you need a connection (e.g., to reach a destination ${CITY} doesn't serve directly), we'll route through the shortest viable hub.` },
        { question: "Can I do an Iceland stopover?", answer: "Yes — Icelandair offers free stopovers in Reykjavík for 3–7 nights on the way to mainland Europe. Lina can route this and split your trip into two destinations on a single fare." },
        { question: "What about cruises from BOS?", answer: "Yes. Bermuda, Caribbean, and Canada/New England cruises depart from BOS year-round. Norwegian, Royal Caribbean, and Holland America have the strongest presence." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance in installments via ZeniPay at 0% interest." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
        { label: "Europe Destinations", href: "/destinations/europe" },
        { label: "Cruise Planning", href: "/services/cruises" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "TravelAction",
        name: `Vacation Packages from ${CITY}`,
        description: `All-inclusive and luxury vacation packages departing from ${CITY} (Logan).`,
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "MA" } },
      }}
    />
  );
}
