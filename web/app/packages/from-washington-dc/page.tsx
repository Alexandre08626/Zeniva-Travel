import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Washington DC";
const AIRPORT = "IAD/DCA";
const URL_PATH = "/packages/from-washington-dc";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (Dulles/Reagan/BWI) — Caribbean, Europe, Africa | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY} area (IAD, DCA, BWI). Caribbean, Mexico, Europe, Africa, Asia. Direct flights, hotel and transfers included.`,
  keywords: [`vacation packages from Washington DC`, `Dulles vacation deals`, `Reagan vacation deals`, `BWI vacation deals`, `Washington to Cancun`, `DC to Caribbean`, `cheap vacations from Washington`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from IAD, DCA, BWI. Caribbean, Europe, Africa, Asia.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1606820547337-12fc2eecbab2?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromWashingtonDCPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`The DC metro area has 3 major airports (Dulles IAD, Reagan DCA, Baltimore BWI). Direct flights to almost everywhere — Caribbean, Mexico, Europe, Africa, Asia. Lina compares all 3.`}
      heroImage="https://images.unsplash.com/photo-1606820547337-12fc2eecbab2?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-blue-900/70 to-red-900/60"
      badge={`✈️ IAD + DCA + BWI`}
      sections={[
        { heading: `Why DC Travelers Have It Easy`, content: `<p>Dulles (IAD) is United Airlines' East Coast international hub — direct flights to Africa (Ethiopian, South African), most of Europe, Asia, and the Middle East. Reagan (DCA) handles short-haul domestic + Caribbean. Baltimore (BWI) is Southwest's mid-Atlantic hub for cheap Mexico and Caribbean. Together, the DC area has more direct international flights than almost any other US metro.</p>` },
        { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Cancún & Riviera Maya:</strong> Direct from BWI on Southwest, IAD on United. From $999 per person for 4 nights.</p><p><strong>Punta Cana & Caribbean:</strong> Direct from IAD and BWI. From $1,099 per person for 5 nights.</p><p><strong>Europe (London, Paris, Frankfurt, Madrid):</strong> Direct from IAD on United and partner carriers.</p><p><strong>Africa (Johannesburg, Addis Ababa, Lagos):</strong> Direct from IAD — DC is one of the few US cities with regular African service.</p><p><strong>Tokyo, Seoul:</strong> Direct from IAD on United and ANA.</p><p><strong>Cabo & Puerto Vallarta:</strong> Direct from IAD/BWI year-round.</p>` },
        { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Lina compares IAD/DCA/BWI for every booking. Pay 25% to lock; balance via ZeniPay 0% interest.</p>` },
      ]}
      highlights={[
        { icon: "star", title: `3 Major Airports`, description: `Lina compares IAD, DCA, BWI for the best total price.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "map", title: "Africa Direct", description: "DC is one of the few US cities with regular sub-Saharan Africa service." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cancún packages from $999 per person for 4 nights including flights from IAD or BWI.` },
        { question: "IAD, DCA, or BWI — which is best?", answer: "IAD wins for international (Europe, Asia, Africa). DCA wins for short domestic. BWI wins for Southwest Mexico/Caribbean fares. Lina compares all 3." },
        { question: "Can you book safari trips?", answer: "Yes — IAD has direct flights to Johannesburg and Addis Ababa. We book combined safari + city + beach itineraries." },
        { question: "Do you offer payment plans?", answer: "Yes — 25% deposit, balance via ZeniPay at 0% interest." },
        { question: "Can I do multi-city European trips?", answer: "Yes — open-jaw routing supported." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from Washington DC`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
        { label: "Europe Destinations", href: "/destinations/europe" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (IAD/DCA/BWI).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "DC" } } }}
    />
  );
}
