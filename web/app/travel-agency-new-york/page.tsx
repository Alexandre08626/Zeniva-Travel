import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const URL_PATH = "/travel-agency-new-york";

export const metadata: Metadata = {
  title: "Travel Agency New York — Lina AI 24/7 | Zeniva",
  description:
    "Zeniva is a New York travel agency powered by Lina AI 24/7. Luxury vacations, all-inclusive packages, yacht charters, custom trips. Direct flights from JFK, LGA, EWR. No booking fees.",
  keywords: [
    "travel agency New York",
    "best travel agency NYC",
    "luxury travel agency New York",
    "AI travel agency NYC",
    "travel agent Manhattan",
    "travel agent Brooklyn",
    "travel concierge NYC",
    "honeymoon travel agency NYC",
    "all inclusive from JFK",
    "vacation packages New York",
    "Zeniva New York",
  ],
  openGraph: {
    title: "Travel Agency New York | Zeniva",
    description: "AI travel agency serving New York 24/7. Luxury vacations, all-inclusive packages, custom trips. Lina AI handles everything.",
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=85",
        width: 1200,
        height: 630,
        alt: "Travel agency New York City",
      },
    ],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function TravelAgencyNewYorkPage() {
  return (
    <SeoPage
      h1="Travel Agency in New York — Lina AI 24/7"
      subtitle="Zeniva is the AI-powered travel agency for New Yorkers. Luxury vacations, all-inclusive packages, yacht charters, custom honeymoons — Lina AI plans and books everything in seconds. Direct flights from JFK, LaGuardia and Newark. Zero booking fees, real human backup 24/7."
      heroImage="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-slate-900/70 to-blue-900/60"
      badge="🗽 New York · USA"
      sections={[
        {
          heading: "Why New Yorkers choose Zeniva",
          content: `<p>Zeniva combines instant AI search with the expertise of senior travel advisors. Lina AI compares live flight inventory across JetBlue, Delta, American, United, plus all-inclusive operators (Apple Vacations, Funjet, Pleasant Holidays) and luxury cruise lines — all in one search. Then a real human verifies the booking before it's confirmed.</p>
<p><strong>Direct flights from:</strong> JFK, LaGuardia (LGA), Newark (EWR), White Plains (HPN), Stewart (SWF). Trips to the Caribbean, Mexico, Europe, Hawaii, Asia — all bookable through Lina.</p>`,
        },
        {
          heading: "Most popular trips for New Yorkers",
          content: `<p><strong>Caribbean all-inclusive:</strong> Punta Cana, Aruba, Turks & Caicos, Cancún. From $1,099 per person for 5 nights including non-stop flight from JFK or EWR.</p>
<p><strong>Europe escapes:</strong> Paris, Rome, Barcelona, Lisbon — direct overnight flights from JFK. Boutique hotels and luxury rail.</p>
<p><strong>Hawaii:</strong> Maui, Oahu, Kauai. Direct from JFK on JetBlue and Delta. Resort + flights packages from $2,499 per person.</p>
<p><strong>Honeymoons:</strong> Maldives, Bora Bora, Santorini, Amalfi Coast — Zeniva's specialty. Lina handles upgrades, romantic touches, ocean-view rooms.</p>
<p><strong>Last-minute getaways:</strong> Bahamas weekend, Bermuda 3-night, Miami long weekend. Bookable in 60 seconds via chat or voice with Lina.</p>
<p><strong>Yacht charters:</strong> private yachts in the Hamptons (East End), Newport, Miami. <a href="/zeniyacht">View ZeniYacht fleet</a>.</p>`,
        },
        {
          heading: "How Zeniva works for NYC clients",
          content: `<p>Step 1: Chat with Lina at <a href="/chat">/chat</a> or call her at <a href="/call">/call</a> 24/7. Tell her where, when, who, budget.</p>
<p>Step 2: Lina returns 3 personalized options in under 30 seconds — flights, hotels, transfers. Real prices from Duffel (flights), LiteAPI (1.5M+ hotels) and curated luxury partners.</p>
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
        { icon: "star", title: "JFK, LGA, EWR direct flights", description: "Caribbean, Europe, Hawaii — non-stop from NYC." },
        { icon: "gift", title: "Zero booking fees", description: "We earn from supplier commissions, not from you." },
        { icon: "shield", title: "In-trip support", description: "Real human reachable from anywhere if anything breaks." },
        { icon: "users", title: "ZeniPay 0% installments", description: "25% deposit, balance through trip date." },
        { icon: "anchor", title: "Hamptons yacht charters", description: "Private yacht charters East End and Newport summer." },
      ]}
      faqs={[
        { question: "Is Zeniva a real travel agency in New York?", answer: "Yes. Zeniva LLC is incorporated in Delaware and operates throughout the US. We serve New York travelers from all five boroughs, Long Island, the Hudson Valley and the Hamptons." },
        { question: "What flights can I book through Zeniva?", answer: "Every airline that publishes inventory through Duffel — JetBlue, Delta, American, United, Lufthansa, KLM, Air France, British Airways, etc. Plus low-cost carriers like Spirit, Frontier, Avianca. Direct flights from JFK, LGA, EWR are highlighted first." },
        { question: "Do you handle honeymoons and luxury trips?", answer: "Yes — Zeniva specializes in luxury vacations and honeymoons. Lina sources private villas, ocean-view suites, butler service, and chef-prepared dinners. Free room upgrades when available." },
        { question: "What if I need to cancel?", answer: "Standard supplier cancellation policies apply (varies by airline / hotel). Zeniva handles the cancellation paperwork on your behalf. Travel insurance available at checkout." },
        { question: "Do you sell travel insurance?", answer: "Yes — Allianz Global Assistance and Travel Guard available at checkout. Lina recommends the right policy based on your destination and trip cost." },
      ]}
      ctaText="Plan my NYC trip with Lina"
      ctaPrompt="I'm in New York, I want to plan a trip"
      internalLinks={[
        { label: "Travel Agency Virginia", href: "/travel-agency-virginia" },
        { label: "All-Inclusive Packages", href: "/packages/all-inclusive" },
        { label: "Hamptons Yacht Charters", href: "/zeniyacht" },
        { label: "Honeymoons", href: "/honeymoons" },
        { label: "Cruises", href: "/services/cruises" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        name: "Zeniva Travel — New York",
        description: "AI-powered travel agency serving New York 24/7.",
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
