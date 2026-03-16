export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Travel Concierge USA — Meet Lina, Your 24/7 AI Travel Planner | Zeniva Travel",
  description:
    "Meet Lina — Zeniva Travel's AI travel concierge. Available 24/7, she builds personalized trip proposals in seconds: flights, hotels, transfers, experiences. The smartest way to plan your next vacation in the USA or anywhere in the world.",
  keywords: [
    "AI travel concierge USA",
    "AI travel planner",
    "Lina AI travel",
    "best AI travel assistant 2025",
    "ChatGPT for travel",
    "AI vacation planner",
    "travel planning AI USA",
    "smart travel planner",
    "AI trip planner",
    "virtual travel concierge",
    "Zeniva Lina AI",
    "automated travel planning",
  ],
  alternates: {
    canonical: "https://www.zenivatravel.com/ai-travel-concierge",
    languages: {
      "en-US": "https://www.zenivatravel.com/ai-travel-concierge",
      "en-CA": "https://www.zenivatravel.com/ai-travel-concierge",
      "fr-CA": "https://www.zenivatravel.com/fr/ai-travel-concierge",
    },
  },
  openGraph: {
    title: "AI Travel Concierge USA — Lina AI Plans Your Dream Trip | Zeniva Travel",
    description:
      "Lina AI builds your perfect trip in seconds — flights, hotels, experiences, transfers. Available 24/7. Zeniva Travel's AI concierge for the USA & Canada.",
    url: "https://www.zenivatravel.com/ai-travel-concierge",
    siteName: "Zeniva Travel",
    type: "website",
    images: [
      {
        url: "/branding/lina-avatar.png",
        width: 1200,
        height: 630,
        alt: "Lina — Zeniva Travel AI Concierge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Travel Concierge USA — Lina AI | Zeniva Travel",
    description:
      "Lina AI builds your dream trip in seconds. 24/7 travel planning for USA, Canada & worldwide.",
    images: ["/branding/lina-avatar.png"],
  },
};

export default function AiTravelConciergePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Zeniva Travel",
        url: "https://zenivatravel.com",
        logo: "https://zenivatravel.com/branding/logo.png",
      },
      {
        "@type": "TravelAgency",
        name: "Zeniva Travel AI",
        url: "https://zenivatravel.com",
        image: "https://zenivatravel.com/branding/lina-avatar.png",
        description:
          "Zeniva Travel is a travel tech company using artificial intelligence to design personalized trips and concierge services.",
        brand: {
          "@type": "Brand",
          name: "Lina AI",
        },
      },
      {
        "@type": "Product",
        name: "Lina AI Travel Concierge",
        description:
          "AI travel concierge: intent discovery, intelligent proposal, and human finalization.",
        brand: {
          "@type": "Brand",
          name: "Zeniva Travel",
        },
        url: "https://zenivatravel.com/ai-travel-concierge",
        image: "https://zenivatravel.com/branding/lina-avatar.png",
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Zeniva Travel AI</p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-black text-slate-900">
          AI Travel Concierge
        </h1>
        <p className="mt-5 text-lg text-slate-600">
          Zeniva Travel is a Travel Tech company using artificial intelligence to design personalized trips.
          Lina AI discovers your intent, creates intelligent travel proposals, and our concierge team validates
          and finalizes every detail.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900">What Lina AI does</h2>
            <ul className="mt-3 space-y-2 text-slate-600">
              <li>• Understands your preferences, budget, and travel style.</li>
              <li>• Builds intelligent itineraries with hotels, villas, and experiences.</li>
              <li>• Coordinates concierge requests with human validation.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900">Why Zeniva Travel</h2>
            <ul className="mt-3 space-y-2 text-slate-600">
              <li>• Travel Tech platform built for AI-assisted concierge experiences.</li>
              <li>• AI + human expertise for high‑touch trip planning.</li>
              <li>• Trusted partner network in Canada and worldwide.</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/chat" className="rounded-full bg-slate-900 px-6 py-3 text-white font-semibold">
            Start with Lina AI
          </Link>
          <Link href="/call" className="rounded-full border border-slate-300 px-6 py-3 text-slate-900 font-semibold">
            Speak to a concierge
          </Link>
        </div>
      </section>
    </main>
  );
}
