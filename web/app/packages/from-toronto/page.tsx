import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Toronto";
const AIRPORT = "YYZ";
const URL_PATH = "/packages/from-toronto";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Caribbean, Mexico, Europe | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} (Pearson). Caribbean, Mexico, Europe, Hawaii, Asia. Direct flights, hotel and transfers included. CAD pricing.`,
  keywords: [
    `vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `Pearson vacation deals`,
    `all-inclusive from ${CITY}`, `${CITY} to Cancun`, `${CITY} to Punta Cana`,
    `${CITY} to Caribbean`, `cheap vacations from ${CITY}`, `luxury packages from ${CITY}`,
    `Toronto travel agent`, `Air Canada vacation packages`,
  ],
  openGraph: {
    title: `Vacation Packages from ${CITY} | Zeniva`,
    description: `Curated packages from Pearson. Caribbean, Mexico, Europe, Hawaii.`,
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY} — Zeniva` }],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromTorontoPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Pearson (YYZ) is Canada's largest airport and Air Canada's main hub. Direct flights to the Caribbean, Mexico, Europe. Lina AI prices in CAD and books with Canadian-friendly partners.`}
      heroImage="https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-red-900/70 to-blue-900/60"
      badge={`✈️ Direct from Pearson`}
      sections={[
        {
          heading: `Why ${CITY} Is Canada's Travel Hub`,
          content: `<p>Toronto Pearson (${AIRPORT}) is Canada's busiest airport and Air Canada's main international hub. Direct flights from Pearson reach virtually every Caribbean island, all of Mexico's beach destinations, every major European capital, Tokyo, Seoul, Hong Kong, Sydney. Toronto's brutal winters drive heavy traffic to Caribbean and Mexican all-inclusive resorts December through April.</p>
<p>Zeniva's ${CITY} packages quote in CAD and use Canadian-friendly partners. We also book with Sunwing, Air Transat, and WestJet Vacations packages alongside Air Canada's own. ZeniPay accepts payment plans in CAD with no FX surprises.</p>`,
        },
        {
          heading: `Top Destinations from ${CITY}`,
          content: `<p><strong>Cancún & Riviera Maya:</strong> 4-hour direct from Pearson. All-inclusive packages from CAD $1,099 per person for 4 nights. Sunwing, Air Canada Vacations, Air Transat all serve this route.</p>
<p><strong>Punta Cana, Dominican Republic:</strong> Direct from YYZ year-round. From CAD $1,199 per person for 5 nights.</p>
<p><strong>Cuba (Varadero, Cayo Coco):</strong> Direct from YYZ. Cuba is a uniquely Canadian destination — fewer Americans, more authentic resort scene. From CAD $999 per person for 5 nights.</p>
<p><strong>Jamaica (Montego Bay, Negril):</strong> Direct from YYZ. Sandals and Beaches plus boutique options. From CAD $1,399 per person for 5 nights.</p>
<p><strong>Europe (London, Paris, Frankfurt, Rome, Madrid, Athens, Reykjavík):</strong> Direct flights from YYZ to most major European capitals. Best for spring/fall.</p>
<p><strong>Asia (Tokyo, Seoul, Hong Kong):</strong> Direct from YYZ on Air Canada. ${CITY} to Asia is competitive with US gateways.</p>`,
        },
        {
          heading: "Sunwing, Air Transat, Air Canada — Which to Use",
          content: `<p>Canadian charter operators (Sunwing, Air Transat, WestJet Vacations) tend to win on Mexico and Caribbean all-inclusive packages — they own the relationships with the resorts and sell at cheaper rates than booking flight + hotel separately. For Europe, Asia, or premium-cabin trips, Air Canada and partner carriers win. Lina compares all carriers and quotes whichever delivers the best total CAD price.</p>`,
        },
        {
          heading: "How to Book",
          content: `<p>Chat with Lina or call 24/7 at /call. Every package customizable. ZeniPay accepts payment plans in CAD at 0% interest. Travel insurance available — strongly recommended for international trips.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: `Direct from Pearson`, description: `Air Canada's main hub — direct to Caribbean, Mexico, Europe, Asia.` },
        { icon: "gift", title: "CAD Pricing", description: "All packages quoted in Canadian dollars with no FX surprises." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds. Bilingual EN/FR." },
        { icon: "map", title: "Cuba Direct", description: "Canadian carriers fly direct to Varadero and Cayo Coco — uniquely accessible from YYZ." },
        { icon: "users", title: "Sunwing + Air Canada + Transat", description: "We compare all Canadian charter and scheduled carriers for the best deal." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere if anything goes wrong." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cuba packages from CAD $999 per person for 5 nights. Cancún from CAD $1,099 per person for 4 nights including flights from Pearson.` },
        { question: "Sunwing vs Air Canada — which is better?", answer: "Sunwing/Transat tend to win for Mexico and Caribbean all-inclusive packages. Air Canada wins for Europe, Asia, and any premium-cabin booking. Lina compares all carriers." },
        { question: "Can I pay in CAD?", answer: "Yes — all packages quoted and charged in CAD via ZeniPay. No FX conversion fees." },
        { question: "Are direct flights guaranteed?", answer: `For most ${CITY} departures we use direct flights only. If you need a connection, we'll route through the shortest viable hub.` },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest, in CAD." },
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
        "@context": "https://schema.org", "@type": "TravelAction",
        name: `Vacation Packages from ${CITY}`,
        description: `All-inclusive and luxury vacation packages departing from ${CITY} (Pearson).`,
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "CA", addressRegion: "ON" } },
      }}
    />
  );
}
