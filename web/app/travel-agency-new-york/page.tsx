import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const URL_PATH = "/travel-agency-new-york";

export const metadata: Metadata = {
  title: "AI Travel Platform New York — Lina AI 24/7 | Zeniva",
  description:
    "Zeniva is an AI travel technology platform serving New York 24/7 with Lina AI. Compare luxury vacations, all-inclusive packages, yacht charters and custom trips from third-party suppliers. Direct flights from JFK, LGA, EWR.",
  keywords: [
    "AI travel platform New York",
    "best AI trip planner NYC",
    "luxury travel platform New York",
    "AI travel concierge NYC",
    "AI travel assistant Manhattan",
    "AI trip planner Brooklyn",
    "travel concierge NYC",
    "honeymoon planner NYC",
    "all inclusive from JFK",
    "vacation packages New York",
    "Zeniva New York",
  ],
  openGraph: {
    title: "AI Travel Platform New York | Zeniva",
    description: "AI travel technology platform serving New York 24/7. Compare luxury vacations, all-inclusive packages and custom trips offered by third-party suppliers — Lina AI handles the search.",
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=85",
        width: 1200,
        height: 630,
        alt: "AI travel platform New York City",
      },
    ],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function TravelAgencyNewYorkPage() {
  return (
    <SeoPage
      h1="AI Travel Platform for New York — Lina AI 24/7"
      subtitle="Zeniva is the AI-powered travel technology platform for New Yorkers. Compare luxury vacations, all-inclusive packages, yacht charters and custom honeymoons offered by third-party suppliers — Lina AI plans and books everything in seconds. Direct flights from JFK, LaGuardia and Newark. Zero platform booking fees, real human backup 24/7."
      heroImage="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-slate-900/70 to-blue-900/60"
      badge="🗽 New York · USA"
      sections={[
        {
          heading: "Why New Yorkers choose Zeniva",
          content: `<p>Zeniva combines instant AI search with the expertise of senior travel advisors. Lina AI compares live flight inventory across JetBlue, Delta, American, United, plus all-inclusive operators (Apple Vacations, Funjet, Pleasant Holidays) and luxury cruise lines — all in one search. Then a real human verifies the booking with the supplier before it's confirmed.</p>
<p><strong>Direct flights from:</strong> JFK, LaGuardia (LGA), Newark (EWR), White Plains (HPN), Stewart (SWF). Trips to the Caribbean, Mexico, Europe, Hawaii, Asia — all bookable through Lina via supplier inventory.</p>`,
        },
        {
          heading: "Most popular trips for New Yorkers",
          content: `<p><strong>Caribbean all-inclusive:</strong> Punta Cana, Aruba, Turks & Caicos, Cancún. From $1,099 per person for 5 nights including non-stop flight from JFK or EWR.</p>
<p><strong>Europe escapes:</strong> Paris, Rome, Barcelona, Lisbon — direct overnight flights from JFK. Boutique hotels and luxury rail.</p>
<p><strong>Hawaii:</strong> Maui, Oahu, Kauai. Direct from JFK on JetBlue and Delta. Resort + flights packages from $2,499 per person.</p>
<p><strong>Honeymoons:</strong> Maldives, Bora Bora, Santorini, Amalfi Coast — Zeniva's specialty. Lina coordinates upgrades, romantic touches and ocean-view rooms with the supplier.</p>
<p><strong>Last-minute getaways:</strong> Bahamas weekend, Bermuda 3-night, Miami long weekend. Bookable in 60 seconds via chat or voice with Lina.</p>
<p><strong>Yacht charters:</strong> private yachts in the Hamptons (East End), Newport, Miami. <a href="/zeniyacht">View ZeniYacht fleet</a>.</p>`,
        },
        {
          heading: "How Zeniva works for NYC clients",
          content: `<p>Step 1: Chat with Lina at <a href="/chat">/chat</a> or call her at <a href="/call">/call</a> 24/7. Tell her where, when, who, budget.</p>
<p>Step 2: Lina returns 3 personalized options in under 30 seconds — flights, hotels, transfers. Real prices from Duffel (flights), LiteAPI (1.5M+ hotels) and curated luxury partners.</p>
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
        { icon: "star", title: "JFK, LGA, EWR direct flights", description: "Caribbean, Europe, Hawaii — non-stop from NYC via supplier inventory." },
        { icon: "gift", title: "Zero platform booking fees", description: "We earn from supplier commissions, not from you." },
        { icon: "shield", title: "In-trip support", description: "Real human reachable from anywhere if anything breaks." },
        { icon: "users", title: "ZeniPay 0% installments", description: "25% deposit, balance through trip date." },
        { icon: "anchor", title: "Hamptons yacht charters", description: "Private yacht charters East End and Newport summer." },
      ]}
      faqs={[
        { question: "Is Zeniva a travel agency?", answer: "No. Zeniva is an AI-powered travel technology platform incorporated in Delaware, USA. Zeniva does not operate flights, hotels or other travel services itself — every booking is fulfilled by an independent third-party supplier identified at checkout." },
        { question: "What flights can I book through Zeniva?", answer: "Every airline that publishes inventory through Duffel — JetBlue, Delta, American, United, Lufthansa, KLM, Air France, British Airways, etc. Plus low-cost carriers like Spirit, Frontier, Avianca. Direct flights from JFK, LGA, EWR are highlighted first. The airline is the supplier of record." },
        { question: "Do you handle honeymoons and luxury trips?", answer: "Yes — Zeniva specializes in luxury vacations and honeymoons. Lina sources private villas, ocean-view suites, butler service and chef-prepared dinners from independent suppliers. Free room upgrades when available." },
        { question: "What if I need to cancel?", answer: "The supplier's cancellation policy applies (varies by airline / hotel). Zeniva handles the cancellation paperwork with the supplier on your behalf. Travel insurance available at checkout from a third-party insurer." },
        { question: "Do you sell travel insurance?", answer: "Travel insurance is offered through third-party insurers — Allianz Global Assistance and Travel Guard — available at checkout. Lina recommends the right policy based on your destination and trip cost." },
      ]}
      ctaText="Plan my NYC trip with Lina"
      ctaPrompt="I'm in New York, I want to plan a trip"
      internalLinks={[
        { label: "AI Travel Platform Virginia", href: "/travel-agency-virginia" },
        { label: "All-Inclusive Packages", href: "/packages/all-inclusive" },
        { label: "Hamptons Yacht Charters", href: "/zeniyacht" },
        { label: "Honeymoons", href: "/honeymoons" },
        { label: "Cruises", href: "/services/cruises" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Zeniva Travel — New York",
        description: "AI-powered travel technology platform serving New York 24/7. Travel services are provided by third-party suppliers.",
        url: `https://www.zenivatravel.com${URL_PATH}`,
        areaServed: [
          { "@type": "City", name: "New York", address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "NY" } },
          { "@type": "AdministrativeArea", name: "New York State" },
        ],
        priceRange: "$$-$$$$",
        currenciesAccepted: "USD",
        inLanguage: "en-US",
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
      }}
    />
  );
}
