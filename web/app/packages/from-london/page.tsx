import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "London"; const AIRPORT = "LHR"; const URL_PATH = "/packages/from-london";
export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}/LGW/STN) — Caribbean, Asia, USA | Zeniva`,
  description: `All-inclusive vacation deals from ${CITY}. Caribbean, Asia, USA, Africa. Direct flights from Heathrow, Gatwick, Stansted, Luton.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `holiday packages from London`, `London to Caribbean`, `London to Bali`, `cheap holidays from London`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from London airports. Caribbean, Asia, Americas.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1={`Vacation Packages Departing from ${CITY}`} subtitle={`London has 5 major airports — Heathrow, Gatwick, Stansted, Luton, City. Direct flights to virtually every global destination. Lina compares all 5 for the best total price.`}
    heroImage="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=85" heroGradient="from-blue-900/70 to-red-900/60" badge={`✈️ 5 London Airports`}
    sections={[
      { heading: `Why ${CITY} Has the World's Best Connectivity`, content: `<p>London is arguably the world's best-connected city. Five major airports (LHR, LGW, STN, LTN, LCY) serve over 200 direct destinations. British Airways, Virgin Atlantic, easyJet, Ryanair, and 100+ international carriers make London a global travel hub. Caribbean direct, US direct, Asia direct, Africa direct, Australasia via one-stop.</p>` },
      { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Caribbean (Barbados, Antigua, Jamaica, St Lucia):</strong> Direct from LHR/LGW on BA, Virgin, TUI. From £1,500/person for 7 nights all-inclusive.</p><p><strong>USA (NYC, Miami, LA, Vegas):</strong> Direct on BA, Virgin, AA, Delta. From £800/person for flights, packages from £1,400.</p><p><strong>Maldives, Mauritius, Seychelles:</strong> Direct from LHR. Overwater bungalows from £3,500/person for 7 nights.</p><p><strong>Asia (Bangkok, Singapore, Hong Kong, Tokyo, Bali):</strong> Direct from LHR on BA, Cathay, Singapore Airlines, ANA. From £1,200/person flights.</p><p><strong>South Africa, Kenya, Tanzania:</strong> Direct safari + beach combos. From £2,500/person.</p>` },
      { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Lina compares all 5 London airports. Pricing in GBP via ZeniPay. Pay 25% deposit; balance via 0% installments.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `5 London airports`, description: `Lina compares LHR, LGW, STN, LTN, LCY for best total price.` },
      { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
      { icon: "map", title: "Global direct network", description: "London = world's best-connected city." },
      { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
    ]}
    faqs={[
      { question: `What's the cheapest holiday from ${CITY}?`, answer: `Mediterranean budget destinations (Greece, Spain, Portugal) from £400/person for 7 nights. Caribbean all-inclusive from £1,500/person.` },
      { question: "Best long-haul direct from London?", answer: "Maldives, Hong Kong, Singapore, Tokyo, NYC, LA, Sydney (via one-stop). All direct from LHR." },
      { question: "Heathrow or Gatwick — which?", answer: "LHR for premium long-haul (BA, Virgin). LGW for charter holidays + budget (TUI, Jet2, easyJet). Lina compares both." },
      { question: "Currency?", answer: "GBP via ZeniPay. Payment plans 0% interest." },
      { question: "Multi-city European trips?", answer: "Yes — Eurostar to Paris/Brussels/Amsterdam supported alongside flights." },
    ]}
    ctaText={`See Holidays from ${CITY}`} ctaPrompt={`I want a holiday from ${CITY}`}
    internalLinks={[ { label: "All Packages", href: "/packages" }, { label: "Caribbean", href: "/destinations/caribbean" }, { label: "Europe", href: "/destinations/europe" }, { label: "All-Inclusive", href: "/packages/all-inclusive" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (LHR/LGW/STN).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "GB" } } }}
  />
); }
