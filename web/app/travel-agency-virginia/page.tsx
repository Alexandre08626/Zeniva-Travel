import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const URL_PATH = "/travel-agency-virginia";

export const metadata: Metadata = {
  title: "AI Travel Platform Virginia — Lina AI 24/7 | Zeniva",
  description:
    "Zeniva is an AI-powered travel technology platform serving Virginia 24/7 with Lina AI. Caribbean all-inclusive, European tours, Williamsburg / Virginia Beach getaways and government-rate corporate travel — fulfilled by third-party suppliers. Direct flights from IAD, DCA, RIC, ORF.",
  keywords: [
    "AI travel platform Virginia",
    "best AI trip planner Virginia",
    "AI travel concierge Richmond",
    "AI trip planner Virginia Beach",
    "AI trip planner Norfolk",
    "AI trip planner Arlington",
    "DC AI travel platform",
    "AI travel platform Virginia",
    "all inclusive from IAD",
    "Zeniva Virginia",
  ],
  openGraph: {
    title: "AI Travel Platform Virginia | Zeniva",
    description: "AI-powered travel technology platform for Virginia. Caribbean, Europe, beach getaways. Lina AI 24/7. Direct flights from IAD, DCA, RIC, ORF — services provided by third-party suppliers.",
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?auto=format&fit=crop&w=1200&q=85",
        width: 1200,
        height: 630,
        alt: "AI travel platform Virginia",
      },
    ],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function TravelAgencyVirginiaPage() {
  return (
    <SeoPage
      h1="AI Travel Platform for Virginia — Lina AI 24/7"
      subtitle="Zeniva is the AI-powered travel technology platform for Virginians. Caribbean all-inclusive, European tours, beach getaways, Williamsburg history trips, government-rate corporate travel — Lina AI plans and books with third-party suppliers. Direct flights from Dulles (IAD), Reagan (DCA), Richmond (RIC), Norfolk (ORF). Zero platform booking fees, real human backup 24/7."
      heroImage="https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-emerald-900/70 to-blue-900/60"
      badge="🌳 Virginia · USA"
      sections={[
        {
          heading: "Why Virginians choose Zeniva",
          content: `<p>Zeniva combines instant AI search with the expertise of senior travel advisors. Lina AI compares live flight inventory across Delta, United, American, JetBlue, Spirit, Frontier — plus all-inclusive operators (Apple Vacations, Funjet, Pleasant Holidays), cruise lines (Royal Caribbean, Norfolk-departure cruises) and luxury Europe partners. A real Zeniva advisor coordinates the booking with the supplier before confirmation.</p>
<p><strong>Direct flights from:</strong> Washington Dulles (IAD), Reagan National (DCA), Richmond (RIC), Norfolk (ORF), Charlottesville (CHO), Roanoke (ROA). Trips to the Caribbean, Mexico, Europe, Hawaii, Asia — all bookable through Lina via supplier inventory.</p>`,
        },
        {
          heading: "Most popular trips for Virginians",
          content: `<p><strong>Caribbean all-inclusive:</strong> Punta Cana, Aruba, Turks & Caicos, Cancún. From $999 per person for 5 nights including non-stop flight from IAD or DCA.</p>
<p><strong>Europe:</strong> Paris, Rome, London, Lisbon — direct overnight flights from IAD on United, Air France, British Airways. Boutique hotels and luxury rail.</p>
<p><strong>Norfolk cruises:</strong> Royal Caribbean, Carnival and Norwegian sail Bermuda and Caribbean from Norfolk Cruise Terminal. We coordinate pre-cruise hotels and parking with the suppliers.</p>
<p><strong>Williamsburg & Virginia Beach getaways:</strong> historic colonial Williamsburg, Busch Gardens, Virginia Beach oceanfront resorts. Family packages with car rental included.</p>
<p><strong>Government / corporate travel:</strong> per-diem-compliant hotels, federal CWT rates, multi-traveler trip coordination for DC-area government and contractor staff.</p>
<p><strong>Smith Mountain Lake & Outer Banks rentals:</strong> beach and lake houses via <a href="/zenistay">ZeniStay</a>.</p>`,
        },
        {
          heading: "How Zeniva works for Virginia clients",
          content: `<p>Step 1: Chat with Lina at <a href="/chat">/chat</a> or call her at <a href="/call">/call</a> 24/7. Tell her where, when, who, budget.</p>
<p>Step 2: Lina returns 3 personalized options in under 30 seconds — flights, hotels, transfers. Real prices from Duffel, LiteAPI (1.5M+ hotels) and curated luxury partners.</p>
<p>Step 3: You book. Card or ZeniPay payment plans (0% interest). Confirmation from the supplier appears instantly in your <a href="/documents">/documents</a> dashboard.</p>
<p>Step 4: In-trip support 24/7. Anything goes wrong — flight canceled, hotel room wrong — text Lina and a real Zeniva advisor coordinates with the supplier from anywhere.</p>`,
        },
        {
          heading: "Compliance and trust",
          content: `<p>Zeniva LLC is incorporated in Delaware, USA. <strong>Zeniva Travel acts solely as a technology intermediary.</strong> Tickets, confirmations and travel services are issued and provided directly by the airline, hotel, cruise line or other third-party supplier identified at checkout. Payments are processed via Stripe; ZeniPay installment plans are available.</p>`,
        },
      ]}
      highlights={[
        { icon: "phone", title: "24/7 AI + human support", description: "Lina AI any time, real Zeniva advisor on call." },
        { icon: "star", title: "IAD, DCA, RIC, ORF direct flights", description: "Caribbean, Europe, Hawaii — non-stop from Virginia via supplier inventory." },
        { icon: "gift", title: "Zero platform booking fees", description: "We earn from supplier commissions, not from you." },
        { icon: "anchor", title: "Norfolk cruise specialists", description: "Royal Caribbean, Carnival, Norwegian — sailing from VA." },
        { icon: "users", title: "ZeniPay 0% installments", description: "25% deposit, balance through trip date." },
        { icon: "shield", title: "Government-friendly", description: "Per-diem compliant hotels and federal CWT rates available." },
      ]}
      faqs={[
        { question: "Is Zeniva a travel agency?", answer: "No. Zeniva is an AI-powered travel technology platform incorporated in Delaware, USA. Travel services in Virginia and elsewhere are provided by independent third-party suppliers identified at checkout." },
        { question: "Do you book government/per-diem rates?", answer: "Yes — when traveling on official US government business, Lina filters to per-diem-compliant hotels and federal CWT-eligible properties. Provide your travel order details at checkout." },
        { question: "What about Norfolk cruises?", answer: "Royal Caribbean, Carnival and Norwegian sail Bermuda and the Caribbean from Norfolk Cruise Terminal. Zeniva facilitates booking across all three lines and coordinates pre-cruise hotels and parking with the suppliers." },
        { question: "What flights can I book?", answer: "Every airline published through Duffel (Delta, United, American, JetBlue, Spirit, Frontier, plus international carriers). Direct flights from IAD, DCA, RIC and ORF are surfaced first. The airline is the supplier of record." },
        { question: "What if my flight gets canceled?", answer: "Real Zeniva advisor reachable 24/7 to coordinate rebooking with the airline, handle hotel extensions and process refunds where applicable under the supplier's policy." },
      ]}
      ctaText="Plan my Virginia trip with Lina"
      ctaPrompt="I'm in Virginia, I want to plan a trip"
      internalLinks={[
        { label: "AI Travel Platform New York", href: "/travel-agency-new-york" },
        { label: "All-Inclusive Packages", href: "/packages/all-inclusive" },
        { label: "Cruises", href: "/services/cruises" },
        { label: "ZeniStay (rentals)", href: "/zenistay" },
        { label: "Honeymoons", href: "/honeymoons" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Zeniva Travel — Virginia",
        description: "AI-powered travel technology platform serving Virginia 24/7. Travel services are provided by third-party suppliers.",
        url: `https://www.zenivatravel.com${URL_PATH}`,
        areaServed: [
          { "@type": "AdministrativeArea", name: "Virginia" },
          { "@type": "City", name: "Richmond", address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "VA" } },
          { "@type": "City", name: "Virginia Beach", address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "VA" } },
          { "@type": "City", name: "Arlington", address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "VA" } },
          { "@type": "City", name: "Norfolk", address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "VA" } },
        ],
        priceRange: "$$-$$$$",
        currenciesAccepted: "USD",
        inLanguage: "en-US",
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
      }}
    />
  );
}
