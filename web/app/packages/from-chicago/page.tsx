import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Chicago";
const AIRPORT = "ORD";
const URL_PATH = "/packages/from-chicago";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}/MDW) — Caribbean, Mexico, Europe | Zeniva`,
  description: `All-inclusive vacation deals departing from ${CITY}. Caribbean, Mexico, Europe, Hawaii, Asia. Flights from ORD or Midway, hotel and transfers included.`,
  keywords: [
    `vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `Midway vacation deals`,
    `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Punta Cana`,
    `${CITY} to Caribbean`, `${CITY} to Hawaii`, `${CITY} to Europe`,
    `cheap vacations from ${CITY}`, `luxury packages from ${CITY}`,
  ],
  openGraph: {
    title: `Vacation Packages from ${CITY} | Zeniva`,
    description: `Curated all-inclusive and luxury packages from O'Hare and Midway. Caribbean, Mexico, Europe.`,
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY} — Zeniva` }],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromChicagoPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Direct flights from O'Hare and Midway to the Caribbean, Mexico, Europe, and beyond. Lina AI builds your package with flights, hotel, and transfers in seconds.`}
      heroImage="https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-blue-900/70 to-slate-900/60"
      badge={`✈️ ORD & Midway`}
      sections={[
        {
          heading: `Why ${CITY} Is a Hidden Vacation Hub`,
          content: `<p>${CITY} has more direct flights to vacation destinations than most travelers realize. From O'Hare (${AIRPORT}), United, American, Delta, and international carriers reach the Caribbean, all of Mexico, all major European capitals, Tokyo, Seoul, and dozens more. Midway (MDW) is the budget hub, with Southwest dominating short flights to Cancún, Punta Cana, Mexico City, and the major Caribbean islands.</p>
<p>${CITY}'s long winters drive the city's love affair with all-inclusive resort vacations. Zeniva's ${CITY} packages account for that — most are designed for winter escape (December–April) with shorter shoulder-season options for spring break and family weeks. Every package includes flights from ORD or MDW depending on which is cheaper for your dates.</p>`,
        },
        {
          heading: `Top Destinations from ${CITY}`,
          content: `<p><strong>Cancún & Riviera Maya:</strong> The default ${CITY} winter escape. 4-hour direct flights from both ORD and MDW. All-inclusive packages from $899 per person for 4 nights. Best resorts: Iberostar, Excellence, Hard Rock, Palace, Karisma, Hyatt Ziva.</p>
<p><strong>Punta Cana, Dominican Republic:</strong> Direct flights from ORD year-round. Couples-only Sanctuary, family Hard Rock Punta Cana, ultra-luxury Tortuga Bay. From $1,099 per person for 5 nights.</p>
<p><strong>Jamaica (Montego Bay, Negril):</strong> Direct from ORD. Sandals and Beaches resorts plus boutique options like Round Hill and Jamaica Inn. From $1,299 per person for 5 nights.</p>
<p><strong>Aruba, Turks and Caicos, Bahamas:</strong> Direct flights from ORD. Calmer beaches and higher-end resorts than Cancún. From $1,799 per person for 5 nights.</p>
<p><strong>Hawaii:</strong> Direct from ORD to Honolulu and Kahului. ${CITY}-to-Hawaii is a long flight (9 hours) but still one of the most popular routes. Maui Wailea and Kaanapali resorts from $1,800 per person for 5 nights.</p>
<p><strong>Europe (Italy, France, Spain, Greece):</strong> O'Hare has direct flights to most major European capitals. Best for spring (April–May) and fall (September–October) when the weather is perfect and crowds thin out.</p>`,
        },
        {
          heading: "ORD vs Midway — Which to Use",
          content: `<p>For most international destinations, O'Hare wins on choice and flight times. United and American both hub at ORD, giving the most direct options. Midway is dominated by Southwest, which means cheaper fares to the destinations Southwest serves (Cancún, Punta Cana, Cabo, Montego Bay, Aruba, Nassau) but no first-class option.</p>
<p>Zeniva's packages quote whichever airport delivers the best total price for your dates and destination. If you have a strong preference (e.g., MDW because parking is easier), tell Lina and she'll filter to that airport only.</p>`,
        },
        {
          heading: "How to Book and Customize",
          content: `<p>Chat with Lina to get a personalized package in seconds. Tell her your dates, group size, and budget. Every package is customizable — different dates, different resort, different room category, add excursions or transfers. Voice call available 24/7 at /call if you prefer to talk.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: "ORD or MDW", description: `Packages quote whichever ${CITY} airport gives the best total price for your dates.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "shield", title: "Vetted Resorts Only", description: "Every property in our portfolio personally verified for quality." },
        { icon: "users", title: "Family-Friendly Options", description: "Beaches, Hard Rock Family Suites, Iberostar Family — properties built for kids." },
        { icon: "map", title: "Adventure Add-Ons", description: "Cenotes, Mayan ruins, swim-with-dolphins, snorkel tours bundled or à la carte." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cancún or Punta Cana packages start around $899 per person for 4 nights including flights. Bahamas long-weekends from $999 per person.` },
        { question: "ORD or Midway — which is cheaper?", answer: "It depends on dates and destination. Midway/Southwest tends to win for Cancún, Punta Cana, Cabo. ORD wins on most international destinations and almost all of Europe. Lina compares both and quotes whichever is cheaper." },
        { question: "Are direct flights guaranteed?", answer: `For most ${CITY} departures we use direct flights only. If you need a connection (e.g., to reach a destination ${CITY} doesn't serve directly), we'll route through the shortest viable hub.` },
        { question: "Can I do multi-city or open-jaw?", answer: "Yes. Fly into one city and out of another for multi-destination trips. Lina handles the routing and pricing." },
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
        description: `All-inclusive and luxury vacation packages departing from ${CITY} (ORD/MDW).`,
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "IL" } },
      }}
    />
  );
}
