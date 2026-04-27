import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const URL_PATH = "/anniversary-trips";
export const metadata: Metadata = {
  title: "Anniversary Trips — 5, 10, 25, 50 Year Vacation Ideas | Zeniva",
  description: "Anniversary trip planning with Zeniva. Romantic destinations for 5, 10, 25, 50 year anniversaries. Bora Bora, Santorini, Tuscany, Maldives. Real bookings.",
  keywords: ["anniversary trip", "anniversary vacation", "5 year anniversary trip", "10 year anniversary", "25 year anniversary", "50 year anniversary", "romantic vacation"],
  openGraph: { title: "Anniversary Trips | Zeniva", description: "Romantic anniversary destinations for every milestone year.", url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Anniversary Trips — Zeniva" }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1="Anniversary Trips — Curated by Milestone"
    subtitle="A 5-year anniversary trip is different from a 25th. Different budgets, different vibes, different priorities. Zeniva designs anniversary trips matched to the milestone — quiet beach week, luxury Europe tour, multi-week dream trip."
    heroImage="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85" heroGradient="from-rose-900/70 to-purple-900/60" badge="Romantic + meaningful"
    sections={[
      { heading: "Anniversary trips by milestone", content: `<p><strong>1st & 5th anniversary:</strong> Build the romantic-trip habit. All-inclusive Caribbean (Sandals, Sanctuary Cap Cana), Mexico (Excellence, Hotel Xcaret Arte), or a long weekend at a US destination (Hudson Valley, Charleston, Sonoma). Budget $3,000-$7,000 for the trip.</p><p><strong>10th anniversary:</strong> Step it up. European city + countryside combo (Paris + Provence; Rome + Amalfi; Barcelona + Mallorca). Or first overwater bungalow trip (Tahiti, Bora Bora, Maldives). Budget $8,000-$18,000.</p><p><strong>25th anniversary:</strong> Bucket-list trip. Multi-week trip combining 2-3 destinations. Italy 2 weeks (Rome + Florence + Amalfi); Japan 2 weeks (Tokyo + Kyoto + Osaka); African safari + beach (Tanzania + Zanzibar; Botswana + Cape Town). Budget $20,000-$50,000+.</p><p><strong>50th anniversary:</strong> Once-in-a-lifetime trip. Private yacht charter Mediterranean. Multi-country Asia tour. Antarctic expedition cruise. Multi-generational trip with children + grandchildren. Budget $50,000+.</p>` },
      { heading: "Top romantic destinations", content: `<p><strong>Bora Bora:</strong> The classic overwater bungalow. Four Seasons, Conrad, St Regis. Most romantic resort destination on Earth.</p><p><strong>Santorini:</strong> Cliffside caldera-view suites at Canaves Oia, Andronis Luxury Suites, Mystique. Sunset views are uncalculable.</p><p><strong>Tuscany:</strong> Castello di Casole, Borgo Santo Pietro, Castello Banfi. Wine + countryside + Italian romance.</p><p><strong>Amalfi Coast:</strong> Le Sirenuse (Positano), Belmond Hotel Caruso (Ravello). Cliffs, lemons, lagoons.</p><p><strong>Maldives:</strong> Soneva Fushi, Six Senses Laamu, Conrad Maldives. Overwater bungalows + house reef.</p><p><strong>Tahiti & Moorea:</strong> Brando Resort, Four Seasons Bora Bora. More private than Maldives.</p><p><strong>Provence:</strong> La Bastide de Gordes, Coquillade. Lavender + wine + Roman ruins.</p>` },
      { heading: "Vow renewal coordination", content: `<p>For milestone anniversaries (25th, 50th), Zeniva coordinates vow renewal ceremonies — small private ceremonies with officiant, photographer, flowers, and cake. We work with the property to design the ceremony location (private beach, cliff overlook, vineyard) and handle local marriage office paperwork if you want it legally re-witnessed.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "Milestone-matched", description: "Different trips for 5, 10, 25, 50 year anniversaries." },
      { icon: "map", title: "Top romantic destinations", description: "Bora Bora, Santorini, Tuscany, Amalfi, Maldives, Provence." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — Lina matches milestone + budget + vibe." },
      { icon: "anchor", title: "Vow renewals", description: "Private ceremonies coordinated for 25th + 50th anniversaries." },
      { icon: "gift", title: "Surprise planning", description: "Coordinate surprises — room upgrade, in-room champagne, anniversary cake." },
      { icon: "shield", title: "Couples-only properties", description: "Sandals, Couples Resorts, adults-only luxury — no kids around." },
    ]}
    faqs={[
      { question: "Best 10-year anniversary trip?", answer: "Tahiti or Bora Bora overwater bungalow if you've never done one. Tuscany or Amalfi if you want Europe. Maldives if you want isolation. All in the $8,000-$18,000 range." },
      { question: "Best 25-year anniversary trip?", answer: "Multi-country bucket-list trip. Japan 2 weeks, Italy 2 weeks, or African safari + beach. Budget $20,000-$50,000+. Lina builds the full multi-destination itinerary." },
      { question: "Vow renewal abroad?", answer: "Yes — we coordinate private ceremonies at most romantic destinations. Officiant, photographer, flowers, cake handled. Symbolic ceremony or legally re-witnessed (paperwork varies by country)." },
      { question: "Surprise the partner with the trip?", answer: "We handle 'surprise' bookings discreetly — confirmations sent only to the planning partner. Common for milestone surprises." },
      { question: "Multi-gen anniversary trip?", answer: "For 50th anniversary trips with children + grandchildren, Zeniva books large villas (Tuscany, Caribbean, Bali) or coordinates multi-cabin cruise bookings. See /services/family-vacations." },
    ]}
    ctaText="Plan an Anniversary Trip" ctaPrompt="I'm planning an anniversary trip"
    internalLinks={[ { label: "Honeymoon Packages", href: "/services/honeymoon" }, { label: "Luxury Travel", href: "/services/luxury-travel" }, { label: "Adults-Only Resorts", href: "/services/adults-only-resorts" }, { label: "Yacht Charter", href: "/services/yacht-charter" }, { label: "Bora Bora", href: "/destinations/bora-bora" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Anniversary Trip Planning", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Anniversary Travel", description: "Anniversary trip planning matched to milestone year — 5th, 10th, 25th, 50th anniversaries with vow renewal coordination.", areaServed: "Worldwide" }}
  />
); }
