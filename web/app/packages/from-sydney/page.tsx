import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "Sydney"; const AIRPORT = "SYD"; const URL_PATH = "/packages/from-sydney";
export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — Bali, Fiji, Asia, USA | Zeniva`,
  description: `Vacation deals from ${CITY} (${AIRPORT}). Bali, Fiji, Thailand, Japan, USA, Europe. Direct flights from Sydney Kingsford Smith.`,
  keywords: [`vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `holidays from Sydney`, `Sydney to Bali`, `Sydney to Fiji`, `Sydney to Tokyo`, `Australian holidays`],
  openGraph: { title: `Vacation Packages from ${CITY} | Zeniva`, description: `Curated packages from SYD. Bali, Fiji, Asia, USA.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1={`Vacation Packages Departing from ${CITY}`} subtitle={`Sydney Kingsford Smith (${AIRPORT}) is Australia's main international gateway. Direct flights to Bali, Fiji, Asian capitals, USA, and Europe via one-stop.`}
    heroImage="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1600&q=85" heroGradient="from-blue-900/70 to-emerald-900/60" badge={`✈️ Direct from SYD`}
    sections={[
      { heading: `Why ${CITY} Has Excellent Pacific Coverage`, content: `<p>Sydney Kingsford Smith (${AIRPORT}) is Qantas' main hub plus the largest airport in Australia. Direct flights to Bali (~6 hours), Fiji (~4), New Zealand (~3), Japan (~10), Singapore (~8), USA West Coast (~14). Australia's geographic isolation means most international trips are long-haul, but Sydney has the best direct network of any Australian city.</p>` },
      { heading: `Top Destinations from ${CITY}`, content: `<p><strong>Bali (Denpasar):</strong> 6-hour direct from SYD. Most popular Aussie holiday destination. From AUD 1,500/person for 7 nights.</p><p><strong>Fiji (Nadi):</strong> 4-hour direct from SYD. Resort holidays, family-friendly. From AUD 2,000/person for 7 nights.</p><p><strong>New Zealand (Auckland, Queenstown):</strong> Direct from SYD year-round. Adventure + ski. From AUD 1,200/person for 5 nights.</p><p><strong>Thailand (Bangkok, Phuket):</strong> Direct from SYD. From AUD 1,800/person for 7 nights.</p><p><strong>Japan (Tokyo, Osaka):</strong> Direct from SYD on Qantas, JAL, ANA. From AUD 2,500/person for 7 nights.</p><p><strong>USA (LA, San Francisco, Honolulu):</strong> Direct from SYD on Qantas, United, Delta, Hawaiian. From AUD 2,200/person.</p><p><strong>Europe (London, Frankfurt, Paris, Rome):</strong> One-stop from SYD via Singapore, Dubai, or Doha. From AUD 3,500/person.</p>` },
      { heading: "How to Book", content: `<p>Chat with Lina or call 24/7 at /call. Pricing in AUD via ZeniPay. 25% deposit, balance in 0% installments.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Direct from SYD`, description: `Qantas hub — direct to Bali, Fiji, Japan, USA, Europe (one-stop).` },
      { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
      { icon: "map", title: "Pacific specialty", description: "Closest to Bali, Fiji, NZ from any major Western city." },
      { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere." },
    ]}
    faqs={[
      { question: `What's the cheapest holiday from ${CITY}?`, answer: `Bali all-inclusive packages from AUD 1,500/person for 7 nights including flights from SYD. Fiji from AUD 2,000/person.` },
      { question: "Best long-haul direct from Sydney?", answer: "Tokyo, Singapore, LA, San Francisco, Hong Kong all direct. Europe requires one stop." },
      { question: "Currency?", answer: "AUD via ZeniPay. Payment plans 0% interest." },
      { question: "Family holidays?", answer: "Fiji and Bali are Aussie family classics. Resorts like Sheraton Fiji, Hard Rock Bali, Conrad Bali — all bookable." },
      { question: "Cruises from Sydney?", answer: "Yes — Royal Caribbean, Princess, P&O all homeport at Sydney for South Pacific itineraries." },
    ]}
    ctaText={`See Packages from ${CITY}`} ctaPrompt={`I want a vacation package from ${CITY}`}
    internalLinks={[ { label: "All Packages", href: "/packages" }, { label: "Cruise Planning", href: "/services/cruises" }, { label: "All-Inclusive Deals", href: "/packages/all-inclusive" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Vacation Packages from ${CITY}`, description: `Vacation packages from ${CITY} (SYD).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "AU", addressRegion: "NSW" } } }}
  />
); }
