import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const URL_PATH = "/travel-agency-virginia";

export const metadata: Metadata = {
  title: "Travel Agency Virginia — Lina AI 24/7 | Zeniva",
  description:
    "Zeniva is a Virginia travel agency powered by Lina AI 24/7. Caribbean all-inclusive, European tours, Williamsburg / Virginia Beach getaways, government-rate corporate travel. Direct flights from IAD, DCA, RIC, ORF.",
  keywords: [
    "travel agency Virginia",
    "best travel agency Virginia",
    "travel agent Richmond",
    "travel agent Virginia Beach",
    "travel agent Norfolk",
    "travel agent Arlington",
    "DC travel agency",
    "AI travel agency Virginia",
    "all inclusive from IAD",
    "Zeniva Virginia",
  ],
  openGraph: {
    title: "Travel Agency Virginia | Zeniva",
    description: "AI-powered Virginia travel agency. Caribbean, Europe, beach getaways. Lina AI 24/7. Direct flights from IAD, DCA, RIC, ORF.",
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?auto=format&fit=crop&w=1200&q=85",
        width: 1200,
        height: 630,
        alt: "Travel agency Virginia",
      },
    ],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function TravelAgencyVirginiaPage() {
  return (
    <SeoPage
      h1="Travel Agency in Virginia — Lina AI 24/7"
      subtitle="Zeniva is the AI-powered travel agency for Virginians. Caribbean all-inclusive, European tours, beach getaways, Williamsburg history trips, government-rate corporate travel. Direct flights from Dulles (IAD), Reagan (DCA), Richmond (RIC), Norfolk (ORF). Zero booking fees, real human backup 24/7."
      heroImage="https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-emerald-900/70 to-blue-900/60"
      badge="🌳 Virginia · USA"
      sections={[
        {
          heading: "Why Virginians choose Zeniva",
          content: `<p>Zeniva combines instant AI search with the expertise of senior travel advisors. Lina AI compares live flight inventory across Delta, United, American, JetBlue, Spirit, Frontier — plus all-inclusive operators (Apple Vacations, Funjet, Pleasant Holidays), cruise lines (Royal Caribbean, Norfolk-departure cruises) and luxury Europe partners. A real Zeniva advisor verifies the booking before confirmation.</p>
<p><strong>Direct flights from:</strong> Washington Dulles (IAD), Reagan National (DCA), Richmond (RIC), Norfolk (ORF), Charlottesville (CHO), Roanoke (ROA). Trips to the Caribbean, Mexico, Europe, Hawaii, Asia — all bookable through Lina.</p>`,
        },
        {
          heading: "Most popular trips for Virginians",
          content: `<p><strong>Caribbean all-inclusive:</strong> Punta Cana, Aruba, Turks & Caicos, Cancún. From $999 per person for 5 nights including non-stop flight from IAD or DCA.</p>
<p><strong>Europe:</strong> Paris, Rome, London, Lisbon — direct overnight flights from IAD on United, Air France, British Airways. Boutique hotels and luxury rail.</p>
<p><strong>Norfolk cruises:</strong> Royal Caribbean, Carnival and Norwegian sail Bermuda and Caribbean from Norfolk Cruise Terminal. We handle pre-cruise hotels and parking.</p>
<p><strong>Williamsburg & Virginia Beach getaways:</strong> historic colonial Williamsburg, Busch Gardens, Virginia Beach oceanfront resorts. Family packages with car rental included.</p>
<p><strong>Government / corporate travel:</strong> per-diem-compliant hotels, federal CWT rates, multi-traveler trip coordination for DC-area government and contractor staff.</p>
<p><strong>Smith Mountain Lake & Outer Banks rentals:</strong> beach and lake houses via <a href="/zenistay">ZeniStay</a>.</p>`,
        },
        {
          heading: "How Zeniva works for Virginia clients",
          content: `<p>Step 1: Chat with Lina at <a href="/chat">/chat</a> or call her at <a href="/call">/call</a> 24/7. Tell her where, when, who, budget.</p>
<p>Step 2: Lina returns 3 personalized options in under 30 seconds — flights, hotels, transfers. Real prices from Duffel, LiteAPI (1.5M+ hotels) and curated luxury partners.</p>
<p>Step 3: You book. Card or ZeniPay payment plans (0% interest). Confirmation appears instantly in your <a href="/documents">/documents</a> dashboard.</p>
<p>Step 4: In-trip support 24/7. Anything goes wrong — flight canceled, hotel room wrong — text Lina and a real Zeniva advisor handles it from anywhere.</p>`,
        },
        {
          heading: "Compliance and trust",
          content: `<p>Zeniva LLC is incorporated in Delaware, USA. We operate under standard US travel-agency disclosures, accept all major credit cards via Stripe, and offer ZeniPay installment plans. Tickets and confirmations are issued directly by the airline, hotel, or cruise line — Zeniva is the licensed intermediary.</p>`,
        },
      ]}
      highlights={[
        { icon: "phone", title: "24/7 AI + human support", description: "Lina AI any time, real Zeniva advisor on call." },
        { icon: "star", title: "IAD, DCA, RIC, ORF direct flights", description: "Caribbean, Europe, Hawaii — non-stop from Virginia." },
        { icon: "gift", title: "Zero booking fees", description: "We earn from supplier commissions, not from you." },
        { icon: "anchor", title: "Norfolk cruise specialists", description: "Royal Caribbean, Carnival, Norwegian — sailing from VA." },
        { icon: "users", title: "ZeniPay 0% installments", description: "25% deposit, balance through trip date." },
        { icon: "shield", title: "Government-friendly", description: "Per-diem compliant hotels and federal CWT rates available." },
      ]}
      faqs={[
        { question: "Is Zeniva a real travel agency in Virginia?", answer: "Yes. Zeniva LLC is incorporated in Delaware and operates throughout the US. We serve Virginia travelers from NoVa, Richmond, Hampton Roads, Charlottesville, Roanoke and the Eastern Shore." },
        { question: "Do you book government/per-diem rates?", answer: "Yes — when traveling on official US government business, Lina filters to per-diem-compliant hotels and federal CWT-eligible properties. Provide your travel order details at checkout." },
        { question: "What about Norfolk cruises?", answer: "Royal Caribbean, Carnival and Norwegian sail Bermuda and the Caribbean from Norfolk Cruise Terminal. Zeniva books across all three lines and handles pre-cruise hotels and parking." },
        { question: "What flights can I book?", answer: "Every airline published through Duffel (Delta, United, American, JetBlue, Spirit, Frontier, plus international carriers). Direct flights from IAD, DCA, RIC and ORF are surfaced first." },
        { question: "What if my flight gets canceled?", answer: "Real Zeniva advisor reachable 24/7 to rebook you on the next available flight, handle hotel extensions, and process refunds where applicable." },
      ]}
      ctaText="Plan my Virginia trip with Lina"
      ctaPrompt="I'm in Virginia, I want to plan a trip"
      internalLinks={[
        { label: "Travel Agency New York", href: "/travel-agency-new-york" },
        { label: "All-Inclusive Packages", href: "/packages/all-inclusive" },
        { label: "Cruises", href: "/services/cruises" },
        { label: "ZeniStay (rentals)", href: "/zenistay" },
        { label: "Honeymoons", href: "/honeymoons" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        name: "Zeniva Travel — Virginia",
        description: "AI-powered travel agency serving Virginia 24/7.",
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
